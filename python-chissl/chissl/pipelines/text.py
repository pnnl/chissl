
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

from sklearn.pipeline import Pipeline
from sklearn.base import TransformerMixin
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import NMF
from sklearn.preprocessing import Normalizer, StandardScaler

import nltk
from nltk.stem.porter import PorterStemmer

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
])
