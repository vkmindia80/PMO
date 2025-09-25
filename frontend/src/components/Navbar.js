import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  User, 
  Menu, 
  ChevronDown, 
  LogOut, 
  Settings, 
  Plus,
  Users
} from 'lucide-react';

const Navbar = ({ 
  currentUser, 
  users, 
  onToggleSidebar, 
  onSwitchUser, 
  onCreateUser 
}) => {
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);

  return (
    <>
      <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left section */}
            <div className="flex items-center">
              {/* Mobile sidebar toggle */}
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                data-testid="mobile-menu-button"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Logo */}
              <Link 
                to="/" 
                className="flex items-center ml-2 lg:ml-0"
                data-testid="logo-link"
              >
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                  <svg
                    className="w-5 h-5 text-white"
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
                <span className="text-xl font-bold text-gray-900">
                  Portfolio Manager
                </span>
              </Link>
            </div>

            {/* Right section */}
            <div className="flex items-center space-x-4">
              {currentUser && (
                <>
                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-3 p-2 rounded-lg text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      data-testid="user-menu-button"
                    >
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary-600" />
                      </div>
                      <div className="hidden md:block text-left">
                        <p className="text-sm font-medium text-gray-900">
                          {currentUser.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {currentUser.title || 'User'}
                        </p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>

                    {/* User dropdown menu */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                        <div className="p-4 border-b border-gray-200">
                          <p className="text-sm font-medium text-gray-900">
                            {currentUser.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {currentUser.email}
                          </p>
                        </div>

                        <div className="py-2">
                          <Link
                            to="/profile"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            data-testid="profile-link"
                          >
                            <Settings className="w-4 h-4 mr-3" />
                            Profile Settings
                          </Link>
                        </div>

                        {users.length > 1 && (
                          <>
                            <div className="border-t border-gray-200 py-2">
                              <div className="px-4 py-2">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  Switch User
                                </p>
                              </div>
                              {users
                                .filter(user => user.id !== currentUser.id)
                                .map(user => (
                                <button
                                  key={user.id}
                                  onClick={() => {
                                    onSwitchUser(user);
                                    setShowUserMenu(false);
                                  }}
                                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                                  data-testid={`switch-user-${user.id}`}
                                >
                                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                    <User className="w-3 h-3 text-gray-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </>
                        )}

                        <div className="border-t border-gray-200 py-2">
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              setShowCreateUserModal(true);
                            }}
                            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                            data-testid="create-user-button"
                          >
                            <Plus className="w-4 h-4 mr-3" />
                            Create New User
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Create User Modal */}
      {showCreateUserModal && (
        <CreateUserModal
          onClose={() => setShowCreateUserModal(false)}
          onCreateUser={onCreateUser}
        />
      )}

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
};

// Create User Modal Component
const CreateUserModal = ({ onClose, onCreateUser }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    bio: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setLoading(true);
    try {
      await onCreateUser(formData);
      onClose();
    } catch (error) {
      console.error('Failed to create user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Create New User
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Add a new user to the system
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              placeholder="Enter full name"
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
              placeholder="Enter email address"
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
              placeholder="e.g., Software Developer"
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              value={formData.bio}
              onChange={handleInputChange}
              className="input"
              placeholder="Brief bio..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name || !formData.email || loading}
              className="btn-primary"
              data-testid="submit-create-user"
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Navbar;