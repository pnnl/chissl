import React from 'react'

export const ImageComponent = ({src={}, title='Drag to another group to change class'}) =>
  <img
    title={title}
    className='image-component'
    src={`data:image/${src.type};base64,${src.data}`}
    style={{margin: 5}}
  />
