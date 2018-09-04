import pandas as pd

from sklearn.pipeline import Pipeline
from sklearn.base import TransformerMixin, BaseEstimator

from sklearn.decomposition import NMF

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
    return pd.DataFrame([pd.DataFrame(x['data']).groupby(['hour', 'category']).size()
                         for x in docs]).fillna(0)

# perhaps matrix factorization could be useful here?

pipeline = Pipeline([
  ('vast', VASTTransformer()),
  ('nmf', NMF(n_components=24))
])
