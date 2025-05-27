// src/components/Sidebar.tsx
import React, { useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import styled from '@emotion/styled'
import areaIcon from '../assets/icon.svg'
import dateIcon from '../assets/icon2.svg'

const REGIONS = [
  '서울',
  '청주',
  '전주',
  '광주',
  '서해안',
  '부산',
  '강원',
  '경기',
  '대전',
  '대구',
  '천안',
]

type ViewMode = 'daily' | 'monthly'

export default function Sidebar() {
  const [searchParams, setSearchParams] = useSearchParams()
  const dateRef = useRef<HTMLInputElement>(null)
  const monthRef = useRef<HTMLInputElement>(null)
  const hourRef = useRef<HTMLInputElement>(null)

  const region = searchParams.get('region') || ''
  const municipality = searchParams.get('municipality') || ''
  const local = searchParams.get('local') || ''
  const view = (searchParams.get('view') as ViewMode) || 'daily'
  const date = searchParams.get('date') || ''
  const month = searchParams.get('month') || ''
  const hour = searchParams.get('hour') || ''

  const updateParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams)
    p.set(key, value)
    if (key === 'region') {
      p.delete('municipality')
      p.delete('local')
    }
    if (key === 'municipality') {
      p.delete('local')
    }
    setSearchParams(p)
  }

  const now = new Date()
  const pad = (n: number) => n.toString().padStart(2, '0')

  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const yesterdayStr = `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`

  const thisMonthStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthStr = `${prevMonth.getFullYear()}-${pad(prevMonth.getMonth() + 1)}`

  const formatDate = (d: string) => {
    if (!d) return ''
    const dt = new Date(d)
    return `${dt.getFullYear()}. ${pad(dt.getMonth() + 1)}. ${pad(dt.getDate())}.`
  }
  const formatMonth = (m: string) => {
    if (!m) return ''
    const [Y, M] = m.split('-')
    return `${Y}. ${pad(Number(M))}.`
  }

  return (
    <Container>
      <Section>
        <Title>
          <Icon src={areaIcon} alt="Area" /> Area
        </Title>
        <Select value={region} onChange={e => updateParam('region', e.target.value)}>
          <option value="">— Region —</option>
          {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </Select>
      </Section>

      <Section>
        <Title>
          <Icon src={dateIcon} alt="Date" /> Date
        </Title>

      

        <Label>Day</Label>
<ToggleGroup>
  <Toggle
    active={view === 'daily' && date === todayStr}
    onClick={() => {
      const p = new URLSearchParams(searchParams)
      p.set('view', 'daily')
      p.set('date', todayStr)
      setSearchParams(p)
    }}
  >
    Today
  </Toggle>
  <Toggle
    active={view === 'daily' && date === yesterdayStr}
    onClick={() => {
      const p = new URLSearchParams(searchParams)
      p.set('view', 'daily')
      p.set('date', yesterdayStr)
      setSearchParams(p)
    }}
  >
    Yesterday
  </Toggle>
</ToggleGroup>
        <DateDisplay onClick={() => dateRef.current?.showPicker()}>
          {formatDate(date)}
        </DateDisplay>
        <input
          ref={dateRef}
          type="date"
          value={date}
          onChange={e => updateParam('date', e.target.value)}
          hidden
        />

        {/* Hour */}
        <Label>Hour</Label>
        <ToggleGroup>
          <Toggle
            active={view === 'daily' && !!hour}
            onClick={() => {
              updateParam('view', 'daily')
              const hh = pad(now.getHours())
              updateParam('hour', `${hh}:00`)
            }}
          >Now</Toggle>
        </ToggleGroup>
        <DateDisplay onClick={() => hourRef.current?.showPicker()}>
          {hour || '—:—'}
        </DateDisplay>
        <input
          ref={hourRef}
          type="time"
          value={hour}
          onChange={e => updateParam('hour', e.target.value)}
          hidden
        />
      </Section>
    </Container>
  )
}

const Container = styled.aside`
  width: 240px;
  padding: 24px;
  background: #f7f8fa;
  border-left: 1px solid #eee;
  height: 100vh;
  box-sizing: border-box;
`
const Section = styled.div`
  margin-bottom: 32px;
`
const Title = styled.div`
  display: flex;
  align-items: center;
  font-size: 24px;
  font-weight: 600;
  color: #7e57c2;
  margin-bottom: 16px;
`
const Icon = styled.img`
  width: 28px;
  height: 28px;
  margin-right: 8px;
`
const Select = styled.select`
  width: 100%;
  padding: 8px 4px;
  margin-bottom: 16px;
  border: none;
  border-bottom: 1px solid #ccc;
  background: transparent;
  color: #555;
  font-size: 14px;
  appearance: none;

  &:disabled { color: #ccc; }
  option { color: #000; font-size: 14px; }
`
const Label = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin: 16px 0 8px;
`
const ToggleGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`
const Toggle = styled.button<{ active: boolean }>`
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 16px;
  border: 1px solid ${({ active }) => (active ? '#8784FB' : '#ddd')};
  background: ${({ active }) => (active ? '#8784FB' : 'transparent')};
  color: ${({ active }) => (active ? '#fff' : '#888')};
  cursor: pointer;
`
const DateDisplay = styled.div`
  font-size: 18px;
  margin-bottom: 16px;
  cursor: pointer;
  border-bottom: 1px solid #ccc;
  padding-bottom: 4px;
`
