import numpy as np

from sklearn.pipeline import Pipeline
from sklearn.base import TransformerMixin
from sklearn.decomposition import NMF
from sklearn.preprocessing import Normalizer, StandardScaler

from umap import UMAP

class JSONFeatureExtractor(TransformerMixin):
    def __init__(self, field):
        self.field = field
        
    def fit(self, X, y=None):
        return self
        
    def transform(self, X):
        return np.vstack([xi[self.field] for xi in X]).astype(np.float)

SimplePipeline = Pipeline([
    ('extract', JSONFeatureExtractor(field='features')),
    ('norm', StandardScaler()),
    ('umap', UMAP())
])
