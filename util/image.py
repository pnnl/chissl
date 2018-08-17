import base64

from PIL import Image
from io import BytesIO

def img2base64(img, format='png'):
    buffered = BytesIO()
    img.save(buffered, format="JPEG")

    return {
        'type': f'image/{format}',
        'data': base64.b64encode(buffered.getvalue()).decode('ascii')
    }

