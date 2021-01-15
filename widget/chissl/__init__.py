from ._version import version_info, __version__

from .chissl import ChisslWidget

from .react_jupyter_widget import get_jupyter_url_from_local_path

def _jupyter_nbextension_paths():
    return [{
        'section': 'notebook',
        'src': 'static',
        'dest': 'chissl-widget',
        'require': 'chissl-widget/extension'
    }]
