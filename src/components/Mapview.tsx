// src/components/MapView.tsx
import React, { useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import styled from '@emotion/styled'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
// 기본 마커 아이콘 설정
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl })

type Category = 'accident' | 'construction' | 'unexpected'
interface TrafficEvent {
  eventType: string
  eventDetailType: string
  startDate: string
  coordX: string
  coordY: string
}
interface MapViewProps {
  onMarkerClick: (lat: number, lng: number) => void
}

export default function MapView({ onMarkerClick }: MapViewProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('accident')
  const [events, setEvents] = useState<TrafficEvent[]>([])


  useEffect(() => {
    const typeParam =
      activeCategory === 'accident' ? 'acc'
      : activeCategory === 'construction' ? 'cor'
      : 'unexp'

    fetch(`/traffic-events?eventType=${typeParam}`)
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`)
        return res.json()
      })
      .then((data: any) => {
        const list: TrafficEvent[] = Array.isArray(data)
          ? data
          : Array.isArray(data.events)
            ? data.events
            : []
        setEvents(list)
      })
      .catch(console.error)
  }, [activeCategory])

  return (
    <Container>
      <LegendBar>
        {(['accident','construction','unexpected'] as Category[]).map(cat => (
          <LegendItem
            key={cat}
            active={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
          >
            {cat === 'accident' ? 'Accident' 
             : cat === 'construction' ? 'Construction' 
             : 'Unexpected'}
          </LegendItem>
        ))}
      </LegendBar>

      <MapWrapper>
        <MapContainer
          center={[36.5, 127.5]}
          zoom={7}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {events.map((ev, idx) => {
            const lat = parseFloat(ev.coordY)
            const lng = parseFloat(ev.coordX)
            return (
              <Marker
                key={idx}
                position={[lat, lng]}
                eventHandlers={{ click: () => onMarkerClick(lat, lng) }}
              />
            )
          })}
        </MapContainer>
      </MapWrapper>
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
`
const LegendBar = styled.div`
  display: flex;
  gap: 24px;
  background: #fff;
  border-radius: 8px 8px 0 0;
  padding: 8px 16px;
`
const LegendItem = styled.div<{ active: boolean }>`
  cursor: pointer;
  color: ${({ active }) => (active ? '#FF4E62' : '#AAA')};
  font-weight: ${({ active }) => (active ? '600' : '400')};
`
const MapWrapper = styled.div`
  width: 100%;
  height: 400px;
  border-top: none;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
`
