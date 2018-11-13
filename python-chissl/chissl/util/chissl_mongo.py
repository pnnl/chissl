#   BSD License:
  
#   CHISSL: Interactive Machine Learning
  
#   Copyright © 2018, Battelle Memorial Institute
  
#   All rights reserved.
  
#   1. Battelle Memorial Institute (hereinafter Battelle) hereby grants permission
#      to any person or entity lawfully obtaining a copy of this software and
#      associated documentation files (hereinafter “the Software”) to redistribute
#      and use the Software in source and binary forms, with or without 
#      modification.  Such person or entity may use, copy, modify, merge, publish,
#      distribute, sublicense, and/or sell copies of the Software, and may permit
#      others to do so, subject to the following conditions:
#      * Redistributions of source code must retain the above copyright notice,
#        this list of conditions and the following disclaimers.
#      * Redistributions in binary form must reproduce the above copyright notice,
#        this list of conditions and the following disclaimer in the documentation
#        and/or other materials provided with the distribution.
#      * Other than as used herein, neither the name Battelle Memorial Institute
#        or Battelle may be used in any form whatsoever without the express
#        written consent of Battelle. 
  
#   2. THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
#      AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
#      THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
#      PURPOSEARE DISCLAIMED. IN NO EVENT SHALL BATTELLE OR CONTRIBUTORS BE LIABLE
#      FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
#      DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
#      SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
#      CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
#      LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
#      OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
#      DAMAGE.

import bson
from pymongo import MongoClient
import gridfs

import json, pickle, datetime
from bson.binary import Binary

from sklearn.pipeline import Pipeline
from sklearn.svm import SVC
from sklearn.cluster import AgglomerativeClustering

import numpy as np
import pandas as pd

import pydoc

from collections import defaultdict

from scipy.spatial.distance import cdist

from umap import UMAP

def get_cost(X, children):

    n = len(X) + len(children)

    X_tot = np.zeros((n, X.shape[1]))
    X_tot[:len(X)] = X

    N = np.zeros(n)
    N[:len(X)] = 1

    C = np.zeros(n)

    for i,(u,v) in enumerate(children):
        p = i + len(X)

        X_tot[p] = X_tot[u] + X_tot[v]
        N[p] = N[u] + N[v]

        xu = X_tot[u]/N[u]
        xv = X_tot[v]/N[v]
        xp = X_tot[p]/N[p]

        C[u], C[v] = cdist([xp], [xu, xv]).flat
        
    return C

def cluster(X, **kwargs):
    children = AgglomerativeClustering(**kwargs)\
        .fit(X)\
        .children_

    n = len(X)
    m = len(children)

    left, right = children.T
    parents = np.arange(n + m)
    parents[left] = parents[right] = np.arange(m) + n

    return parents, get_cost(X, children)

def from_str(s):
    if type(s) is str:
        if s == '':
            return {}
        else:
            return json.loads(s) or {}
    return s

