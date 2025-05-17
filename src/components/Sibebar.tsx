// src/components/Sidebar.tsx
import React, { useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from '@emotion/styled';
import areaIcon from '../assets/icon.svg';
import dateIcon from '../assets/icon2.svg';

const REGIONS = ['서울특별시', '경기도', '강원도'];
const MUNICIPALITIES: Record<string, string[]> = { '경기도': ['수원시', '성남시'] };
const LOCALS: Record<string, string[]> = { '수원시': ['장안구', '권선구'] };

type ViewMode = 'daily' | 'monthly';

export default function Sidebar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dateRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);

  const region = searchParams.get('region') || '';
  const municipality = searchParams.get('municipality') || '';
  const local = searchParams.get('local') || '';
  const view = (searchParams.get('view') as ViewMode) || 'daily';
  const date = searchParams.get('date') || '';
  const month = searchParams.get('month') || '';

  const municipalities = useMemo(() => MUNICIPALITIES[region] || [], [region]);
  const locals = useMemo(() => LOCALS[municipality] || [], [municipality]);

  const updateParam = (key: string, value: string) => {
    searchParams.set(key, value);
    if (key === 'region') {
      searchParams.delete('municipality');
      searchParams.delete('local');
    }
    if (key === 'municipality') {
      searchParams.delete('local');
    }
    setSearchParams(searchParams);
  };

  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');

  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`;

  const thisMonthStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthStr = `${prevMonth.getFullYear()}-${pad(prevMonth.getMonth() + 1)}`;

  const formatDate = (d: string) => {
    if (!d) return '';
    const dt = new Date(d);
    return `${dt.getFullYear()}. ${pad(dt.getMonth() + 1)}. ${pad(dt.getDate())}.`;
  };

  const formatMonth = (m: string) => {
    if (!m) return '';
    const [Y, M] = m.split('-');
    return `${Y}. ${pad(Number(M))}.`;
  };

  return (
    <Container>
      <Section>
        <Title>
          <Icon src={areaIcon} alt="Area" /> Area
        </Title>
        <Select
          value={region}
          onChange={e => updateParam('region', e.target.value)}
        >
          <option value="">— Region —</option>
          {REGIONS.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </Select>
        <Select
          value={municipality}
          disabled={!region}
          onChange={e => updateParam('municipality', e.target.value)}
        >
          <option value="">— Municipality —</option>
          {municipalities.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </Select>
        <Select
          value={local}
          disabled={!municipality}
          onChange={e => updateParam('local', e.target.value)}
        >
          <option value="">— Local area —</option>
          {locals.map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </Select>
      </Section>

      <Section>
        <Title>
          <Icon src={dateIcon} alt="Date" /> Date
        </Title>

        <Label>Monthly</Label>
        <ToggleGroup>
          <Toggle
            active={view === 'monthly' && month === thisMonthStr}
            onClick={() => {
              updateParam('view', 'monthly');
              updateParam('month', thisMonthStr);
            }}
          >This month</Toggle>
          <Toggle
            active={view === 'monthly' && month === lastMonthStr}
            onClick={() => {
              updateParam('view', 'monthly');
              updateParam('month', lastMonthStr);
            }}
          >Last month</Toggle>
        </ToggleGroup>
        <DateDisplay onClick={() => monthRef.current?.showPicker()}>
          {formatMonth(month)}
        </DateDisplay>
        <input
          ref={monthRef}
          type="month"
          value={month}
          onChange={e => updateParam('month', e.target.value)}
          hidden
        />

        <Label>Day</Label>
        <ToggleGroup>
          <Toggle
            active={view === 'daily' && date === todayStr}
            onClick={() => {
              updateParam('view', 'daily');
              updateParam('date', todayStr);
            }}
          >Today</Toggle>
          <Toggle
            active={view === 'daily' && date === yesterdayStr}
            onClick={() => {
              updateParam('view', 'daily');
              updateParam('date', yesterdayStr);
            }}
          >Yesterday</Toggle>
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
      </Section>
    </Container>
  );
}

const Container = styled.aside`
  width: 240px;
  padding: 24px;
  background: #f7f8fa;
  border-left: 1px solid #eee;
  height: 100vh;
  box-sizing: border-box;
`;

const Section = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  font-size: 24px;
  font-weight: 600;
  color: #7e57c2;
  margin-bottom: 16px;
`;

const Icon = styled.img`
  width: 28px;
  height: 28px;
  margin-right: 8px;
`;

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
`;

const Label = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin: 16px 0 8px;
`;

const ToggleGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`;

const Toggle = styled.button<{ active: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 16px;
  border: 1px solid ${({ active }) => (active ? '#8784FB' : '#ddd')};
  background: ${({ active }) => (active ? '#8784FB' : 'transparent')};
  color: ${({ active }) => (active ? '#fff' : '#888')};
  cursor: pointer;
`;

const DateDisplay = styled.div`
  font-size: 18px;
  margin-bottom: 16px;
  cursor: pointer;
  border-bottom: 1px solid #ccc;
  padding-bottom: 4px;
`;
