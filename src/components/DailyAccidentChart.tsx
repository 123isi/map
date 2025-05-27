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
  labels: string[]
  data:    number[]
}

export default function DailyAccidentChart({ labels, data }: Props ) {
  const today = new Date().getDate()

  const windowSize = 9
  const winLabels = Array.from({ length: windowSize }, (_, i) => {
    const day = today - (windowSize - 1 - i)
    return `day${day}`
  })
  const winTodayIdx = windowSize - 1

  const winData = winLabels.map(lbl => {
    const idx = labels.indexOf(lbl)
    return idx >= 0 ? data[idx] : 0
  })

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
