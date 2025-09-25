import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home,
  FolderOpen,
  Briefcase,
  User,
  BarChart3,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose, currentUser }) => {
  const location = useLocation();

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/', 
      icon: Home,
      testId: 'nav-dashboard'
    },
    { 
      name: 'Projects', 
      href: '/projects', 
      icon: FolderOpen,
      testId: 'nav-projects'
    },
    { 
      name: 'Portfolio', 
      href: '/portfolio', 
      icon: Briefcase,
      testId: 'nav-portfolio'
    },
    { 
      name: 'Profile', 
      href: '/profile', 
      icon: User,
      testId: 'nav-profile'
    },
    { 
      name: 'Analytics', 
      href: '/analytics', 
      icon: BarChart3,
      testId: 'nav-analytics'
    },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
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
            <span className="ml-3 text-lg font-semibold text-gray-900">
              Portfolio
            </span>
          </div>
          
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            data-testid="close-sidebar-button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        {currentUser && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 line-clamp-1">
                  {currentUser.name}
                </p>
                <p className="text-xs text-gray-500 line-clamp-1">
                  {currentUser.title || 'User'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                  ${active
                    ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
                data-testid={item.testId}
              >
                <Icon
                  className={`
                    mr-3 h-5 w-5 transition-colors duration-200
                    ${active ? 'text-primary-600' : 'text-gray-500 group-hover:text-gray-700'}
                  `}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Portfolio Manager v1.0</span>
            <span>© 2024</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;