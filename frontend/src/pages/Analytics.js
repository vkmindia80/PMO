import React, { useState, useEffect } from 'react';
import { 
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Filter
} from 'lucide-react';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Analytics = ({ currentUser }) => {
  const [analytics, setAnalytics] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all'); // all, 30d, 90d, 1y
  const [selectedMetric, setSelectedMetric] = useState('completion');

  useEffect(() => {
    if (currentUser) {
      loadAnalyticsData();
    }
  }, [currentUser, timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Load analytics
      const analyticsData = await apiService.getDashboardAnalytics(currentUser.id);
      setAnalytics(analyticsData);
      
      // Load all projects for detailed analysis
      const projectsData = await apiService.getProjects({ 
        userId: currentUser.id, 
        limit: 100 
      });
      setProjects(projectsData);
      
    } catch (error) {
      console.error('Failed to load analytics data:', error);
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

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No analytics data available
        </h3>
        <p className="text-gray-600">
          Start creating projects to see your analytics
        </p>
      </div>
    );
  }

  // Calculate additional metrics
  const projectsByStatus = projects.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1;
    return acc;
  }, {});

  const projectsByType = projects.reduce((acc, project) => {
    acc[project.project_type] = (acc[project.project_type] || 0) + 1;
    return acc;
  }, {});

  const projectsByPriority = projects.reduce((acc, project) => {
    acc[project.priority] = (acc[project.priority] || 0) + 1;
    return acc;
  }, {});

  // Recent activity (projects created in last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentProjects = projects.filter(project => 
    new Date(project.created_at) >= thirtyDaysAgo
  );

  const keyMetrics = [
    {
      title: 'Total Projects',
      value: analytics.projects.total,
      change: `+${recentProjects.length} this month`,
      icon: Target,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      testId: 'total-projects-metric'
    },
    {
      title: 'Completion Rate',
      value: `${analytics.projects.completion_rate}%`,
      change: `${analytics.projects.completed}/${analytics.projects.total} completed`,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-100',
      testId: 'completion-rate-metric'
    },
    {
      title: 'Active Projects',
      value: analytics.projects.in_progress,
      change: 'Currently in progress',
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
      testId: 'active-projects-metric'
    },
    {
      title: 'Task Completion',
      value: `${analytics.tasks.completion_rate}%`,
      change: `${analytics.tasks.completed}/${analytics.tasks.total} tasks`,
      icon: AlertCircle,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      testId: 'task-completion-metric'
    },
  ];

  const statusColors = {
    'planning': { bg: 'bg-yellow-500', text: 'Planning' },
    'in-progress': { bg: 'bg-blue-500', text: 'In Progress' },
    'completed': { bg: 'bg-green-500', text: 'Completed' },
    'on-hold': { bg: 'bg-gray-500', text: 'On Hold' },
  };

  const typeColors = {
    'software': { bg: 'bg-blue-500', text: 'Software' },
    'design': { bg: 'bg-purple-500', text: 'Design' },
    'business': { bg: 'bg-green-500', text: 'Business' },
    'other': { bg: 'bg-gray-500', text: 'Other' },
  };

  const priorityColors = {
    'low': { bg: 'bg-gray-500', text: 'Low' },
    'medium': { bg: 'bg-yellow-500', text: 'Medium' },
    'high': { bg: 'bg-orange-500', text: 'High' },
    'critical': { bg: 'bg-red-500', text: 'Critical' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" data-testid="analytics-title">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Insights into your project performance and productivity
          </p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input w-auto"
            data-testid="time-range-filter"
          >
            <option value="all">All Time</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          
          <button
            className="btn-secondary inline-flex items-center"
            data-testid="export-analytics-button"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.title} className="card" data-testid={metric.testId}>
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {metric.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {metric.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {metric.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${metric.bg}`}>
                    <Icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Distribution */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Project Status Distribution
            </h2>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {Object.entries(projectsByStatus).map(([status, count]) => {
                const config = statusColors[status] || { bg: 'bg-gray-500', text: status };
                const percentage = analytics.projects.total > 0 
                  ? ((count / analytics.projects.total) * 100).toFixed(1) 
                  : 0;
                
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${config.bg} mr-3`}></div>
                      <span className="text-sm font-medium text-gray-700">
                        {config.text}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{count}</span>
                      <span className="text-xs text-gray-500">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Project Types Distribution */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Project Types
            </h2>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {Object.entries(projectsByType).map(([type, count]) => {
                const config = typeColors[type] || { bg: 'bg-gray-500', text: type };
                const percentage = analytics.projects.total > 0 
                  ? ((count / analytics.projects.total) * 100).toFixed(1) 
                  : 0;
                
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${config.bg} mr-3`}></div>
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {config.text}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{count}</span>
                      <span className="text-xs text-gray-500">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Priority Distribution
            </h2>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {Object.entries(projectsByPriority).map(([priority, count]) => {
                const config = priorityColors[priority] || { bg: 'bg-gray-500', text: priority };
                const percentage = analytics.projects.total > 0 
                  ? ((count / analytics.projects.total) * 100).toFixed(1) 
                  : 0;
                
                return (
                  <div key={priority} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${config.bg} mr-3`}></div>
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {config.text}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{count}</span>
                      <span className="text-xs text-gray-500">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Recent Activity (30 days)
            </h2>
          </div>
          <div className="card-body">
            {recentProjects.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600">
                  No projects created in the last 30 days
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentProjects.slice(0, 5).map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    data-testid={`recent-project-${project.id}`}
                  >
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {project.title}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {new Date(project.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`badge ${
                      project.status === 'completed' ? 'badge-success' :
                      project.status === 'in-progress' ? 'badge-primary' :
                      project.status === 'planning' ? 'badge-warning' : 'badge-gray'
                    }`}>
                      {project.status.replace('-', ' ')}
                    </span>
                  </div>
                ))}
                {recentProjects.length > 5 && (
                  <p className="text-xs text-gray-500 text-center pt-2">
                    +{recentProjects.length - 5} more projects
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">
            Performance Summary
          </h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Completion Trends */}
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {analytics.projects.completion_rate}%
              </div>
              <div className="text-sm text-gray-600 mb-4">
                Project Completion Rate
              </div>
              <div className="progress-bar h-2">
                <div 
                  className="progress-fill bg-green-500" 
                  style={{ width: `${analytics.projects.completion_rate}%` }}
                ></div>
              </div>
            </div>

            {/* Task Performance */}
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {analytics.tasks.completion_rate}%
              </div>
              <div className="text-sm text-gray-600 mb-4">
                Task Completion Rate
              </div>
              <div className="progress-bar h-2">
                <div 
                  className="progress-fill bg-blue-500" 
                  style={{ width: `${analytics.tasks.completion_rate}%` }}
                ></div>
              </div>
            </div>

            {/* Activity Score */}
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {Math.min(100, recentProjects.length * 10)}%
              </div>
              <div className="text-sm text-gray-600 mb-4">
                Activity Score (30d)
              </div>
              <div className="progress-bar h-2">
                <div 
                  className="progress-fill bg-purple-500" 
                  style={{ width: `${Math.min(100, recentProjects.length * 10)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">
            Recommendations
          </h2>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {analytics.projects.completion_rate < 50 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">
                      Improve Project Completion Rate
                    </h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Your project completion rate is below 50%. Consider breaking down large projects into smaller, manageable tasks.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {analytics.projects.in_progress > 5 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">
                      Focus on Active Projects
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">
                      You have {analytics.projects.in_progress} projects in progress. Consider focusing on completing existing projects before starting new ones.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {recentProjects.length === 0 && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-gray-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-800">
                      Stay Active
                    </h4>
                    <p className="text-sm text-gray-700 mt-1">
                      No new projects in the last 30 days. Consider starting a new project to maintain momentum.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {analytics.projects.completion_rate >= 80 && recentProjects.length > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-green-800">
                      Great Job!
                    </h4>
                    <p className="text-sm text-green-700 mt-1">
                      You're maintaining excellent project completion rates and staying active. Keep up the great work!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;