// src/components/MapView.tsx
import React, { useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import styled from '@emotion/styled'
import { MapContainer, TileLayer, GeoJSON, Marker } from 'react-leaflet'
import L from 'leaflet'
import type { GeoJsonObject, Feature } from 'geojson'

import accidentIcon from '../assets/img1.svg'
import accidentIconInactive from '../assets/nimg1.svg'
import highRiskIcon from '../assets/img2.svg'
import highRiskIconInactive from '../assets/nimg2.svg'
import unexpectedIcon from '../assets/img3.svg'
import unexpectedIconInactive from '../assets/nimg3.svg'

import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl })

type Category = 'accident' | 'highRisk' | 'unexpected'

export default function MapView() {
  const [geoData, setGeoData] = useState<GeoJsonObject | null>(null)
  const [activeCategory, setActiveCategory] = useState<Category>('accident')

  useEffect(() => {
    fetch(
      'https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2018/json/skorea-provinces-2018-geo.json'
    )
      .then(res => (res.ok ? res.json() : Promise.reject(res.status)))
      .then(data => setGeoData(data))
      .catch(console.error)
  }, [])

  if (!geoData) return <div>Loading map...</div>

  const stateStatus: Record<string, 'good' | 'normal' | 'bad'> = {
    '서울특별시':'normal','부산광역시':'normal','대구광역시':'normal','인천광역시':'normal',
    '광주광역시':'normal','대전광역시':'normal','울산광역시':'normal','세종특별자치시':'normal',
    '경기도':'normal','강원도':'bad','충청북도':'normal','충청남도':'normal',
    '전라북도':'normal','전라남도':'normal','경상북도':'normal','경상남도':'normal','제주특별자치도':'normal'
  }
  const highRiskRegions = ['경기도','충청북도']
  const unexpectedRegions = ['부산광역시']

  const colorMap: Record<Category, [string, string]> = {
    accident:   ['#FCE4EC','#D81B60'],
    highRisk:   ['#FFF3E0','#FB8C00'],
    unexpected: ['#E1F5FE','#039BE5']
  }

  const centers = geoData.features.map((f, i) => {
    const { lat, lng } = L.geoJSON(f).getBounds().getCenter()
    return { key: i, name: f.properties?.name as string, lat, lng }
  })

  const getStyle = (feat: Feature) => {
    const name = feat.properties?.name as string
    let selected = false
    if (activeCategory === 'accident')   selected = stateStatus[name] === 'bad'
    else if (activeCategory === 'highRisk') selected = highRiskRegions.includes(name)
    else                                 selected = unexpectedRegions.includes(name)

    const [fill, stroke] = selected
      ? colorMap[activeCategory]
      : ['transparent', '#BBB']

    return { fillColor: fill, color: stroke, weight: 2, fillOpacity: selected ? 0.5 : 0 }
  }

  const icons: Record<Category,[string,string]> = {
    accident:   [accidentIcon, accidentIconInactive],
    highRisk:   [highRiskIcon, highRiskIconInactive],
    unexpected: [unexpectedIcon, unexpectedIconInactive]
  }

  return (
    <Container>
      <LegendBar>
        {(['accident','highRisk','unexpected'] as Category[]).map(cat => {
          const label = cat === 'accident'
            ? 'Accident Location'
            : cat === 'highRisk'
            ? 'High-Risk Section'
            : 'Unexpected Incident'
          const iconSrc = activeCategory === cat ? icons[cat][0] : icons[cat][1]

          return (
            <LegendItem
              key={cat}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            >
              {label}
              <Icon src={iconSrc} />
            </LegendItem>
          )
        })}
      </LegendBar>

      <MapWrapper>
        <MapContainer center={[36.5,127.5]} zoom={7} style={{ width: '100%', height: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <GeoJSON data={geoData} style={getStyle} />
          {centers.map(({ key, name, lat, lng }) => {
            let show = false
            if (activeCategory === 'accident')   show = stateStatus[name] === 'bad'
            else if (activeCategory === 'highRisk') show = highRiskRegions.includes(name)
            else                                 show = unexpectedRegions.includes(name)
            if (!show) return null

            const iconUrl = icons[activeCategory][0]
            return (
              <Marker
                key={key}
                position={[lat, lng]}
                icon={L.icon({ iconUrl, iconSize: [24,24], iconAnchor:[12,12] })}
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
  border:none;
  border-radius: 8px 8px 0 0;
  padding: 8px 16px;
`
const LegendItem = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  color: ${({ active }) => (active ? '#FF4E62' : '#AAA')};
  text-decoration: ${({ active }) => (active ? 'underline' : 'none')};
  &:not(:last-child)::after {
    content: '';
    display: block;
    width: 1px;
    height: 20px;
    background: #DDD;
    margin-left: 16px;
  }
`
const Icon = styled.img`
  width: 20px;
  height: 20px;
`
const MapWrapper = styled.div`
  width: 100%;
  height: 400px;        /* 원하는 높이 조정 */
  border-top: none;     /* LegendBar 와 매끄럽게 이어짐 */
  border-radius: 0 0 8px 8px;
  overflow: hidden;
`
