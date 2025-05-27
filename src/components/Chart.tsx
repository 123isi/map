// src/components/Chart.tsx
import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title as ChartJsTitle,
  Tooltip,
  Legend as ChartJsLegend,
} from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'
import { Line, Pie } from 'react-chartjs-2'
import styled from '@emotion/styled'
import axios from 'axios'
import { useEffect,useState } from 'react'
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  ChartJsTitle,
  Tooltip,
  ChartJsLegend,
  annotationPlugin
)

interface ChartProps {
  trafficData: number[]
  speedData:   number[]
  vehicleShare: {
    labels: string[]
    data:   number[]
    icons:  string[]
  }
}

function formatLabel(h: number) {
  const ampm = h < 12 ? 'AM' : 'PM'
  const h12  = h % 12 === 0 ? 12 : h % 12
  return `${h12}${ampm}`
}

export default function Chart({
  trafficData = Array(24).fill(null),
  speedData   = Array(24).fill(null),
  vehicleShare
}: ChartProps) {
  const now         = new Date()
  const currentHour = now.getHours()
  const windowSize  = 10

  const labels: string[]              = []
  const histTraffic:  (number|null)[] = []
  const histSpeed:    (number|null)[] = []

  for (let offset = -windowSize; offset <= 0; offset++) {
    const h = (currentHour + offset + 24) % 24
    labels.push(formatLabel(h))
    histTraffic.push(trafficData[h])
    histSpeed.push(speedData[h])
  }
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string|null>(null)
  const currentIdx = labels.length - 1
  useEffect(() => {
    axios.get('/traffic/vehicle-type-share')
      .then(res => {
        console.log('API 응답 전체:', res)
        console.log('res.data:', res.data)
        setData(res.data)
      })
      .catch(err => {
        console.error('API 호출 실패:', err)
        setError('데이터 로드에 실패했습니다')
      })
  }, [])
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    spanGaps: true,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index' as const, intersect: false },
      annotation: {
        annotations: {
          nowLine: {
            type: 'line' as const,
            xMin:  currentIdx,
            xMax:  currentIdx,
            borderColor: '#7E57C2',
            borderWidth: 2
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: true, color: '#eee' },
        ticks: {
          color: (ctx: any) =>
            ctx.index === currentIdx ? '#7E57C2' : '#999',
          font: (ctx: any) => ({
            weight: ctx.index === currentIdx ? '700' : '400'
          })
        }
      },
      y: {
        grid: { color: '#eee' },
        ticks: { color: '#999', stepSize: 50, beginAtZero: true }
      }
    },
    layout: { padding: 8 }
  }

  const trafficChartData = {
    labels,
    datasets: [
      {
        label: 'Average Traffic',
        data: histTraffic,
        borderColor: '#8784FB',
        backgroundColor: 'rgba(207,206,253,0.6)',
        fill: true,
        tension: 0.4,
        pointRadius: 3
      }
    ]
  }

  const speedChartData = {
    labels,
    datasets: [
      {
        label: 'Average Speed',
        data: histSpeed,
        borderColor: '#8784FB',
        backgroundColor: 'rgba(207,206,253,0.3)',
        fill: 'start' as const,
        tension: 0.4,
        pointRadius: 3
      }
    ]
  }

  const pieData = {
    labels: vehicleShare.labels,
    datasets: [{
      data: vehicleShare.data,
      backgroundColor: ['#7E57C2','#BA68C8','#FFB74D','#E57373'],
      borderWidth: 0,
      hoverOffset: 6,
      pointStyle: vehicleShare.icons,
      pointRadius: 8
    }]
  }

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { usePointStyle: true, boxWidth:12, padding:16, color:'#666' }
      }
    }
  }

  return (
    <Wrapper>
      <TwoCols>
        <ChartBox>
          <Title>Average Traffic</Title>
          <ChartArea>
            <Line
              data={trafficChartData}
              options={commonOptions}
              style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%' }}
            />
          </ChartArea>
        </ChartBox>
        <ChartBox>
          <Title>Average Speed</Title>
          <ChartArea>
            <Line
              data={speedChartData}
              options={commonOptions}
              style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%' }}
            />
          </ChartArea>
        </ChartBox>
      </TwoCols>
      <PieBox>
        <Title>Traffic Share by Vehicle Type</Title>
        <Pie data={pieData} options={pieOptions} />
      </PieBox>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const TwoCols = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
`

const ChartBox = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  height: 260px;
  display: flex;
  flex-direction: column;
`

const ChartArea = styled.div`
  height: 0;
  flex: 1;
  min-height: 0;
  position: relative;
`

const PieBox = styled(ChartBox)`
  width: 360px;
  align-self: flex-start;
`

const Title = styled.h4`
  margin: 0 0 12px;
  font-size: 16px;
  color: #222;
`
