import React, { useState } from 'react';
import { 
  User,
  Mail,
  Briefcase,
  FileText,
  Plus,
  X,
  Save,
  Edit
} from 'lucide-react';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const UserProfile = ({ currentUser, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    title: currentUser?.title || '',
    bio: currentUser?.bio || '',
    skills: currentUser?.skills || [],
    social_links: currentUser?.social_links || {}
  });
  const [newSkill, setNewSkill] = useState('');
  const [newSocialPlatform, setNewSocialPlatform] = useState('');
  const [newSocialUrl, setNewSocialUrl] = useState('');

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleAddSocialLink = () => {
    if (newSocialPlatform.trim() && newSocialUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        social_links: {
          ...prev.social_links,
          [newSocialPlatform.toLowerCase()]: newSocialUrl
        }
      }));
      setNewSocialPlatform('');
      setNewSocialUrl('');
    }
  };

  const handleRemoveSocialLink = (platform) => {
    setFormData(prev => {
      const newSocialLinks = { ...prev.social_links };
      delete newSocialLinks[platform];
      return {
        ...prev,
        social_links: newSocialLinks
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setLoading(true);
    try {
      const updatedUser = await apiService.updateUser(currentUser.id, formData);
      onUpdateUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      title: currentUser?.title || '',
      bio: currentUser?.bio || '',
      skills: currentUser?.skills || [],
      social_links: currentUser?.social_links || {}
    });
    setIsEditing(false);
    setNewSkill('');
    setNewSocialPlatform('');
    setNewSocialUrl('');
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" data-testid="profile-title">
            Profile Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your personal information and preferences
          </p>
        </div>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="btn-primary inline-flex items-center"
            data-testid="edit-profile-button"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              form="profile-form"
              type="submit"
              className="btn-primary inline-flex items-center"
              disabled={loading}
              data-testid="save-profile-button"
            >
              {loading ? (
                <>
                  <div className="spinner mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Form */}
        <div className="lg:col-span-2">
          <form id="profile-form" onSubmit={handleSubmit}>
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </h2>
              </div>
              <div className="card-body space-y-6">
                {/* Name and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="input"
                        data-testid="name-input"
                      />
                    ) : (
                      <p className="text-gray-900 py-2" data-testid="name-display">
                        {currentUser.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="input"
                        data-testid="email-input"
                      />
                    ) : (
                      <p className="text-gray-900 py-2" data-testid="email-display">
                        {currentUser.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Title
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="e.g., Full Stack Developer"
                      data-testid="title-input"
                    />
                  ) : (
                    <p className="text-gray-900 py-2" data-testid="title-display">
                      {currentUser.title || 'Not specified'}
                    </p>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Tell us about yourself..."
                      data-testid="bio-input"
                    />
                  ) : (
                    <p className="text-gray-900 py-2 leading-relaxed" data-testid="bio-display">
                      {currentUser.bio || 'No bio provided'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div className="card mt-6">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Skills & Technologies
                </h2>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {/* Current Skills */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Current Skills
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                          data-testid={`skill-${skill}`}
                        >
                          {skill}
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="ml-2 text-primary-600 hover:text-primary-800"
                              data-testid={`remove-skill-${skill}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </span>
                      ))}
                      {formData.skills.length === 0 && (
                        <p className="text-gray-500 text-sm">No skills added yet</p>
                      )}
                    </div>
                  </div>

                  {/* Add New Skill */}
                  {isEditing && (
                    <div>
                      <label htmlFor="newSkill" className="block text-sm font-medium text-gray-700 mb-2">
                        Add New Skill
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          id="newSkill"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Enter a skill"
                          className="input flex-1"
                          data-testid="new-skill-input"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                        />
                        <button
                          type="button"
                          onClick={handleAddSkill}
                          className="btn-secondary inline-flex items-center"
                          data-testid="add-skill-button"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Social Links Section */}
            <div className="card mt-6">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Social Links
                </h2>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {/* Current Social Links */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Current Links
                    </label>
                    <div className="space-y-2">
                      {Object.entries(formData.social_links).map(([platform, url]) => (
                        <div
                          key={platform}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          data-testid={`social-link-${platform}`}
                        >
                          <div>
                            <span className="font-medium text-gray-900 capitalize">
                              {platform}
                            </span>
                            <p className="text-sm text-gray-600 break-all">
                              {url}
                            </p>
                          </div>
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSocialLink(platform)}
                              className="text-red-600 hover:text-red-800 p-1"
                              data-testid={`remove-social-${platform}`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      {Object.keys(formData.social_links).length === 0 && (
                        <p className="text-gray-500 text-sm">No social links added yet</p>
                      )}
                    </div>
                  </div>

                  {/* Add New Social Link */}
                  {isEditing && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Add New Social Link
                      </label>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={newSocialPlatform}
                          onChange={(e) => setNewSocialPlatform(e.target.value)}
                          placeholder="Platform (e.g., github, linkedin)"
                          className="input"
                          data-testid="new-social-platform-input"
                        />
                        <div className="flex space-x-2">
                          <input
                            type="url"
                            value={newSocialUrl}
                            onChange={(e) => setNewSocialUrl(e.target.value)}
                            placeholder="URL (https://...)"
                            className="input flex-1"
                            data-testid="new-social-url-input"
                          />
                          <button
                            type="button"
                            onClick={handleAddSocialLink}
                            className="btn-secondary inline-flex items-center"
                            data-testid="add-social-button"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Profile Preview */}
        <div className="lg:col-span-1">
          <div className="card sticky top-4">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">
                Profile Preview
              </h2>
            </div>
            <div className="card-body">
              <div className="text-center">
                {/* Avatar */}
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {(formData.name || currentUser.name).charAt(0).toUpperCase()}
                </div>

                {/* Name and Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {formData.name || currentUser.name}
                </h3>
                
                {formData.title && (
                  <p className="text-primary-600 mb-3">
                    {formData.title}
                  </p>
                )}

                {/* Email */}
                <p className="text-sm text-gray-600 mb-4">
                  {formData.email || currentUser.email}
                </p>

                {/* Bio Preview */}
                {formData.bio && (
                  <p className="text-sm text-gray-700 leading-relaxed mb-4">
                    {formData.bio.length > 100 
                      ? `${formData.bio.substring(0, 100)}...` 
                      : formData.bio
                    }
                  </p>
                )}

                {/* Skills Count */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {formData.skills.length}
                  </div>
                  <div className="text-xs text-gray-600">
                    Skills
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;