import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';

// Components
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

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setLoading(true);
      
      // Fetch all users for multi-user system
      const usersData = await apiService.getUsers();
      setUsers(usersData);
      
      // Set first user as current user for demo purposes
      // In a real app, this would come from authentication
      if (usersData.length > 0) {
        setCurrentUser(usersData[0]);
      }
      
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchUser = (user) => {
    setCurrentUser(user);
    setSidebarOpen(false);
  };

  const createNewUser = async (userData) => {
    try {
      const newUser = await apiService.createUser(userData);
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
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
              {!currentUser ? (
                <WelcomeScreen onCreateUser={createNewUser} />
              ) : (
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
              )}
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

// Welcome Screen Component for first-time users
const WelcomeScreen = ({ onCreateUser }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    bio: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setIsCreating(true);
    try {
      await onCreateUser(formData);
    } catch (error) {
      console.error('Failed to create user:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-strong p-8 mx-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Portfolio Manager
          </h1>
          <p className="text-gray-600">
            Create your profile to get started with managing your projects and portfolio
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="input"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="input"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Professional Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="input"
              placeholder="e.g., Full Stack Developer"
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              Short Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              value={formData.bio}
              onChange={handleInputChange}
              className="input"
              placeholder="Tell us about yourself..."
            />
          </div>

          <button
            type="submit"
            disabled={!formData.name || !formData.email || isCreating}
            className="btn-primary w-full btn-lg mt-6"
            data-testid="create-profile-button"
          >
            {isCreating ? (
              <>
                <div className="spinner mr-2"></div>
                Creating Profile...
              </>
            ) : (
              'Create My Profile'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;