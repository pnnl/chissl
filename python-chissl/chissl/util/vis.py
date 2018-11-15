import numpy as np
import pandas as pd
import networkx as nx
import matplotlib.pyplot as plt

from sklearn.cluster import KMeans
from sklearn.neighbors import KDTree

from scipy.spatial.distance import cdist, pdist, squareform
from scipy.stats import pearsonr

from matplotlib.collections import PolyCollection

default_scatter_args = dict(color='darkgray', s=10)

def sequential_addition(X, r, order=None):
    tree = KDTree(X, metric='euclidean')
    D, _ = tree.query(X, 10)
    order = order or D[:, 1:].mean(axis=1).argsort()
    
    visited = np.zeros(len(X), dtype=np.bool)

    for i in order:
        if not visited[i]:
            yield i
            iis, = tree.query_radius([X[i]], r, return_distance=False)
            visited[iis] = True

def subplots_scatter(pos, s=.05, scatter_args=default_scatter_args):

    fig = plt.gcf()
    ax = plt.gca()
    
    ax.scatter(*pos.values.T, **scatter_args)

    size = np.array([s, s])
    radius = s*2**.5
    
    inv = fig.transFigure.inverted()

    pos_fig = pd.DataFrame(np.vstack([inv.transform(ax.transData.transform(xi)) for xi in pos.values]), index=pos.index)


    iis = list(sequential_addition(pos_fig.values, radius))
    dist, nei = KDTree(pos_fig.values[iis], metric='euclidean')\
        .query(pos_fig.values)
    ser = pd.Series(dist.flatten(), index=pos.index)
    
    for _, x in ser.groupby(nei.flatten()):
        iis = x.sort_values().index
        
        center = np.atleast_2d(pos_fig.loc[iis[0]].values).mean(axis=0)
        rect = np.hstack((center - size/2, size))
        
        yield iis, fig.add_axes(rect)
        
def get_feature_order(X, eps=.25):
    A = squareform(pdist(X.T, metric=lambda x, y: pearsonr(x, y)[0]))
    A[A < eps] = 0
    
    G = nx.relabel_nodes(nx.from_numpy_array(A), {i:s for i,s in enumerate(X.columns)})
    return nx.spectral_ordering(G)

def radar_plot(X, ax=None, circle_props=dict(facecolor='white', edgecolor='lightgray'), labels=None, **kwargs):
    ax = ax or plt.gca()
    theta = np.linspace(0, 2*np.pi, X.shape[1] + 1)[:-1]

    polys = PolyCollection([np.vstack((xi*np.cos(theta), xi*np.sin(theta))).T
                            for xi in X], zorder=1, **kwargs)
    
    ax.add_artist(plt.Circle((0, 0), 1, zorder=0, **circle_props))

    ax.add_collection(polys)

    if labels is not None:
        for s, t in zip(labels, theta):
            ax.annotate(s, 1.1*np.array([np.cos(t), np.sin(t)]), ha='center', va='center')

    return polys

def keywords_plot(words, title, colors={}, ax=None):
    ax = ax or plt.gca()

    ax.annotate('\n'.join(words),
                (.5, .99),
                color=colors.get(title, 'k'),
                ha='center', va='top')

    plt.title(title)
    plt.axis('off')

def each_spine(ax):
    for s in ['top', 'bottom', 'left', 'right']:
        yield ax.spines[s]    