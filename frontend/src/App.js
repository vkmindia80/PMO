import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';

// Components
import Login from './components/Login';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Portfolio from './pages/Portfolio';
import UserProfile from './pages/UserProfile';
import ProjectDetail from './pages/ProjectDetail';
import Analytics from './pages/Analytics';
import LoadingSpinner from './components/LoadingSpinner';

// API Service
import { apiService } from './services/api';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('current_user');
      
      if (token && savedUser) {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
        // For demo, we'll create a mock users list
        setUsers([user]);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('current_user');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setUsers([user]); // For demo purposes
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setUsers([]);
  };

  const switchUser = (user) => {
    setCurrentUser(user);
    setSidebarOpen(false);
    localStorage.setItem('current_user', JSON.stringify(user));
  };

  const createNewUser = async (userData) => {
    try {
      // For demo, create a mock user
      const newUser = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        title: userData.title || 'Portfolio User',
        bio: userData.bio || 'Welcome to my portfolio!',
        skills: userData.skills || [],
        social_links: userData.social_links || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      localStorage.setItem('current_user', JSON.stringify(newUser));
      return newUser;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: '#22c55e',
              },
            },
          }}
        />

        {/* Navigation */}
        <Navbar
          currentUser={currentUser}
          users={users}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onSwitchUser={switchUser}
          onCreateUser={createNewUser}
          onLogout={handleLogout}
        />

        <div className="flex">
          {/* Sidebar */}
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            currentUser={currentUser}
          />

          {/* Main Content */}
          <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} lg:ml-64`}>
            <div className="p-4 lg:p-6 max-w-7xl mx-auto">
              <Routes>
                <Route
                  path="/"
                  element={<Dashboard currentUser={currentUser} />}
                />
                <Route
                  path="/projects"
                  element={<Projects currentUser={currentUser} />}
                />
                <Route
                  path="/projects/:projectId"
                  element={<ProjectDetail currentUser={currentUser} />}
                />
                <Route
                  path="/portfolio"
                  element={<Portfolio currentUser={currentUser} />}
                />
                <Route
                  path="/portfolio/:userId"
                  element={<Portfolio />}
                />
                <Route
                  path="/profile"
                  element={<UserProfile currentUser={currentUser} onUpdateUser={(user) => setCurrentUser(user)} />}
                />
                <Route
                  path="/analytics"
                  element={<Analytics currentUser={currentUser} />}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;