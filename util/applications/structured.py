import pandas as pd

from sklearn.pipeline import Pipeline
from sklearn.base import TransformerMixin
from sklearn.preprocessing import StandardScaler

class FeatureExtractor(TransformerMixin):
    def __init__(self, field):
        self.field = field
        
    def fit(self, X, y=None):
        return self
        
    def transform(self, X):
        return pd.DataFrame([xi[self.field] for xi in X]).values

pipeline = Pipeline([
    ('extract', FeatureExtractor(field='features')),
    ('nmf', StandardScaler()),
])
