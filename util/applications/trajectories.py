import numpy as np
import pandas as pd

from sklearn.pipeline import Pipeline
from sklearn.base import TransformerMixin, BaseEstimator
from sklearn.preprocessing import Normalizer, StandardScaler
from sklearn.decomposition import NMF

from scipy.spatial.distance import pdist
from scipy.interpolate import interp1d

from umap import UMAP

def distance_geom(df, n=20, **kwargs):
    t = (df.index - df.index[0]).total_seconds()
    
    func = interp1d(t/t[-1], df.values.T, **kwargs)

    xi = pdist(func(np.linspace(0, 1, n)).T)
    return xi/xi.max()

class TrackometryTransformer(TransformerMixin, BaseEstimator):
    def __init__(self, n_components=20, coordinates='coordinates', timestamps='timestamps', start=None, end=None):
        self.coordinates = coordinates
        self.timestamps = timestamps
        self.n_components = n_components
        self.start = start
        self.end = end

    def get_params(self, deep=False):
      return dict(coordinates=self.coordinates,
                  timestamps=self.timestamps,
                  n_components=self.n_components,
                  start=self.start,
                  end=self.end)

    def set_params(self, **kwargs):
      self.__init__(**kwargs)
      return self
        
    def fit(self, X, y=None):
        return self
        
    def transform(self, X):
        return np.vstack(map(self.distance_geom, X))

    def distance_geom(self, doc):

        df = pd.DataFrame(doc[self.coordinates],
                          index=pd.DatetimeIndex(doc[self.timestamps]))\
          .iloc[self.start:self.end]

        t = (df.index - df.index[0]).total_seconds()
        t = t/t[-1]

        F = [interp1d(t, values, kind='linear')
             for values in df.values.T]

        t_small = np.linspace(0, 1, self.n_components)

        xi = pdist(np.vstack([f(t_small) for f in F]).T)
        return xi/xi.max()

pipeline = Pipeline([
  ('geom', TrackometryTransformer()),
  # ('nmf', NMF(n_components=50)),
  ('norm', StandardScaler()),
  # ('norm', Normalizer('l1')),
])