class ChisslMongo(object):
    def __init__(self, url=None, db='chissl', verbose=False):
        self.verbose = verbose

        self.client = MongoClient(url)
        self.db = self.client[db]
        self.transduction_ = gridfs.GridFS(self.client[f'{db}_transduction_'])

    def create_collection(self, collection, docs, drop=False):
        if drop:
            self.db[collection].delete_many({})

        return self.db[collection].insert_many(docs)
    
    def create_component(self, _id, component=None, **kwargs):
        '''
        A component is the association of a React visualization component with pre-defined props
        '''
        if drop:
            self.db.components_.\
                delete_one({'_id': _id})

        obj = {'_id': _id,
               'component': component or _id,
               'props': kwargs}

        self.db.components_\
            .insert_one(obj)

        return obj
        
    def create_application(self, _id, collection, component, pipeline, props={}, params={}, drop=False):
        '''
        An application is an association of a collection (raw data), a component (visualization)
        and a pipeline (data transformation)
        '''
        if drop:
            self.db.applications_\
                .delete_one({'_id': _id})

        obj = {
            '_id': _id,
            'collection': collection,
            'component': component,
            'pipeline': pipeline,
            'props': props,
            'params': params
        }

        self.db.applications_\
            .insert_one(obj)
        
        return obj
    
    def create_model(self, applicationName, model='default', query=None, project=None, labels={}, transduction={}, colors={}, drop=False):
        '''
        Creates a trained model by querying the corresponding collection and fitting
        the corresponding pipeline for the application. Clustering is also run and the
        resulting dendrogram and fitted is stored in the _models collection.
        '''

        query = from_str(query)
        project = from_str(project)


        # convert labels to tokens
        tokens = defaultdict(lambda : len(tokens))
        token_labels = {k: tokens[v] for k, v in transduction.items()}

        if self.verbose:
            print(f'Finding application <{applicationName}>', end='...', flush=True)

        application = self.db.applications_\
            .find_one({'_id': applicationName})

        if application:

            # pipelineName = application['pipeline']

            # if self.verbose:
            #     print(f'OK\nFinding pipeline <{pipelineName}>', end='...', flush=True)

            # pipeline = self.db.pipelines_\
            #     .find_one({'_id': pipelineName})

            collectionName = application['collection']
            collection = self.db[collectionName]

            if self.verbose:
                print(f'OK\nQuerying collection <{collectionName}> <{query}>', end='...', flush=True)

            X = list(collection.find(query or {}))


            if len(X):
                print(f'found {len(X)}...OK')

                y = [token_labels.get(xi['_id'], -1) for xi in X]
                index = [x['_id'] for x in X]

                if self.verbose:
                    print('Transforming data', end='...', flush=True)

                umap = UMAP()
                base_pipeline = pydoc.locate(application['pipeline'])
                pipeline = Pipeline(base_pipeline.steps + [('umap', umap)])\
                    .set_params(**application.get('params', {}))
                
                X_transform = pipeline.fit_transform(X, y)

                if self.verbose:
                    print('OK\nClustering data', end='...', flush=True)

                parents, costs = cluster(X_transform,
                                         connectivity=umap.graph_,
                                         linkage='ward')

                if self.verbose:
                    print('OK')


                obj_computed = {
                   'pipeline': Binary(pickle.dumps(pipeline)),
                   'parents': parents.tolist(),
                   'costs': costs.tolist(),
                   'instances': index,
                   'X': X_transform.tolist(),
                   'tokens': sorted(tokens, key=tokens.get),
                }

                if project and project != {}:
                    if self.verbose:
                        print(f'Projecting data for histograms {project}', end='...', flush=True)
                    data = collection.aggregate([
                        {'$match': {'_id': {'$in': index}}},
                        {'$project': project}
                    ])

                    df = pd.DataFrame(list(data))\
                        .set_index('_id')\
                        .loc[index]

                    obj_computed['hist'] = df.fillna(df.median(axis=0))\
                        .to_dict(orient='list')

                    if self.verbose:
                        print('OK')

                obj = {
                    '_id': {'application': applicationName,
                            'model': model},
                    'labels': labels,
                    'colors': colors,
                    'date': datetime.datetime.utcnow(),
                    'query': json.dumps(query, indent=2),
                    'project': json.dumps(project, indent=2),
                    'size': len(index),
                    '_id_computed': self.transduction_.put(bson.BSON.encode(obj_computed))
                }

                if drop:
                    for doc in self.db.transduction_.find({'_id': obj['_id']}):
                        self.transduction_.delete(doc['_id_computed'])
                        self.db.transduction_.delete_one({'_id': doc['_id']})

                self.db.transduction_\
                    .insert_one(obj)

                if self.verbose:
                    print('done.')

                obj.update(obj_computed)

                return obj

    def deploy(self, application, model, labels, Classifier=SVC, drop=False):
        doc = self.get_transduction_model(application, model)

        _id = {'application': application,
               'model': model}

        if doc:
            index = doc['instances']
            
            y = pd.Series(labels)\
                .loc[set(index).intersection(labels)]

            X = pd.DataFrame(doc['X'], index=index)\
                .loc[y.index]
            
            clf = Classifier().fit(X, y)
            
            pipeline = Pipeline(pickle.loads(doc['pipeline']).steps + [('clf', clf)])
            
            obj = {'_id': _id,
                   'date': datetime.datetime.utcnow(),
                   'pipeline': Binary(pickle.dumps(pipeline))}
            
            if drop:
                self.db.induction_\
                    .delete_one({'_id': _id})
            
            self.db.induction_\
                .insert_one(obj)
            
            return pipeline

    def patch_model(self, application, model, **data):
        _id = {'application': application,
               'model': model}

        return self.db.transduction_.find_one_and_update(
            {'_id': _id},
            {'$set': data},
            return_document=True
        )

    def summarize_models(self, collection, application):
        return self.db[collection].aggregate([
            {'$match': {'_id.application': application}},
            {'$project': {'_id': '$_id.model',
                          'date': True,
                          'query': True,
                          'project': True,
                          'size': True}}
        ])

    def list_applications(self):
        return self.db.applications_.find()

    def list_transduction_models(self, application):
        return self.summarize_models('transduction_', application)

    def list_induction_models(self, application):
        return self.summarize_models('induction_', application)

    def get_transduction_model(self, application, model):
        _id = {'application': application,
               'model': model}

        doc = self.db.transduction_.find_one({'_id': _id})
        doc_computed = self.transduction_.get(doc['_id_computed'])
        doc.update(bson.BSON.decode(doc_computed.read()))
        del doc['_id_computed']

        return doc

    def get_induction_model(self, application, model):
        _id = {'application': application,
               'model': model}

        obj = self.db.induction_.find_one({'_id': _id})

        if obj:
            return pickle.loads(obj['pipeline'])

    def get_data(self, collection, _id):
        return self.db[collection].find_one({'_id': _id})
