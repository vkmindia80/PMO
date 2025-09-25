import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Filter, 
  FolderOpen, 
  CheckSquare, 
  User,
  ArrowRight,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { apiService } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const SearchModal = ({ isOpen, onClose, currentUser, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    projects: [],
    tasks: [],
    users: [],
    total: 0
  });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    status: '',
    project_type: '',
    priority: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length >= 2) {
      const searchTimeout = setTimeout(() => {
        performSearch();
      }, 300);
      
      return () => clearTimeout(searchTimeout);
    } else {
      setResults({ projects: [], tasks: [], users: [], total: 0 });
    }
  }, [query, filters]);

  const performSearch = async () => {
    if (!query.trim() || query.length < 2) return;
    
    setLoading(true);
    try {
      const searchResults = await apiService.advancedSearch(query, filters);
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults({ projects: [], tasks: [], users: [], total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      status: '',
      project_type: '',
      priority: ''
    });
  };

  const getStatusIcon = (status) => {
    const icons = {
      'planning': <Clock className="w-4 h-4 text-yellow-600" />,
      'in-progress': <AlertCircle className="w-4 h-4 text-blue-600" />,
      'completed': <CheckCircle className="w-4 h-4 text-green-600" />,
      'on-hold': <AlertCircle className="w-4 h-4 text-gray-600" />,
      'todo': <Clock className="w-4 h-4 text-yellow-600" />,
      'review': <AlertCircle className="w-4 h-4 text-blue-600" />
    };
    return icons[status] || <Clock className="w-4 h-4 text-gray-600" />;
  };

  const handleItemClick = (item, type) => {
    if (type === 'project') {
      onNavigate(`/projects/${item.id}`);
    } else if (type === 'user') {
      onNavigate(`/portfolio/${item.id}`);
    } else if (type === 'task') {
      onNavigate(`/projects/${item.project_id}`);
    }
    onClose();
  };

  const highlightMatch = (text, query) => {
    if (!query || !text) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 rounded px-1">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Advanced Search
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              data-testid="close-search-modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search projects, tasks, users..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input pl-12 pr-4 text-lg"
              data-testid="search-input"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <LoadingSpinner size="sm" />
              </div>
            )}
          </div>

          {/* Filters Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              data-testid="toggle-filters"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              <ArrowRight className={`w-4 h-4 ml-2 transform transition-transform ${showFilters ? 'rotate-90' : ''}`} />
            </button>
            
            {results.total > 0 && (
              <span className="text-sm text-gray-600" data-testid="search-results-count">
                {results.total} result{results.total !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="input text-sm"
                    data-testid="filter-type"
                  >
                    <option value="all">All</option>
                    <option value="projects">Projects</option>
                    <option value="tasks">Tasks</option>
                    <option value="users">Users</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="input text-sm"
                    data-testid="filter-status"
                  >
                    <option value="">Any Status</option>
                    <option value="planning">Planning</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                    <option value="todo">To Do</option>
                    <option value="review">Review</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Project Type
                  </label>
                  <select
                    value={filters.project_type}
                    onChange={(e) => handleFilterChange('project_type', e.target.value)}
                    className="input text-sm"
                    data-testid="filter-project-type"
                  >
                    <option value="">Any Type</option>
                    <option value="software">Software</option>
                    <option value="design">Design</option>
                    <option value="business">Business</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={filters.priority}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    className="input text-sm"
                    data-testid="filter-priority"
                  >
                    <option value="">Any Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              
              <button
                onClick={clearFilters}
                className="mt-3 text-sm text-primary-600 hover:text-primary-700"
                data-testid="clear-filters"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 200px)' }}>
          {query.length < 2 ? (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Type at least 2 characters to search</p>
            </div>
          ) : loading ? (
            <div className="p-8 text-center">
              <LoadingSpinner size="lg" />
              <p className="text-gray-600 mt-4">Searching...</p>
            </div>
          ) : results.total === 0 ? (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search terms or filters
              </p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Projects */}
              {results.projects.length > 0 && (
                <div>
                  <div className="flex items-center mb-3">
                    <FolderOpen className="w-5 h-5 text-gray-600 mr-2" />
                    <h4 className="text-sm font-semibold text-gray-900">
                      Projects ({results.projects.length})
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {results.projects.map((project) => (
                      <div
                        key={project.id}
                        onClick={() => handleItemClick(project, 'project')}
                        className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        data-testid={`search-project-${project.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 mb-1">
                              {highlightMatch(project.title, query)}
                            </h5>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {highlightMatch(project.description, query)}
                            </p>
                            {project.technologies && project.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {project.technologies.slice(0, 3).map((tech, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                                  >
                                    {highlightMatch(tech, query)}
                                  </span>
                                ))}
                                {project.technologies.length > 3 && (
                                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                    +{project.technologies.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center ml-4">
                            {getStatusIcon(project.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {results.tasks.length > 0 && (
                <div>
                  <div className="flex items-center mb-3">
                    <CheckSquare className="w-5 h-5 text-gray-600 mr-2" />
                    <h4 className="text-sm font-semibold text-gray-900">
                      Tasks ({results.tasks.length})
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {results.tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleItemClick(task, 'task')}
                        className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        data-testid={`search-task-${task.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 mb-1">
                              {highlightMatch(task.title, query)}
                            </h5>
                            {task.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {highlightMatch(task.description, query)}
                              </p>
                            )}
                            <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                              <span>Task • {task.priority} priority</span>
                              {task.due_date && (
                                <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center ml-4">
                            {getStatusIcon(task.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Users */}
              {results.users.length > 0 && (
                <div>
                  <div className="flex items-center mb-3">
                    <User className="w-5 h-5 text-gray-600 mr-2" />
                    <h4 className="text-sm font-semibold text-gray-900">
                      Users ({results.users.length})
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {results.users.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleItemClick(user, 'user')}
                        className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        data-testid={`search-user-${user.id}`}
                      >
                        <div className="flex items-start">
                          <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 flex-shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">
                              {highlightMatch(user.name, query)}
                            </h5>
                            {user.title && (
                              <p className="text-sm text-primary-600">
                                {highlightMatch(user.title, query)}
                              </p>
                            )}
                            {user.skills && user.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {user.skills.slice(0, 3).map((skill, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded"
                                  >
                                    {highlightMatch(skill, query)}
                                  </span>
                                ))}
                                {user.skills.length > 3 && (
                                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                    +{user.skills.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;