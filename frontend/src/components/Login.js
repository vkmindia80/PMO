import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    title: '',
    bio: ''
  });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // For now, we'll use demo credentials
      const demoCredentials = [
        { email: 'demo@portfolio.com', password: 'demo123', name: 'Demo User' },
        { email: 'john.doe@demo.com', password: 'demo123', name: 'John Doe' },
        { email: 'sarah.smith@demo.com', password: 'demo123', name: 'Sarah Smith' },
        { email: 'mike.johnson@demo.com', password: 'demo123', name: 'Mike Johnson' }
      ];

      const user = demoCredentials.find(
        u => u.email === formData.email && u.password === formData.password
      );

      if (user) {
        // Mock user object
        const mockUser = {
          id: Date.now().toString(),
          name: user.name,
          email: user.email,
          title: formData.title || 'Portfolio User',
          bio: formData.bio || 'Welcome to my portfolio!',
          skills: ['JavaScript', 'React', 'Node.js'],
          social_links: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        localStorage.setItem('auth_token', 'demo-token-' + Date.now());
        localStorage.setItem('current_user', JSON.stringify(mockUser));
        
        onLogin(mockUser);
      } else {
        setError('Invalid email or password');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoUsers = [
    { email: 'demo@portfolio.com', password: 'demo123', name: 'Demo User', role: 'Full Stack Developer' },
    { email: 'john.doe@demo.com', password: 'demo123', name: 'John Doe', role: 'Full Stack Developer' },
    { email: 'sarah.smith@demo.com', password: 'demo123', name: 'Sarah Smith', role: 'UX/UI Designer' },
    { email: 'mike.johnson@demo.com', password: 'demo123', name: 'Mike Johnson', role: 'Project Manager' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100 p-4">
      <div className="max-w-md w-full">
        {/* Main Login Card */}
        <div className="bg-white rounded-2xl shadow-strong p-8 mb-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14-7l2 2m0 0l2 2m-2-2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Portfolio Manager
            </h1>
            <p className="text-gray-600">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input pl-10"
                    placeholder="Enter your name"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input pl-10"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input pl-10 pr-10"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <>
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
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full btn-lg mt-6"
              data-testid={isLogin ? "login-button" : "register-button"}
            >
              {loading ? (
                <>
                  <div className="spinner mr-2"></div>
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </div>

        {/* Demo Credentials Card */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🎯 Demo Credentials
          </h3>
          <div className="space-y-3">
            {demoUsers.map((user, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    email: user.email,
                    password: user.password
                  }));
                }}
              >
                <div>
                  <div className="font-medium text-sm text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-600">{user.role}</div>
                </div>
                <div className="text-xs text-gray-500">
                  Click to use
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>Password for all:</strong> demo123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;