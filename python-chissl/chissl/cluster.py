
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

import datetime

from collections import defaultdict

import numpy as np

from sklearn.neighbors import kneighbors_graph
from sklearn.cluster import AgglomerativeClustering

from scipy.spatial.distance import cdist

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

def cluster_data(X, knn=7, **kwargs):
    n = len(X)

    kwargs = {}

    if knn:
        t = datetime.datetime.now()
        print('Connectivity', '...', flush=True)

        kwargs['connectivity'] = kneighbors_graph(X, n_neighbors=min(n - 1, knn))

        dt = (datetime.datetime.now() - t).total_seconds()
        print('Done in ', dt, flush=True, end='\n\n')

    t = datetime.datetime.now()
    print('Clustering', '...', flush=True)

    merges = AgglomerativeClustering(**kwargs)\
        .fit(X)\
        .children_

    costs = get_cost(X, merges)

    parents = np.arange(n + len(merges), dtype='int')
    for i,(left,right) in enumerate(merges):
        # set the left & right parents as usual
        parents[left] = parents[right] = i + n

    dt = (datetime.datetime.now() - t).total_seconds()
    print('Done in ', dt, flush=True, end='\n\n')

    return parents, costs

def cluster_data_linkage(X, **kwargs):
    # from scipy.cluster.hierarchy import linkage
    from fastcluster import linkage

    n = len(X)

    t = datetime.datetime.now()
    print('Clustering', '...', flush=True)

    Z = linkage(X, **kwargs)
    merges = Z[:,:2].astype('int')
    costs = get_cost(X, merges)

    parents = np.arange(n + len(Z))
    for i,(left,right) in enumerate(merges):
        # set the left & right parents as usual
        parents[left] = parents[right] = i + n

    dt = (datetime.datetime.now() - t).total_seconds()
    print('Done in ', dt, flush=True, end='\n\n')

    return parents, costs

def cluster_without_dupes(X, knn=None, **kwargs):
    n = len(X)

    uniques = defaultdict(list)
    for i,xi in enumerate(X):
        uniques[tuple(xi)].append(i)
        
    iis = [v[0] for v in uniques.values()]

    # construct a smaller X to cluster
    X_unique = X[iis]
    n_copies = n - len(X_unique)
    n_unique = len(X_unique)

    print('%d%%'%(100*n_copies//n), 'are duplicates.', flush=True)

    if knn:
        parents_unique, costs_unique = cluster_data(X_unique, knn=knn, **kwargs)
    else:
        parents_unique, costs_unique = cluster_data_linkage(X_unique, **kwargs)

    print('Adjusting...', flush=True)

    parents_dupe = np.zeros(len(X), dtype='int')
    for i,v in enumerate(uniques.values()):
        parents_dupe[v] = i

    parents = np.hstack((parents_dupe, parents_unique)) + n
    costs = np.hstack((np.zeros(n), costs_unique))

    return parents, costs

def mask_tree(parents, mask):
    counts = np.zeros(len(parents), dtype='int')
    counts[np.flatnonzero(mask)] = 1

    for i,j in enumerate(parents):
        counts[j] += counts[i]

    mask2 = counts > 0

    # this is how many nodes before each element are to be deleted
    shift = np.cumsum(~mask2)

    return (parents - shift[parents])[mask2], mask2

def from_dataframe(df, remove_dupes=False, **kwargs):

    if remove_dupes:
        parents, costs = cluster_without_dupes(df.values, **kwargs)
    else:
        parents, costs = cluster_data_linkage(df.values, **kwargs)
        
    return {'instances': df.index.tolist(),
            'parents': parents.astype('int').tolist(),
            'costs': costs.tolist()}
