// src/components/DailyAccidentChart.tsx
import React, { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import styled from '@emotion/styled'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
)

interface Props {
  // 원본에 오늘을 포함한 일부만 들어와도 상관없습니다
  labels: string[]    // ex: ['day13','day14',…,'day21']
  data:    number[]   // ex: [50,37,…,55]
}

export default function DailyAccidentChart({ labels, data }: Props) {
  const today = new Date().getDate()           
  // 원본 배열에서 today의 값이 있는지 확인
  const todayIdx = labels.findIndex(l =>
    parseInt(l.replace(/\D/g, ''), 10) === today
  )
  // (없어도 괜찮습니다 — 그냥 0으로 처리할 거예요.)

  // 1) winLabels: 오늘 기준 ±4일 라벨 생성
  const windowSize = 9
  const half = Math.floor(windowSize / 2)      // 4
  const winLabels = Array.from({ length: windowSize }, (_, i) => {
    const day = today + (i - half)
    return `day${day}`
  })

  // 2) winData: winLabels 각 항목에 대해 원본 data에서 찾아서, 없으면 0
  const winData = winLabels.map(lbl => {
    const idx = labels.indexOf(lbl)
    return idx >= 0 ? data[idx] : 0
  })

  // 3) 오늘(정가운데) 강조 인덱스
  const winTodayIdx = half

  // 4) 차트 데이터 & 옵션
  const chartData = {
    labels: winLabels,
    datasets: [{
      type: 'bar' as const,
      data: winData,
      backgroundColor: winLabels.map((_, i) =>
        i === winTodayIdx ? '#D81B60' : 'rgba(232,120,143,0.6)'
      ),
      borderWidth: 2,
      borderRadius: 4,
      maxBarThickness: 24,
      hoverBackgroundColor: winLabels.map((_, i) =>
        i === winTodayIdx ? '#D81B60' : 'rgba(232,120,143,0.6)'
      ),
    }]
  }

  const options = {
    indexAxis: 'x' as const,
    responsive: true,
    maintainAspectRatio: false,
    events: [],

    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: (_: any, i: number) =>
            i === winTodayIdx ? '#D81B60' : '#999',
          font: { weight: '500' }
        }
      },
      y: {
        grid: { color: '#eee' },
        ticks: {
          color: '#999',
          stepSize: 10,
          beginAtZero: true,
          max: 100,
        }
      }
    },

    plugins: {
      tooltip: false,
      legend:  { display: false },
      title: {
        display: true,
        text: 'Daily Accident Rate',
        font: { size: 16, weight: '600' },
        padding: { bottom: 12 }
      }
    }
  }

  return (
    <ChartWrapper>
      <Bar data={chartData} options={options} />
    </ChartWrapper>
  )
}

const ChartWrapper = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  height: 320px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
`
