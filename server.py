
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

import os, json, glob, datetime
from functools import lru_cache

import flask
from pymongo import MongoClient

import pandas as pd
import numpy as np

from util.cluster import mask_tree

DATA_PATH = 'clusters'

def start_app(app, mongo, **kwargs):
    client = MongoClient(mongo)

    print(client.database_names())

    @lru_cache()
    def describe_dataset(dataset):
        db = client[dataset]

        return { 'models': db.clusters.distinct('_id'),
                 'instances': db.instances.count(),
                 'example': (db.instances.find_one() or {}).get('_id'),
                 'tags': db.instances.distinct('tags'),
                 'props':  (db.clusters.find_one() or {}).get('props', {})}

    def summarize_dataset(dataset):
        doc = describe_dataset(dataset).copy()
        doc['tags'] = len(doc['tags'])
        return doc

    @lru_cache(maxsize=1)
    def load_model(dataset, model):
        doc = client[dataset].clusters.find_one({'_id': model}) or {}

        for k in ['parents', 'costs', 'instances']:
            doc[k] = np.array(doc[k])

        return doc

    def get_dendrogram(dataset, model, tags, labels):

        t = datetime.datetime.now()
        print('Querying', dataset, '...', flush=True)

        data = load_model(dataset, model).copy()
        collection = client[dataset].instances

        result = collection.find({'$and': [{'tags': {'$in': list(tags)}} if len(tags) else {},
                                           {'_id': {'$in': data['instances'].tolist()}}]})

        ids =  set(result.distinct('_id'))
        mask = np.array([i in ids or i in labels
                         for i in data['instances']])
        parents, mask2 = mask_tree(data['parents'], mask)

        data.update({
            'parents'   : parents.tolist(),
            'costs'     : data['costs'][mask2].tolist(),
            'instances' : data['instances'][mask].tolist(),
            'tags'      : describe_dataset(dataset)['tags'],
        })

        if 'hist' in data:
            data['hist'] = pd.DataFrame(data['hist'])\
                [mask]\
                .to_dict(orient='list')

        return data

    def from_str(s, delimiter=','):
        return set(s.split(delimiter)) if s else set()

    @app.route('/api/')
    def list_datasets():
        doc = { dataset: summarize_dataset(dataset)
                for dataset in client.database_names()
                if dataset.startswith('chissl_') and client[dataset].clusters.count() and client[dataset].instances.count() }

        return flask.jsonify(doc)

    @app.route('/api/<dataset>')
    def get_dataset_details(dataset):
        return flask.jsonify(describe_dataset(dataset))

    @app.route('/api/<dataset>/models/<model>')
    def get_dataset(dataset, model):
        tags = from_str(flask.request.args.get('tags'))
        labels = from_str(flask.request.args.get('labels'))
        return flask.jsonify(get_dendrogram(dataset, model, tags, labels))

    @app.route('/api/<dataset>/data/<collection>/<_id>')
    def get_by_id(dataset, collection, _id):
        return flask.jsonify(client[dataset][collection].find_one({'_id': _id}))

    app.run(threaded=True, **kwargs)

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('-p','--port', help='port', default=8891, type=int)
    parser.add_argument('-d','--debug', default=False, help='run as debug', action='store_true')
    parser.add_argument('-m','--mongo', default=None, help='URL for MongoDB')
    parser.add_argument('-o','--host', default=None, help='Host')

    args = vars(parser.parse_args())

    print( ' * starting app')
    print( '   *', args)

    app = flask.Flask(__name__)
    app.secret_key = os.urandom(2557555)

    start_app(app, **args)
