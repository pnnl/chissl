chissl-widget
===============================

A widget for interactive machine learning using CHISSL

Installation
------------

To install use pip:

    $ pip install chissl
    $ jupyter nbextension enable --py --sys-prefix chissl

To install for jupyterlab

    $ jupyter labextension install chissl

For a development installation (requires npm),

    $ git clone https://github.com/PNNL/chissl-widget.git
    $ cd chissl-widget
    $ pip install -e .
    $ jupyter nbextension install --py --symlink --sys-prefix chissl
    $ jupyter nbextension enable --py --sys-prefix chissl
