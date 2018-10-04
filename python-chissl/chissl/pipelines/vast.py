import pandas as pd
import numpy as np

from sklearn.pipeline import Pipeline
from sklearn.base import TransformerMixin, BaseEstimator

from sklearn.decomposition import NMF

from itertools import product

categories = [
  'Apartment',
  'Coffee',
  'Dining',
  'GASTech',
  'Gas',
  'Home',
  'Industrial',
  'Lodging',
  'Public',
  'Recreation',
  'Shopping'
]

n_hours = 12

class VASTTransformer(TransformerMixin, BaseEstimator):
    def __init__(self, **kwargs):
      pass

    def get_params(self, **kwargs):
      return {}

    def set_params(self, **kwargs):
      self.__init__(**kwargs)
      return self

    def fit(self, *args, **kwargs):
      return self

    def transform(self, docs):
        features = list(product(range(n_hours), categories))

        def transform_document(doc):
            counts = {(hour, category): count
                      for hour, category, count in doc}
            
            return [counts.get(k, 0) for k in features]

        return np.array([transform_document(doc['hour_category']) for doc in docs])


pipeline = Pipeline([
  ('vast', VASTTransformer()),
  ('nmf', NMF(n_components=24))
])
