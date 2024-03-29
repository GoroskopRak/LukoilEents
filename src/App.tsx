import React from 'react';
import './styles/App.scss';
import './styles/normalize.css'
import './styles/fonts.css'
import { Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import PointEventsPage from './pages/PointEventsPage/PointEventsPage';

function App() {
  return (
    <Routes>
      <Route path='/' element={<LoginPage />} />
      <Route path='/login' element={<LoginPage />} />
      <Route path='/point-events-acceptor' element={<PointEventsPage role='acceptor'/>} />
      <Route path='/point-events-lineman' element={<PointEventsPage role='lineman'/>} />
    </Routes>
  );
}

export default App;
