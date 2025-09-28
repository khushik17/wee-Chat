import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './assets/pages/landing';
import Signup from './assets/pages/signup';
import Chat from './assets/pages/Chat';
import MemeFeed from './assets/pages/MemeFeed';
import Profile from './assets/pages/Profile';
import Otp from './assets/pages/Otp';
import LoginPage from './assets/pages/login.jsx';
import Finalsignup from './assets/pages/Finalsignup';
import Chatbot from './assets/pages/Chatbot';
import Chatuser from './assets/pages/Chatuser';

import './App.css'

function App() {
  

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Landing />}/>
        <Route path='/login' element={<LoginPage />}/>
        <Route path='/signup-details' element={<Finalsignup/>}/>
        <Route path='/chat/bot' element={<Chatbot />}/>
        <Route path='/chat/users' element={<Chatuser />}/>
        <Route path='/landing' element={<Landing />}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/otp' element={<Otp />}/>
        <Route path='/profile' element={<Profile />}/>
        <Route path='/memeFeed' element={<MemeFeed />}/>
        <Route path='/chat' element={<Chat />}/>
      
      </Routes>
    </Router>
    
  )
}

export default App
