import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './assets/pages/landing';
import Chat from './assets/pages/Chat';
import MemeFeed from './assets/pages/MemeFeed';
import Profilepage from './assets/pages/Profile';
import Chatbot from './assets/pages/Chatbot';
import Chatuser from './assets/pages/Chatuser';
import SignUpPage from './assets/pages/signup';
import LoginPage from './assets/pages/login';
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
