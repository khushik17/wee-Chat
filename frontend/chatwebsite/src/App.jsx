import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './assets/pages/Landing.jsx';
import Chat from './assets/pages/Chat.jsx';
import MemeFeed from './assets/pages/MemeFeed.jsx';
import Profilepage from './assets/pages/Profile.jsx';
import Chatbot from './assets/pages/Chatbot.jsx';
import Chatuser from './assets/pages/Chatuser.jsx';
import SignUpPage from './assets/pages/Signup.jsx';
import LoginPage from './assets/pages/Login.jsx';
import { useUser } from '@clerk/clerk-react';
import './App.css';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useUser();
  
  if (!isLoaded) return <div>Loading...</div>;
  if (!isSignedIn) return <Navigate to="/sign-in" replace />;
  
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<Landing />} />
        <Route path='/landing' element={<Landing />} />
        
        {/* Clerk Auth Routes (wildcard fix) */}
        <Route path="/sign-in/*" element={<LoginPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        
        {/* Protected Routes */}
        <Route path='/chat/bot' element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
        <Route path='/chat/users' element={<ProtectedRoute><Chatuser /></ProtectedRoute>} />
        <Route path='/profile' element={<ProtectedRoute><Profilepage /></ProtectedRoute>} />
        <Route path='/memeFeed' element={<ProtectedRoute><MemeFeed /></ProtectedRoute>} />
        <Route path='/chat' element={<ProtectedRoute><Chat /></ProtectedRoute>} />

        {/* Optional 404 fallback */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
