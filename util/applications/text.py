import numpy as np

from sklearn.pipeline import Pipeline
from sklearn.base import TransformerMixin
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import NMF
from sklearn.preprocessing import Normalizer, StandardScaler

import nltk
from nltk.stem.porter import PorterStemmer

from umap import UMAP

class JSONFeatureExtractor(TransformerMixin):
    def __init__(self, field):
        self.field = field
        
    def fit(self, X, y=None):
        return self
        
    def transform(self, X):
        return np.vstack([xi[self.field] for xi in X]).astype(np.float)

class JSONTfidfVectorizer(TfidfVectorizer):
    def __init__(self, field='content', **kwargs):
        self.field = field
        self.stemmer = PorterStemmer()
        
        super().__init__(**kwargs,
                         preprocessor=self.extract,
                         tokenizer=self.stem
                        )
        
    def fit(self, X, y=None):
        self.stem_table = {}
        super().fit(X, y)
        return self
    
    def fit_transform(self, X, y=None):
        return self.fit(X, y).transform(X)
    
    def stem(self, text):
        return [self.stem_table.setdefault(self.stemmer.stem(item), item)
                for item in nltk.word_tokenize(text)
                if item.isalnum()]
        
    def extract(self, obj):
        return obj[self.field]

TextPipeline = Pipeline([
    ('tfidf', JSONTfidfVectorizer(stop_words='english', min_df=5, max_df=.2, sublinear_tf=True)),
    ('nmf', NMF(n_components=30)),
    ('norm', Normalizer('l1')),
    ('umap', UMAP(metric='cosine'))
])
