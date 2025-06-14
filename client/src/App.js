import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Routes from './router';

function App() {
  return (
    <Router>
      <ToastContainer />
      <Routes />
    </Router>
  );
}

export default App; 