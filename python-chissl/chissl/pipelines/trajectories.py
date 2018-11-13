
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

from sklearn.pipeline import Pipeline
from sklearn.base import TransformerMixin, BaseEstimator
from sklearn.preprocessing import Normalizer, StandardScaler
from sklearn.decomposition import NMF

from scipy.spatial.distance import pdist
from scipy.interpolate import interp1d

class TrackometryTransformer(TransformerMixin, BaseEstimator):
    def __init__(self,
                 n_components=20,
                 coordinates='coordinates',
                 timestamps=None,
                 seconds=None,
                 start=None,
                 end=None,
                 noise=0
    ):
        self.coordinates = coordinates
        self.timestamps = timestamps
        self.seconds = seconds
        self.n_components = n_components
        self.start = start
        self.end = end
        self.noise = noise

    def get_params(self, deep=False):
      return dict(coordinates=self.coordinates,
                  timestamps=self.timestamps,
                  seconds=self.seconds,
                  n_components=self.n_components,
                  start=self.start,
                  end=self.end,
                  noise=self.noise)

    def set_params(self, **kwargs):
      self.__init__(**kwargs)
      return self

    def fit(self, X, y=None):
        return self
        
    def transform(self, X):
        return [self.extract(xi) for xi in X]

    def extract(self, doc):

        if self.timestamps:
            index = pd.DatetimeIndex(doc[self.timestamps])
            t = (index - index[0]).total_seconds()
        elif self.seconds:
            t = np.array(doc[self.seconds])
        else:
            t = np.arange(len(doc))

        t = (t - t[0])/(t[-1] - t[0])
        values = np.array(doc[self.coordinates])

        F = [interp1d(t, v, kind='linear')
             for v in values.T]

        t_small = np.linspace(0, 1, self.n_components)

        return np.vstack([f(t_small) for f in F]).T


class DistanceGeometry(TransformerMixin, BaseEstimator):
    def __init__(self, metric='euclidean', p=None, w=None, V=None, VI=None):
        self.metric = metric
        self.p = p
        self.w = w
        self.V = V
        self.VI = VI

    def get_params(self, deep=False):
        return dict(
            metric=self.metric,
            p=self.p,
            w=self.w,
            V=self.V,
            VI=self.VI
        )

    def set_params(self, **kwargs):
        return self.__init__(**kwargs)

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        kwargs = self.get_params()

        def distance(xi):
            d = pdist(xi, **kwargs)
            return d/d.max()

        return np.vstack([distance(xi) for xi in X])


pipeline = Pipeline([
    ('extract', TrackometryTransformer()),
    ('geom', DistanceGeometry()),
])