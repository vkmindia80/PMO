import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus,
  FolderOpen,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Calendar,
  Target
} from 'lucide-react';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = ({ currentUser }) => {
  const [analytics, setAnalytics] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadDashboardData();
    }
  }, [currentUser]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load analytics data
      const analyticsData = await apiService.getDashboardAnalytics(currentUser.id);
      setAnalytics(analyticsData);
      
      // Load recent projects
      const projectsData = await apiService.getProjects({ 
        userId: currentUser.id, 
        limit: 5 
      });
      setRecentProjects(projectsData);
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const quickStats = [
    {
      name: 'Total Projects',
      value: analytics?.projects?.total || 0,
      icon: FolderOpen,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      testId: 'total-projects-stat'
    },
    {
      name: 'Completed',
      value: analytics?.projects?.completed || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-100',
      testId: 'completed-projects-stat'
    },
    {
      name: 'In Progress',
      value: analytics?.projects?.in_progress || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
      testId: 'in-progress-projects-stat'
    },
    {
      name: 'Completion Rate',
      value: `${analytics?.projects?.completion_rate || 0}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      testId: 'completion-rate-stat'
    },
  ];

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" data-testid="dashboard-title">
            Welcome back, {currentUser?.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's an overview of your projects and activities
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/projects?action=create"
            className="btn-primary inline-flex items-center"
            data-testid="create-project-button"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card" data-testid={stat.testId}>
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.name}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bg}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Projects
                </h2>
                <Link
                  to="/projects"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  data-testid="view-all-projects-link"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="card-body">
              {recentProjects.length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No projects yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Get started by creating your first project
                  </p>
                  <Link
                    to="/projects?action=create"
                    className="btn-primary inline-flex items-center"
                    data-testid="create-first-project-button"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                      data-testid={`project-item-${project.id}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-sm font-medium text-gray-900">
                            <Link 
                              to={`/projects/${project.id}`}
                              className="hover:text-primary-600"
                            >
                              {project.title}
                            </Link>
                          </h3>
                          {getStatusBadge(project.status)}
                          {getPriorityBadge(project.priority)}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {project.description}
                        </p>
                        {project.technologies?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {project.technologies.slice(0, 3).map((tech, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                              >
                                {tech}
                              </span>
                            ))}
                            {project.technologies.length > 3 && (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                +{project.technologies.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-xs text-gray-500">
                          {project.updated_at ? new Date(project.updated_at).toLocaleDateString() : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions & Overview */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">
                Quick Actions
              </h2>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <Link
                  to="/projects?action=create"
                  className="flex items-center p-3 rounded-lg bg-primary-50 hover:bg-primary-100 transition-colors duration-200 group"
                  data-testid="quick-create-project"
                >
                  <div className="p-2 bg-primary-100 rounded-lg group-hover:bg-primary-200">
                    <Plus className="w-4 h-4 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      New Project
                    </p>
                    <p className="text-xs text-gray-600">
                      Start a new project
                    </p>
                  </div>
                </Link>

                <Link
                  to="/portfolio"
                  className="flex items-center p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors duration-200 group"
                  data-testid="quick-view-portfolio"
                >
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      View Portfolio
                    </p>
                    <p className="text-xs text-gray-600">
                      Showcase your work
                    </p>
                  </div>
                </Link>

                <Link
                  to="/analytics"
                  className="flex items-center p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors duration-200 group"
                  data-testid="quick-view-analytics"
                >
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      Analytics
                    </p>
                    <p className="text-xs text-gray-600">
                      View insights
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Project Types Overview */}
          {analytics?.project_types && Object.keys(analytics.project_types).length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">
                  Project Types
                </h2>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  {Object.entries(analytics.project_types).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">
                        {type}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;