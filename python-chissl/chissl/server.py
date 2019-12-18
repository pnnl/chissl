
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

import os, json, sys
from flask import Flask, jsonify, request

#sys.path.insert(0, 'util')
# import importlib
# module = importlib.load_module('folder.filename')
# module.function()


if __package__ is None or __package__ == '':
    # uses current directory visibility
    import chissl_mongo as cm
else:
    # uses current package visibility
    from . import chissl_mongo as cm

from functools import lru_cache

def as_dict(li):
    return {x['_id']: x for x in li}

def start_app(app, mongo, **kwargs):
    chissl = cm.ChisslMongo(mongo, verbose=kwargs['debug'])

    @app.route('/api/applications/', methods=['GET'])
    def list_applications():
        return jsonify(as_dict(chissl.list_applications()))

    @app.route('/api/applications/<application>/', methods=['GET'])
    def list_transduction_models(application):
        return jsonify(transduction=as_dict(chissl.list_transduction_models(application)),
                       induction=as_dict(chissl.list_induction_models(application)))

    @app.route('/api/applications/<application>/transduction/', methods=['GET', 'POST'])
    def create_transduction_model(application):
        if request.method == 'POST':
            kwargs = request.get_json() or {}

            for k in ['project', 'query']:
                if kwargs.get(k) not in {None, ''}:
                    kwargs[k] = json.loads(kwargs[k])

            chissl.create_model(application, **kwargs)

        return jsonify(as_dict(chissl.list_transduction_models(application)))

    @app.route('/api/applications/<application>/transduction/<model>', methods=['GET', 'PATCH'])
    def get_transduction_model(application, model):

        if request.method == 'GET':
            obj = chissl.get_transduction_model(application, model)
        elif request.method == 'PATCH':
            data = request.get_json() or {}
            if 'transduction' in data:
                obj = chissl.create_model(application, model, drop=True, **data)
            else:   
                obj = chissl.patch_model(application, model, **data)

        obj['_id_computed'] = obj['pipeline'] = None

        return jsonify(obj)

    deployed = {}

    @app.route('/api/applications/<application>/induction/', methods=['POST', 'GET'])
    def deploy_model(application):
        if request.method == 'POST':
            data = request.get_json() or {}
            print(data)

            model = data['model']
            labels = data['labels']
            deployed[application, model] = chissl.deploy(application, model, labels, drop=True)

        return jsonify(as_dict(chissl.list_induction_models(application)))

    @app.route('/api/applications/<application>/induction/<model>', methods=['POST'])
    def predict(application, model):
        if (application, model) not in deployed:
            deployed[application, model] = chissl.get_induction_model(application, model)
            
        pipeline = deployed[application, model]

        if pipeline:
            X = request.get_json().get('X', [])
            y = pipeline.predict(X)

            return jsonify(y=y.tolist())

    @app.route('/api/data/<collection>/<_id>')
    def get_data(collection, _id):
        return jsonify(chissl.get_data(collection, _id))

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

    app = Flask(__name__)
    app.secret_key = os.urandom(2557555)

    start_app(app, **args)
