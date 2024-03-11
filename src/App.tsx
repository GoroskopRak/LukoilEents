import React from 'react';
import './styles/App.scss';
import './styles/normalize.css'
import { Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';

function App() {
  return (
    <Routes>
      <Route path='/' element={<LoginPage />} />
      <Route path='/login' element={<LoginPage />} />
    </Routes>
  );
}

export default App;
