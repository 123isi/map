// src/pages/Dashboard.tsx
import React, { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import styled from '@emotion/styled'

import Sidebar from './components/Sibebar'
import Chart from './components/Chart'
import MapView from './components/MapView'
import DailyAccidentChart from './components/DailyAccidentChart'

const PageWrapper = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 2fr 1fr;
  gap: 24px;
  padding: 24px;
  background-color: #f7f8fa;
  height: 100vh;
  box-sizing: border-box;
`
const Section = styled.div`
  display: flex;
  flex-direction: column;
`
const SectionTitle = styled.h2`
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
  color: #7e57c2;
`
const Card = styled.div`
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`
const MapContainer = styled(Card)`
  padding: 0;
  & > .leaflet-container {
    height: 100%;
    width: 100%;
  }
`

// 전체 일자별 사고율 맵 (예시 데이터)
const allAccidentRates: Record<string, number> = {
  day13: 50, day14: 37, day15: 50,
  day16: 33, day17: 57, day18: 48,
  day19: 33, day20: 42, day21: 55,
  day22: 60, day23: 52, 
}

export default function Dashboard() {
  const [searchParams] = useSearchParams()
  const view         = (searchParams.get('view') as 'daily'|'monthly') || 'daily'
  const date         = searchParams.get('date')   || ''
  const month        = searchParams.get('month')  || ''
  const region       = searchParams.get('region') || ''
  const municipality = searchParams.get('municipality') || ''
  const localArea    = searchParams.get('local')  || ''

  const [trafficData, setTraffic] = useState<number[]>([])
  const [speedData,   setSpeed]   = useState<number[]>([])
  const [vehicleShare,setVehicle] = useState<{labels:string[];data:number[]}>({
    labels: [], data: []
  })

  useEffect(() => {
    if (view === 'daily') {
      setTraffic([
        120,135,150,145,160,175,
        190,205,180,165,150,140,
        130,120,115,110,105,100,
        95,90,85,80,75,70
      ])
      setSpeed([
        60,62,65,63,67,70,
        72,75,73,70,68,66,
        64,62,60,58,56,54,
        52,50,48,46,44,42
      ])
      setVehicle({
        labels: ['Passenger Car','Motorcycle','Bus','Freight Vehicle'],
        data:   [35,20,15,30]
      })
    } else {
      setTraffic([
        100,120,130,140,150,160,
        170,180,190,200,210,220,
        230,240,250,240,230,220,
        210,200,190,180,170,160
      ])
      setSpeed([
        50,55,58,60,62,65,
        67,70,68,66,64,62,
        60,58,55,53,52,50,
        48,46,44,42,40,38
      ])
      setVehicle({
        labels: ['Passenger Car','Motorcycle','Bus','Freight Vehicle'],
        data:   [30,25,20,25]
      })
    }
  }, [view, date, month, region, municipality, localArea])

  // 오늘 기준 ±4일 라벨 & 데이터 계산
  const { labels: accLabels, data: accData } = useMemo(() => {
    const today = new Date().getDate()   // ex: 18
    const windowSize = 9
    const half = Math.floor(windowSize / 2) // 4

    // day(today−4) … day(today+4)
    const labels = Array.from({ length: windowSize }, (_, i) =>
      `day${today + (i - half)}`
    )
    const data = labels.map(lbl => allAccidentRates[lbl] ?? 0)
    return { labels, data }
  }, [])

  return (
    <PageWrapper>
      {/* LEFT: Daily Chart */}
      <Section>
        <SectionTitle>Daily</SectionTitle>
        <Card>
          <Chart
            trafficData={trafficData}
            speedData={speedData}
            vehicleShare={{
              labels: vehicleShare.labels,
              data:   vehicleShare.data,
              icons: [
                '/icons/passenger.svg',
                '/icons/motorcycle.svg',
                '/icons/bus.svg',
                '/icons/freight.svg'
              ]
            }}
          />
        </Card>
      </Section>
      <Section>
        <SectionTitle>Monthly</SectionTitle>
        <MapContainer>
          {view === 'monthly' && <MapView />}
        </MapContainer>

        <SectionTitle>Daily Accident Rate</SectionTitle>
        <DailyAccidentChart
          labels={accLabels}
          data={accData}
        />
      </Section>
      <Section>
        <SectionTitle>Area</SectionTitle>
        <Sidebar />
      </Section>
    </PageWrapper>
  )
}
