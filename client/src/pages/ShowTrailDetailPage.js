import './ShowTrailDetailPage.css'
import ShowTrailPhoto from './pageComponents/ShowTrailPhoto'
import { useState, useEffect } from 'react'
import {useParams} from 'react-router-dom'

let ShowTrailDetailPage = () => {
    let params=useParams()
    let trailId=params.id

    const [trailData, setTrailData] = useState([])

    useEffect(() => {
        const fetchTrailData = async () => {
          let fetchResult = await fetch('/api/getTrailInfo/'+trailId)
          let fetchedTrail = await fetchResult.json()
          setTrailData(fetchedTrail)

        }
        fetchTrailData()
      }, [trailId])


    return (
        <div>
            <h3>{trailData.trailName}</h3>
            <div>
              {
                        trailData.photos && trailData.photos.map((photo)=> {
                            return (
                              <ShowTrailPhoto   key={photo._id}
                                                photo={photo.url}
                                                photoDescription={photo.description} />
                            )
                })
              }
            </div>
            <div>{trailData.trailDescription}</div>
            <div>{trailData.trailMap}</div>
        </div>

    )
}

export default ShowTrailDetailPage