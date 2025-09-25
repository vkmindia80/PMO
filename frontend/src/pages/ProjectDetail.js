import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  Upload,
  File,
  AlertCircle,
  Target,
  Users
} from 'lucide-react';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const ProjectDetail = ({ currentUser }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      
      // Load project details
      const projectData = await apiService.getProjectById(projectId);
      setProject(projectData);
      
      // Load project tasks
      const tasksData = await apiService.getProjectTasks(projectId);
      setTasks(tasksData);
      
    } catch (error) {
      console.error('Failed to load project data:', error);
      if (error.response?.status === 404) {
        navigate('/projects');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await apiService.createTask(projectId, taskData);
      setShowCreateTask(false);
      loadProjectData(); // Reload to get updated tasks
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      await apiService.updateTask(taskId, updates);
      loadProjectData(); // Reload to get updated tasks
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    
    try {
      await apiService.deleteTask(taskId);
      loadProjectData(); // Reload to get updated tasks
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      await apiService.uploadFile(projectId, file);
      loadProjectData(); // Reload to show updated files
    } catch (error) {
      console.error('Failed to upload file:', error);
    } finally {
      setUploadingFile(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Project not found
        </h3>
        <p className="text-gray-600 mb-4">
          The project you're looking for doesn't exist or you don't have access to it.
        </p>
        <Link to="/projects" className="btn-primary">
          Back to Projects
        </Link>
      </div>
    );
  }

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

  const getTaskStatusIcon = (status) => {
    const icons = {
      'todo': <Clock className="w-4 h-4 text-gray-600" />,
      'in-progress': <AlertCircle className="w-4 h-4 text-blue-600" />,
      'review': <Target className="w-4 h-4 text-yellow-600" />,
      'completed': <CheckCircle className="w-4 h-4 text-green-600" />,
    };
    return icons[status] || <Clock className="w-4 h-4 text-gray-600" />;
  };

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    todo: tasks.filter(t => t.status === 'todo').length,
  };

  const completionRate = taskStats.total > 0 
    ? Math.round((taskStats.completed / taskStats.total) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/projects"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            data-testid="back-to-projects"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900" data-testid="project-title">
              {project.title}
            </h1>
            <div className="flex items-center space-x-3 mt-2">
              {getStatusBadge(project.status)}
              {getPriorityBadge(project.priority)}
              <span className="text-sm text-gray-500 capitalize">
                {project.project_type}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Link
            to={`/projects/${project.id}/edit`}
            className="btn-secondary inline-flex items-center"
            data-testid="edit-project-button"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Overview */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">
                Project Overview
              </h2>
            </div>
            <div className="card-body">
              <p className="text-gray-700 leading-relaxed mb-6" data-testid="project-description">
                {project.description}
              </p>

              {/* Technologies */}
              {project.technologies && project.technologies.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Technologies Used
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        data-testid={`technology-${tech}`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                        data-testid={`tag-${tag}`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tasks Section */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Tasks ({taskStats.total})
                </h2>
                <button
                  onClick={() => setShowCreateTask(true)}
                  className="btn-primary btn-sm inline-flex items-center"
                  data-testid="create-task-button"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Task
                </button>
              </div>
            </div>
            
            <div className="card-body">
              {/* Task Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{taskStats.total}</div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</div>
                  <div className="text-xs text-gray-600">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{completionRate}%</div>
                  <div className="text-xs text-gray-600">Complete</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-600">{completionRate}%</span>
                </div>
                <div className="progress-bar h-2">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
              </div>

              {/* Tasks List */}
              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No tasks yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Break down your project into manageable tasks
                  </p>
                  <button
                    onClick={() => setShowCreateTask(true)}
                    className="btn-primary inline-flex items-center"
                    data-testid="create-first-task-button"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Task
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onUpdate={handleUpdateTask}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Files Section */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Files ({project.files?.length || 0})
                </h2>
                <div>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                  />
                  <label
                    htmlFor="file-upload"
                    className="btn-primary btn-sm inline-flex items-center cursor-pointer"
                    data-testid="upload-file-button"
                  >
                    {uploadingFile ? (
                      <>
                        <div className="spinner mr-1"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-1" />
                        Upload
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
            
            <div className="card-body">
              {(!project.files || project.files.length === 0) ? (
                <div className="text-center py-8">
                  <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No files uploaded
                  </h3>
                  <p className="text-gray-600">
                    Upload project files, documents, or assets
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {project.files.map((filename, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      data-testid={`file-${filename}`}
                    >
                      <File className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {filename}
                      </p>
                      <a
                        href={`${process.env.REACT_APP_BACKEND_URL}/uploads/${filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary-600 hover:text-primary-700"
                      >
                        View File
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Project Details */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">
                  Project Details
                </h2>
              </div>
              <div className="card-body space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    {getStatusBadge(project.status)}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Priority</label>
                  <div className="mt-1">
                    {getPriorityBadge(project.priority)}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Type</label>
                  <p className="text-gray-900 capitalize">{project.project_type}</p>
                </div>

                {project.start_date && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Start Date</label>
                    <p className="text-gray-900 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(project.start_date).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {project.end_date && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">End Date</label>
                    <p className="text-gray-900 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(project.end_date).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700">Created</label>
                  <p className="text-gray-900 text-sm">
                    {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Last Updated</label>
                  <p className="text-gray-900 text-sm">
                    {new Date(project.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateTask && (
        <CreateTaskModal
          onClose={() => setShowCreateTask(false)}
          onCreateTask={handleCreateTask}
        />
      )}
    </div>
  );
};

// Task Item Component
const TaskItem = ({ task, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  const handleStatusChange = (newStatus) => {
    onUpdate(task.id, { ...task, status: newStatus });
  };

  const handleSaveTitle = () => {
    if (title.trim() && title !== task.title) {
      onUpdate(task.id, { ...task, title: title.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setTitle(task.title);
      setIsEditing(false);
    }
  };

  const getTaskStatusIcon = (status) => {
    const icons = {
      'todo': <Clock className="w-4 h-4 text-gray-600" />,
      'in-progress': <AlertCircle className="w-4 h-4 text-blue-600" />,
      'review': <Target className="w-4 h-4 text-yellow-600" />,
      'completed': <CheckCircle className="w-4 h-4 text-green-600" />,
    };
    return icons[status] || <Clock className="w-4 h-4 text-gray-600" />;
  };

  return (
    <div 
      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
      data-testid={`task-${task.id}`}
    >
      <div className="flex items-center flex-1">
        <div className="mr-3">
          {getTaskStatusIcon(task.status)}
        </div>
        
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={handleKeyPress}
            className="flex-1 bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            autoFocus
          />
        ) : (
          <div className="flex-1">
            <h4 
              className={`text-sm font-medium cursor-pointer hover:text-primary-600 ${
                task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
              }`}
              onClick={() => setIsEditing(true)}
            >
              {task.title}
            </h4>
            {task.description && (
              <p className="text-xs text-gray-600 mt-1">
                {task.description}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 ml-4">
        <select
          value={task.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="review">Review</option>
          <option value="completed">Completed</option>
        </select>
        
        <button
          onClick={() => onDelete(task.id)}
          className="text-gray-400 hover:text-red-600 p-1"
          data-testid={`delete-task-${task.id}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Create Task Modal Component
const CreateTaskModal = ({ onClose, onCreateTask }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: '',
    estimated_hours: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) return;

    setLoading(true);
    try {
      const taskData = {
        ...formData,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
      };
      await onCreateTask(taskData);
    } catch (error) {
      console.error('Failed to create task:', error);
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
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Create New Task
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              className="input"
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              className="input"
              placeholder="Task description (optional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <div>
              <label htmlFor="estimated_hours" className="block text-sm font-medium text-gray-700 mb-2">
                Est. Hours
              </label>
              <input
                type="number"
                id="estimated_hours"
                name="estimated_hours"
                min="0"
                step="0.5"
                value={formData.estimated_hours}
                onChange={handleInputChange}
                className="input"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <input
              type="date"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleInputChange}
              className="input"
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
              disabled={!formData.title || loading}
              className="btn-primary"
              data-testid="submit-create-task"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectDetail;