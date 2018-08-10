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

from pymongo import MongoClient
import json, pickle, datetime
from bson.binary import Binary

import numpy as np
import pandas as pd

from fastcluster import linkage

def cluster(X, **kwargs):
    Z = linkage(X, method='ward')
    n = len(X)
    m = len(Z)

    left, right = Z[:,:2].astype('int').T
    dist = Z[:, 2]

    parents = np.arange(n + m)
    costs = np.zeros(n + m)

    parents[left] = parents[right] = np.arange(m) + n
    costs[left] = costs[right] = dist

    return parents, costs

class ChisslMongo(object):
    def __init__(self, url=None, db='chissl', verbose=False):
        self.db = MongoClient(url)[db]
        self.verbose = verbose

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
        
    def create_pipeline(self, _id, pipeline, drop=False):
        '''
        A pipeline is a scikit-learn pipeline that takes raw data and
        '''
        if drop:
            self.db.pipelines_\
                .delete_one({'_id': _id})

        obj = {'_id': _id,
               'pipeline': Binary(pickle.dumps(pipeline))}

        self.db.pipelines_\
            .insert_one(obj)

        return obj
        
    def create_application(self, _id, collection, component, pipeline, drop=False):
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
            'pipeline': pipeline
        }

        self.db.applications_\
            .insert_one(obj)
        
        return obj
    
    def create_model(self, applicationName, modelName, query={}, project={}, labels={}, drop=False):
        '''
        Creates a trained model by querying the corresponding collection and fitting
        the corresponding pipeline for the application. Clustering is also run and the
        resulting dendrogram and fitted is stored in the _models collection.
        '''

        if self.verbose:
            print(f'Finding application <{applicationName}>', end='...', flush=True)

        application = self.db.applications_\
            .find_one({'_id': applicationName})

        if application:

            pipelineName = application['pipeline']

            if self.verbose:
                print(f'OK\nFinding pipeline <{pipelineName}>', end='...', flush=True)

            pipeline = self.db.pipelines_\
                .find_one({'_id': pipelineName})

            if pipeline:

                collectionName = application['collection']
                collection = self.db[collectionName]

                if self.verbose:
                    print(f'OK\nQuerying collection <{collectionName}>', end='...', flush=True)

                
                X = list(collection.find(query))

                if len(X):
                    print(f'found {len(X)}...OK')

                    y = [labels.get(xi['_id'], -1) for xi in X]
                    index = [x['_id'] for x in X]

                    hist = None
                    if project:
                        if self.verbose:
                            print('Projecting data for histograms', end='...')
                        data = collection.aggregate([
                            {'$match': {'_id': {'$in': index}}},
                            {'$project': project}
                        ])

                        hist = pd.DataFrame(list(data))\
                            .set_index('_id')\
                            .loc[index]\
                            .to_dict(orient='list')

                        if self.verbose:
                            print('OK')

                    if self.verbose:
                        print('Transforming data', end='...', flush=True)

                    model = pickle.loads(pipeline['pipeline'])
                    X_transform = model.fit_transform(X, y)

                    parents, costs = cluster(X_transform, method='ward')

                    obj = {'_id': {'application': applicationName,
                                   'model': modelName},
                           'date': datetime.datetime.utcnow(),
                           'query': query,
                           'project': project,
                           'labels': labels,
                           'hist': hist,
                           'pipeline': Binary(pickle.dumps(model)),
                           'parents': parents.tolist(),
                           'costs': costs.tolist(),
                           'instances': index,
                           'X': X_transform.tolist()}

                    if drop:                    
                        if self.verbose:
                            print('dropping', end='...', flush=True)

                        self.db.transduction_.delete_one({'_id': obj['_id']})

                    self.db.transduction_\
                        .insert_one(obj)

                    if self.verbose:
                        print('OK\ndone.')

                    return obj

    def get_applications(self):
        return list(self.db._applications.find())
