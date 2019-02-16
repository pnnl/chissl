import os
from setuptools import setup

# Utility function to read the README file.
# Used for the long_description.  It's nice, because now 1) we have a top level
# README file and 2) it's easier to type in the README file than to put a raw
# string in below ...
def read(fname):
    return open(os.path.join(os.path.dirname(__file__), fname)).read()

setup(
    name = "chissl",
    version = "0.2.0",
    author = "Dustin Arendt",
    author_email = "dustin.arendt@pnnl.gov",
    description = ("CHISSL Interactive machine tool support library"),
    license = "BSD",
    packages=['chissl'],
    long_description=read('README'),
    install_requires=[
        'flask>=0.12.2',
        'matplotlib>=3.0.1',
        'networkx>=2.2',
        'nltk>=3.2.4',
        'numpy>=1.15.0',
        'pandas>=0.23.0',
        'pymongo>=3.4.0',
        'scipy>=1.1.0',
        'scikit-learn>=0.20.1',
        'umap-learn>=0.3.6'
    ],
)