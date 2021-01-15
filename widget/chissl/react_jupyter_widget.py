import ipywidgets as widgets
from traitlets import Unicode, Dict

import os
from notebook import notebookapp

def get_jupyter_url_from_local_path(path):
    # Caveat: this will only work if exactly one jupyter notebook is running
    # Todo: How do we match the appropriate session? can possibly look in
    #   s = notebookapp.Session()
    #   vars(s)
    # also, obj contains a PID of the notebook server and other useful things, how do we use that

    abspath = os.path.abspath(path)
    if path.endswith(os.path.sep):
        abspath += '/'

    for obj in notebookapp.list_running_servers():
        return abspath.replace(obj['notebook_dir'], '/files')

@widgets.register
class ReactJupyterWidget(widgets.DOMWidget):
    """An example widget."""
    _view_name = Unicode('ReactView').tag(sync=True)
    _model_name = Unicode('ReactModel').tag(sync=True)
    _view_module = Unicode('chissl-widget').tag(sync=True)
    _model_module = Unicode('chissl-widget').tag(sync=True)
    _view_module_version = Unicode('^0.1.0').tag(sync=True)
    _model_module_version = Unicode('^0.1.0').tag(sync=True)

    component = Unicode().tag(sync=True)
    props = Dict().tag(sync=True)
    state = Dict().tag(sync=True)

    def __init__(self, **kwargs):
        super().__init__()

        self.component = self.__class__.__name__
        self.props = kwargs

@widgets.register
class Example(ReactJupyterWidget):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
