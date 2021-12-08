import '../pages/ShowTrailDetailPage.css'

let ShowTrailPhoto = ({photo,photoDescription,onPrimaryPhoto,arrayIndex}) => {
                    return (
                      <a href={photo}>
                        <span>
                          <img className='photo-thumbnails' src={photo} alt="trail" />

                          {onPrimaryPhoto && 
                          <div>
                            <label htmlFor="primePhotoPicker">
                              <input type="radio" id="primePhotoPicker" name="primaryPhoto" onChange={onPrimaryPhoto} value={arrayIndex} />
                              Make Display Photo
                            </label>
                          </div>
                          }

                          <h5>{photoDescription}</h5>
                          
                        </span>
                      </a>
                    )
                  }

export default ShowTrailPhoto