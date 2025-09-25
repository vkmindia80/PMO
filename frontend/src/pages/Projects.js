import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  FolderOpen, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Projects = ({ currentUser }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadProjects();
    }
    
    // Check if we should show create modal from URL params
    if (searchParams.get('action') === 'create') {
      setShowCreateModal(true);
    }
  }, [currentUser, statusFilter, typeFilter, searchParams]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const params = {
        userId: currentUser.id,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { projectType: typeFilter }),
      };
      
      const data = await apiService.getProjects(params);
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      await apiService.createProject(projectData, currentUser.id);
      setShowCreateModal(false);
      loadProjects(); // Reload projects
      // Clear URL params
      setSearchParams({});
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }
    
    try {
      await apiService.deleteProject(projectId);
      loadProjects(); // Reload projects
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStatusIcon = (status) => {
    const icons = {
      'planning': <Clock className="w-4 h-4 text-yellow-600" />,
      'in-progress': <AlertCircle className="w-4 h-4 text-blue-600" />,
      'completed': <CheckCircle className="w-4 h-4 text-green-600" />,
      'on-hold': <AlertCircle className="w-4 h-4 text-gray-600" />,
    };
    return icons[status] || <Clock className="w-4 h-4 text-gray-600" />;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'planning': { class: 'badge-warning', text: 'Planning' },
      'in-progress': { class: 'badge-primary', text: 'In Progress' },
      'completed': { class: 'badge-success', text: 'Completed' },
      'on-hold': { class: 'badge-gray', text: 'On Hold' },
    };
    
    const config = statusConfig[status] || { class: 'badge-gray', text: status };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      'low': { class: 'badge-gray', text: 'Low' },
      'medium': { class: 'badge-warning', text: 'Medium' },
      'high': { class: 'badge-danger', text: 'High' },
      'critical': { class: 'badge-danger', text: 'Critical' },
    };
    
    const config = priorityConfig[priority] || { class: 'badge-gray', text: priority };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" data-testid="projects-title">
            My Projects
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and track your projects
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary inline-flex items-center mt-4 sm:mt-0"
          data-testid="create-project-button"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </button>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
            data-testid="search-projects-input"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input"
          data-testid="status-filter"
        >
          <option value="all">All Status</option>
          <option value="planning">Planning</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="on-hold">On Hold</option>
        </select>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="input"
          data-testid="type-filter"
        >
          <option value="all">All Types</option>
          <option value="software">Software</option>
          <option value="design">Design</option>
          <option value="business">Business</option>
          <option value="other">Other</option>
        </select>

        {/* Results count */}
        <div className="flex items-center text-sm text-gray-600">
          <span data-testid="projects-count">
            {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' 
              ? 'No projects match your filters'
              : 'No projects yet'
            }
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by creating your first project'
            }
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary inline-flex items-center"
            data-testid="create-first-project-button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid-responsive">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="card hover-shadow hover-lift"
              data-testid={`project-card-${project.id}`}
            >
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Link
                      to={`/projects/${project.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-primary-600 line-clamp-2"
                    >
                      {project.title}
                    </Link>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                      {project.description}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Link
                      to={`/projects/${project.id}/edit`}
                      className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50"
                      data-testid={`edit-project-${project.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      data-testid={`delete-project-${project.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Status and Priority */}
                <div className="flex items-center space-x-2 mb-4">
                  {getStatusIcon(project.status)}
                  {getStatusBadge(project.status)}
                  {getPriorityBadge(project.priority)}
                </div>

                {/* Technologies */}
                {project.technologies?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.technologies.slice(0, 4).map((tech, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        +{project.technologies.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                {/* Project Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-4">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {project.created_at ? new Date(project.created_at).toLocaleDateString() : ''}
                    </span>
                    <span className="capitalize">
                      {project.project_type}
                    </span>
                  </div>
                  <Link
                    to={`/projects/${project.id}`}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => {
            setShowCreateModal(false);
            setSearchParams({}); // Clear URL params
          }}
          onCreateProject={handleCreateProject}
        />
      )}
    </div>
  );
};

// Create Project Modal Component
const CreateProjectModal = ({ onClose, onCreateProject }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: [],
    status: 'planning',
    start_date: '',
    end_date: '',
    project_type: 'software',
    priority: 'medium',
    tags: []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    setLoading(true);
    try {
      const projectData = {
        ...formData,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
      };
      await onCreateProject(projectData);
    } catch (error) {
      console.error('Failed to create project:', error);
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

  const handleArrayInput = (field, value) => {
    const items = value.split(',').map(item => item.trim()).filter(Boolean);
    setFormData(prev => ({
      ...prev,
      [field]: items
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Create New Project
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              className="input"
              placeholder="Enter project title"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              className="input"
              placeholder="Describe your project"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="project_type" className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                id="project_type"
                name="project_type"
                value={formData.project_type}
                onChange={handleInputChange}
                className="input"
              >
                <option value="software">Software</option>
                <option value="design">Design</option>
                <option value="business">Business</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="technologies" className="block text-sm font-medium text-gray-700 mb-2">
              Technologies
            </label>
            <input
              type="text"
              id="technologies"
              placeholder="React, Node.js, MongoDB (comma-separated)"
              onChange={(e) => handleArrayInput('technologies', e.target.value)}
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="input"
              />
            </div>

            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className="input"
              />
            </div>
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
              disabled={!formData.title || !formData.description || loading}
              className="btn-primary"
              data-testid="submit-create-project"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Projects;