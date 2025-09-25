import React, { useState } from 'react';
import { 
  Menu,
  X,
  Search,
  Download,
  User,
  Settings,
  LogOut,
  Plus,
  ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SearchModal from './SearchModal';
import ExportModal from './ExportModal';

const Navbar = ({ 
  currentUser, 
  users = [], 
  onToggleSidebar, 
  onSwitchUser, 
  onCreateUser, 
  onLogout 
}) => {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [createUserData, setCreateUserData] = useState({
    name: '',
    email: '',
    title: '',
    bio: '',
    skills: []
  });

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await onCreateUser(createUserData);
      setShowCreateUserForm(false);
      setCreateUserData({
        name: '',
        email: '',
        title: '',
        bio: '',
        skills: []
      });
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleSearchNavigation = (path) => {
    navigate(path);
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!currentUser) return null;

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side */}
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                onClick={onToggleSidebar}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
                data-testid="mobile-menu-button"
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Logo */}
              <div className="flex-shrink-0 ml-4 lg:ml-0">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">P</span>
                  </div>
                  <span className="ml-2 text-xl font-bold text-gray-900">
                    Portfolio
                  </span>
                </div>
              </div>
            </div>

            {/* Center - Search */}
            <div className="hidden md:flex flex-1 items-center justify-center px-8 max-w-md">
              <button
                onClick={() => setShowSearchModal(true)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 text-left px-4 py-2 rounded-lg transition-colors flex items-center"
                data-testid="search-trigger"
              >
                <Search className="w-4 h-4 mr-2" />
                <span className="flex-1">Search projects, tasks...</span>
                <kbd className="ml-2 px-2 py-1 text-xs font-semibold text-gray-500 bg-white rounded border border-gray-300">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-3">
              {/* Mobile search */}
              <button
                onClick={() => setShowSearchModal(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg md:hidden"
                data-testid="mobile-search-button"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Export button */}
              <button
                onClick={() => setShowExportModal(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                title="Export Portfolio"
                data-testid="export-button"
              >
                <Download className="w-5 h-5" />
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  data-testid="user-menu-button"
                >
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {currentUser.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      {currentUser.title || 'Portfolio User'}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>

                {/* User dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-2">
                      {/* Current user info */}
                      <div className="px-4 py-2 border-b border-gray-100">
                        <div className="text-sm font-medium text-gray-900">
                          {currentUser.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {currentUser.email}
                        </div>
                      </div>

                      {/* Profile link */}
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        data-testid="profile-menu-item"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Edit Profile
                      </button>

                      {/* Settings */}
                      <button
                        onClick={() => {
                          navigate('/settings');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </button>

                      {/* User switching */}
                      {users.length > 1 && (
                        <>
                          <div className="border-t border-gray-100 my-2"></div>
                          <div className="px-4 py-1">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Switch User
                            </div>
                          </div>
                          {users.filter(user => user.id !== currentUser.id).map((user) => (
                            <button
                              key={user.id}
                              onClick={() => {
                                onSwitchUser(user);
                                setShowUserMenu(false);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                              data-testid={`switch-to-${user.id}`}
                            >
                              <div className="w-6 h-6 bg-gradient-secondary rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
                                {user.name?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-xs text-gray-500">{user.title || 'Portfolio User'}</div>
                              </div>
                            </button>
                          ))}
                        </>
                      )}

                      {/* Create new user */}
                      <div className="border-t border-gray-100 my-2"></div>
                      <button
                        onClick={() => {
                          setShowCreateUserForm(true);
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        data-testid="create-user-menu-item"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create New User
                      </button>

                      {/* Logout */}
                      <div className="border-t border-gray-100 my-2"></div>
                      <button
                        onClick={() => {
                          onLogout();
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center"
                        data-testid="logout-button"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Click outside to close dropdown */}
        {showUserMenu && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowUserMenu(false)}
          ></div>
        )}
      </nav>

      {/* Create User Modal */}
      {showCreateUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Create New User
                </h3>
                <button
                  onClick={() => setShowCreateUserForm(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={createUserData.name}
                  onChange={(e) => setCreateUserData(prev => ({ ...prev, name: e.target.value }))}
                  className="input"
                  placeholder="Enter full name"
                  data-testid="create-user-name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={createUserData.email}
                  onChange={(e) => setCreateUserData(prev => ({ ...prev, email: e.target.value }))}
                  className="input"
                  placeholder="Enter email address"
                  data-testid="create-user-email"
                />
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={createUserData.title}
                  onChange={(e) => setCreateUserData(prev => ({ ...prev, title: e.target.value }))}
                  className="input"
                  placeholder="e.g., Software Developer"
                  data-testid="create-user-title"
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                  Short Bio
                </label>
                <textarea
                  id="bio"
                  rows={3}
                  value={createUserData.bio}
                  onChange={(e) => setCreateUserData(prev => ({ ...prev, bio: e.target.value }))}
                  className="input"
                  placeholder="Tell us about yourself..."
                  data-testid="create-user-bio"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateUserForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  data-testid="submit-create-user"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search Modal */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        currentUser={currentUser}
        onNavigate={handleSearchNavigation}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        currentUser={currentUser}
      />
    </>
  );
};

export default Navbar;