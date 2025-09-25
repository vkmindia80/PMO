import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Calendar,
  Award,
  Star
} from 'lucide-react';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Portfolio = ({ currentUser }) => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Use current user if no userId in params, otherwise fetch the specified user
  const displayUserId = userId || currentUser?.id;

  useEffect(() => {
    if (displayUserId) {
      loadPortfolioData();
    }
  }, [displayUserId]);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      
      // Load user data
      const userData = userId ? await apiService.getUserById(userId) : currentUser;
      setUser(userData);
      
      // Load user's projects
      const projectsData = await apiService.getProjects({ 
        userId: displayUserId,
        status: 'completed', // Only show completed projects in portfolio
        limit: 50 
      });
      setProjects(projectsData);
      
    } catch (error) {
      console.error('Failed to load portfolio data:', error);
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

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          User not found
        </h3>
        <p className="text-gray-600">
          The portfolio you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  const getSocialIcon = (platform) => {
    const icons = {
      github: Github,
      linkedin: Linkedin,
      twitter: ExternalLink,
      website: ExternalLink,
      portfolio: ExternalLink,
    };
    return icons[platform.toLowerCase()] || ExternalLink;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
            {/* Avatar */}
            <div className="flex-shrink-0 mb-6 md:mb-0">
              <div className="w-32 h-32 bg-gradient-primary rounded-full flex items-center justify-center text-white text-4xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="portfolio-name">
                {user.name}
              </h1>
              
              {user.title && (
                <p className="text-xl text-primary-600 mb-4" data-testid="portfolio-title">
                  {user.title}
                </p>
              )}

              {user.bio && (
                <p className="text-gray-600 mb-6 leading-relaxed" data-testid="portfolio-bio">
                  {user.bio}
                </p>
              )}

              {/* Contact Info */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <a
                  href={`mailto:${user.email}`}
                  className="flex items-center text-gray-600 hover:text-primary-600 transition-colors"
                  data-testid="portfolio-email"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {user.email}
                </a>
                
                <span className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  Joined {new Date(user.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </span>
              </div>

              {/* Social Links */}
              {user.social_links && Object.keys(user.social_links).length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {Object.entries(user.social_links).map(([platform, url]) => {
                    const Icon = getSocialIcon(platform);
                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-2 bg-gray-100 hover:bg-primary-100 text-gray-700 hover:text-primary-700 rounded-lg transition-colors"
                        data-testid={`social-${platform}`}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        <span className="capitalize">{platform}</span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      {user.skills && user.skills.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Skills & Technologies
            </h2>
          </div>
          <div className="card-body">
            <div className="flex flex-wrap gap-3">
              {user.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                  data-testid={`skill-${skill}`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Projects Section */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Star className="w-5 h-5 mr-2" />
              Featured Projects ({projects.length})
            </h2>
            {!userId && (
              <p className="text-sm text-gray-600">
                Showing completed projects only
              </p>
            )}
          </div>
        </div>

        <div className="card-body">
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No completed projects yet
              </h3>
              <p className="text-gray-600">
                {userId ? 'This user hasn\'t completed any projects yet.' : 'Complete some projects to showcase them in your portfolio.'}
              </p>
            </div>
          ) : (
            <div className="grid-responsive">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-gray-50 rounded-xl p-6 hover-shadow hover-lift transition-all duration-300"
                  data-testid={`portfolio-project-${project.id}`}
                >
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {project.title}
                    </h3>
                    <span className="badge badge-success ml-2 flex-shrink-0">
                      Completed
                    </span>
                  </div>

                  {/* Project Description */}
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {project.description}
                  </p>

                  {/* Technologies */}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.slice(0, 6).map((tech, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-white text-gray-700 rounded border"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 6 && (
                          <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded">
                            +{project.technologies.length - 6} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Project Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(project.created_at).getFullYear()}
                      </span>
                      <span className="capitalize">
                        {project.project_type}
                      </span>
                    </div>
                    
                    {/* Project Tags */}
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex gap-1">
                        {project.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* View Project Link */}
                  {!userId && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <a
                        href={`/projects/${project.id}`}
                        className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm"
                      >
                        View Project Details
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Portfolio Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {projects.length}
            </div>
            <div className="text-sm text-gray-600">
              Completed Projects
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-success-600 mb-2">
              {user.skills ? user.skills.length : 0}
            </div>
            <div className="text-sm text-gray-600">
              Technologies
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-warning-600 mb-2">
              {new Date().getFullYear() - new Date(user.created_at).getFullYear() || '<1'}
            </div>
            <div className="text-sm text-gray-600">
              Years Active
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">
            Get In Touch
          </h2>
        </div>
        <div className="card-body">
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Interested in working together? Feel free to reach out!
            </p>
            <a
              href={`mailto:${user.email}`}
              className="btn-primary inline-flex items-center"
              data-testid="contact-button"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact {user.name.split(' ')[0]}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;