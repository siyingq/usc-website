import React, { Component } from 'react'
import { compose } from 'redux'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import Dropzone from 'react-dropzone'
import { Button } from 'reactstrap';
import { getFile } from '../../actions/FilesActions'
import { firebaseConnect } from 'react-redux-firebase';

class ImageUploader extends Component {
  constructor(props) {
    super(props)

    this.state = {
      image: null,
    }
  }

  componentDidMount() {
    const { imageSrc, firebase } = this.props
    this.mounted = true

    if(imageSrc && imageSrc !== '' && !(imageSrc.startsWith("http://") || imageSrc.startsWith("https://"))) {
      getFile(firebase, imageSrc, (url) => {
        if(this.mounted) {
          this.setState({
            image: url,
          })
        }
      })
    }
  }

  componentWillUnmount() {
    this.mounted = false
  }

  render() {
    const { image } = this.state
    const { imageSrc, onDrop, onDelete } = this.props

      return (
        <div>
          <div className="d-flex justify-content-center flex-wrap">
            {
              imageSrc ?
                <img src={ image ? image : imageSrc} className="img-fluid d-inline" alt="poster" style={{maxHeight: '200px'}} />
              : ''
            }
            '    '
            <Dropzone
              accept="image/jpeg, image/png"
              onDrop={(files) => {
                onDrop(files[0])
                this.setState({
                  image: null,
                })
              }}>
              <div className="w-100 h-100 d-flex justify-content-center">
                <span className="w-100 h-100 fa-layers fa-fw" style={{marginTop: '.7em'}}>
                  <FontAwesomeIcon icon="upload" size="4x" transform="up-15"/>
                  <span className="fa-layers-text w-75 lead" style={{marginTop: '1em'}}><h4 style={{fontWeight: 300}}>Click to Select, or Drag File Here (*.jpg, *.png)</h4></span>
                </span>
              </div>
            </Dropzone>
          </div>
            {
              imageSrc ?
                <div className="d-flex justify-content-center">
                  <Button outline color="danger" onClick={onDelete}>Delete Image</Button>
                </div>
              : ''
            }
        </div>
      )
    }
}

export default compose(
  firebaseConnect()
)(ImageUploader)
