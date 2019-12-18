
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

import numpy as np
import pandas as pd

from sklearn.decomposition import NMF

import networkx as nx
from scipy.stats import pearsonr
from scipy.spatial.distance import pdist, squareform

from . import cluster

def get_features(client, dataset, X, y):
    cols = y.columns[y.dtypes == object]
    return [{'_id': i, 'data': xi, 'target': yi, 'tags': list(yi.values())}
            for i,xi, yi in zip(X.index,
                                X.to_dict(orient='records'),
                                y.loc[X.index, cols].to_dict(orient='records'))]

def insert_features(client, dataset, X, y, drop=False):
    docs = get_features(client, dataset, X, y)
    
    if drop:
        client[dataset].instances.delete_many({})
    
    client[dataset].instances.create_index('tags')
    client[dataset].instances.insert_many(docs)

def get_feature_order(X, eps=.25):
    A = squareform(pdist(X.T, metric=lambda x, y: pearsonr(x, y)[0]))
    A[A < eps] = 0
    
    G = nx.relabel_nodes(nx.from_numpy_array(A), {i:s for i,s in enumerate(X.columns)})
    return nx.spectral_ordering(G)

def get_model(X, y=None, model=None, percentiles=[.25, .75], lower='min', upper='max', **kwargs):
    if model is None:
        model = NMF(n_components=int(np.ceil(X.shape[1]**.5))).fit(X)

    X_norm = pd.DataFrame(model.transform(X),
                          index=X.index)
    obj = cluster.from_dataframe(X_norm, **kwargs)

    descr = X[get_feature_order(X)].describe(percentiles=percentiles).T
    domains = [{'name': k, 'domain': [s[lower], s[upper]]}
               for k, s in descr.iterrows()]

    obj['props'] = {'domains': domains}

    if y is not None:
        obj['hist'] = y.loc[X.index].to_dict(orient='list')
    
    return obj

def insert_model(client, dataset, name, X, y, drop=False, **kwargs):
    if drop:
        client[dataset].clusters.delete_one({'_id': name})
        
    obj = get_model(X, y, **kwargs)
    obj['_id'] = name
    
    client[dataset].clusters.insert_one(obj)
