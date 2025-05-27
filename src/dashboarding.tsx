// src/pages/Dashboard.tsx
import React, { useEffect, useState, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import styled from '@emotion/styled'
import axios from 'axios'

import Sidebar from './components/Sibebar'
import Chart from './components/Chart'
import MapView from './components/MapView'
import DailyAccidentChart from './components/DailyAccidentChart'
import CCTVComponent from './components/CCTV'
const PageWrapper = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 2fr 1fr;
  grid-template-rows: auto 1fr auto;
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
const MapWrapper = styled(Card)`
  padding: 0;
  & > .leaflet-container {
    flex: 1;
    width: 100%;
    height: 100%;
  }
`

// 예시용 사고율
const allAccidentRates: Record<string, number> = {
  day13: 50, day14: 37, day15: 50,
  day16: 33, day17: 57, day18: 48,
  day19: 33, day20: 42, day21: 55,
  day22: 60, day23: 52,
}

interface CityTraffic {
  city: string
  trafficCount: number
  speed: number
  vehicleShare: { labels: string[]; data: number[] }
}
interface TrafficResponse {
  cities: CityTraffic[]
  date: string
}
type CCTVItem = {
	coordx: string;
	coordy: string;
	cctvurl: string;
	cctvname: string;
};
export default function Dashboard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const region = searchParams.get('region')

  const view = (searchParams.get('view') as 'daily' | 'monthly') ?? 'daily'
  const [selectedCCTV, setSelectedCCTV] = useState<CCTVItem | null>(null)

  const fetchNearest = async (lat: number, lng: number) => {
		setSelectedCCTV(null);
		try {
			const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/nearest-cctv?lat=${lat}&lng=${lng}`);
			const json = await res.json();
			if (res.ok && !json.error) setSelectedCCTV(json as CCTVItem);
		} catch (e) {
			console.error(e);
		}
	};
  
  const [count, setCount] = useState<number | null>(null);
  const [dailyTraffic, setDailyTraffic] = useState<number[]>([])
  const [speedData, setSpeedData] = useState<number[]>([])
  const [vehicleShare, setVehicleShare] = useState<{ labels: string[]; data: number[] }>({
    labels: [], data: []
  })
  const [cityTrafficList, setCityTrafficList] = useState<CityTraffic[]>([])
  const [apiDate, setApiDate] = useState<string>('')
  useEffect(() => {
    if (!region) return;              
    else{
      console.log("hello")
    }
    axios
      .get('/traffic/hourly', {
        params: { region },
      })
      .then(res => {
        console.log(res.data);
      })
      .catch(err => {
        console.error('교통 이벤트 213조회 실패', err.response?.status, err.response?.data);
      });
  }, [region]);  
  useEffect(() => {
    console.log("region:", region);
  if (!region) return;

    axios.get('/traffic-events/daily-count', {
      params: { region },   
    })
    .then(res => {
      console.log(res.data);   
      setCount(res.data.count);
    })
    .catch(err => {
      console.error('교통 이벤트 조회 실패', err);
    });
  }, [region]);
  
  useEffect(() => {
    axios.get('/traffic/average-stats', {
      params: { region },   
    })
    .then(res=>{
      console.log(res.data);  
    })
  }, [view])

  const { labels: accLabels, data: accData } = useMemo(() => {
    const today = new Date().getDate()
    const windowSize = 9
    const winLabels = Array.from({ length: windowSize }, (_, i) => {
      const day = today - (windowSize - 1 - i)
      return `day${day}`
    })
    const winData = winLabels.map(lbl => allAccidentRates[lbl] ?? 0)
    return { labels: winLabels, data: winData }
  }, [])

  return (
    <PageWrapper>
      <Section>
        <SectionTitle>Daily</SectionTitle>
        <Card>
          <Chart
            trafficData={dailyTraffic}
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
        <MapWrapper>
        <MapView onMarkerClick={fetchNearest} />


        </MapWrapper>
       
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
      <Section>
      <SectionTitle>CCTV Viewer</SectionTitle>
       <Card>
         <CCTVComponent cctv={selectedCCTV} />
       </Card>
      </Section>
    </PageWrapper>
  )
}
