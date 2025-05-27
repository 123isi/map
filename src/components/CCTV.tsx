import React, { useEffect, useRef } from 'react'
import Hls from 'hls.js'
import styled from '@emotion/styled'

type CCTVItem = {
  coordx: string
  coordy: string
  cctvurl: string
  cctvname: string
}

type CCTVPlayerProps = {
  cctv: CCTVItem | null
}

const Container = styled.div`
  margin-top: 1.5rem;
`
const Title = styled.h4`
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
`
const Video = styled.video`
  width: 100%;
  border: 1px solid #D1D5DB;
  border-radius: 0.25rem;
`
const Placeholder = styled.p`
  font-style: italic;
  color: #6B7280;
`

const CCTVComponent: React.FC<CCTVPlayerProps> = ({ cctv }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }
    video.src = ''

    if (cctv) {
      const url = cctv.cctvurl
      if (Hls.isSupported()) {
        const hls = new Hls()
        hlsRef.current = hls
        hls.loadSource(url)
        hls.attachMedia(video)
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {})
        })
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(() => {})
        })
      }
    }
  }, [cctv])

  return (
    <Container>
      {cctv ? (
        <>
          <Title>{cctv.cctvname}</Title>
          <Video ref={videoRef} controls />
        </>
      ) : (
        <Placeholder>마커를 클릭해 CCTV 영상을 불러오세요.</Placeholder>
      )}
    </Container>
  )
}

export default CCTVComponent
