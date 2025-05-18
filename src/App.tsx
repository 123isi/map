// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './dashboarding';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/*" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
