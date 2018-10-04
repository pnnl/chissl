
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

import os

from pymongo import MongoClient

import numpy as np
import pandas as pd

from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer, TfidfTransformer
from sklearn.decomposition import NMF

import nltk
from nltk.stem.porter import PorterStemmer


def create_tokenizer():
    stemmer = PorterStemmer()
    stem_table = {}

    def unstemmer(word):
        return stem_table.setdefault(stemmer.stem(word), word)

    return lambda text: [
        unstemmer(item)
        for item in nltk.word_tokenize(text)
        if item.isalnum()
    ]

def process_text_data(df, n_topics=5):

    tfidf = TfidfVectorizer(tokenizer=create_tokenizer(),
                            sublinear_tf=True,
                            stop_words='english',
                            max_df=.2, min_df=5)
    nmf = NMF(n_components=n_topics)

    X = df.title + ' ' + df.content
    X_tfidf = tfidf.fit_transform(X)
    X_nmf = nmf.fit_transform(X_tfidf)
    X_repr = X_nmf/np.atleast_2d(X_nmf.sum(axis=1)).T

    vocab = np.array(tfidf.get_feature_names())
    global_scores = nmf.components_.argsort(axis=1).argsort(axis=1)

    def get_keywords(x_i, xhat_i):
        doc_scores = global_scores.copy()
        doc_scores[xhat_i < .2] = 0

        scores = doc_scores.max(axis=0)
        topics = doc_scores.argmax(axis=0)

        iis = sorted(x_i.nonzero()[1], key=lambda j: scores[j], reverse=True)
        return vocab[iis[:10]].tolist(), topics[iis].tolist()

    df_keywords = pd.DataFrame([get_keywords(x_i, xhat_i)
                                for x_i, xhat_i in zip(X_tfidf, X_repr)],
                               columns=['tags', 'topics'])

    df_tags = pd.concat((df, df_keywords), axis=1)
    
    return df_tags, X_nmf

def save_text_data(client, dataset, df, X, path='data', name=None):
    collection = client[dataset].instances
    collection.insert_many(df.to_dict(orient='records'))
    collection.create_index('tags')
    