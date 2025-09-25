import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileText, 
  FolderOpen, 
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import { apiService, downloadPDF } from '../services/api';
import toast from 'react-hot-toast';

const ExportModal = ({ isOpen, onClose, currentUser, projects = [] }) => {
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState('portfolio');
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [includeAll, setIncludeAll] = useState(true);

  const handleExport = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      let result;
      
      if (exportType === 'portfolio') {
        result = await apiService.exportPortfolioPDF(currentUser.id);
        toast.success('Portfolio PDF generated successfully!');
      } else {
        const projectIds = includeAll ? null : selectedProjects;
        result = await apiService.exportProjectsPDF(currentUser.id, projectIds);
        toast.success('Projects PDF generated successfully!');
      }
      
      // Download the file
      const blob = await apiService.downloadExportedFile(result.filename);
      downloadPDF(blob, result.filename);
      
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleProject = (projectId) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const selectAllProjects = () => {
    if (selectedProjects.length === projects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(projects.map(p => p.id));
    }
  };

  if (!isOpen) return null;

  const completedProjects = projects.filter(p => p.status === 'completed');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Download className="w-5 h-5 mr-2" />
              Export to PDF
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              data-testid="close-export-modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {/* Export Type Selection */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              What would you like to export?
            </h4>
            
            <div className="space-y-3">
              <label className="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="exportType"
                  value="portfolio"
                  checked={exportType === 'portfolio'}
                  onChange={(e) => setExportType(e.target.value)}
                  className="mt-1 mr-3"
                  data-testid="export-portfolio-radio"
                />
                <div className="flex-1">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium text-gray-900">Portfolio Overview</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Export your complete portfolio including profile information, skills, 
                    completed projects, and performance summary. Perfect for sharing your 
                    professional profile.
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    Includes: {completedProjects.length} completed projects, skills, analytics
                  </div>
                </div>
              </label>

              <label className="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="exportType"
                  value="projects"
                  checked={exportType === 'projects'}
                  onChange={(e) => setExportType(e.target.value)}
                  className="mt-1 mr-3"
                  data-testid="export-projects-radio"
                />
                <div className="flex-1">
                  <div className="flex items-center">
                    <FolderOpen className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-medium text-gray-900">Detailed Projects Report</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Export detailed information about your projects including descriptions, 
                    technologies, timelines, and task details. Great for project documentation.
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    Includes: Project details, technologies, tasks, timelines
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Project Selection (for projects export) */}
          {exportType === 'projects' && projects.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">
                  Select Projects to Include
                </h4>
                <button
                  onClick={selectAllProjects}
                  className="text-sm text-primary-600 hover:text-primary-700"
                  data-testid="select-all-projects"
                >
                  {selectedProjects.length === projects.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeAll}
                    onChange={(e) => {
                      setIncludeAll(e.target.checked);
                      if (e.target.checked) {
                        setSelectedProjects([]);
                      }
                    }}
                    className="mr-2"
                    data-testid="include-all-projects"
                  />
                  <span className="text-sm text-gray-700">
                    Include all projects ({projects.length})
                  </span>
                </label>
              </div>

              {!includeAll && (
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                  {projects.map((project) => (
                    <label
                      key={project.id}
                      className="flex items-start p-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProjects.includes(project.id)}
                        onChange={() => toggleProject(project.id)}
                        className="mt-1 mr-3"
                        data-testid={`project-${project.id}-checkbox`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900 text-sm">
                            {project.title}
                          </span>
                          <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            project.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : project.status === 'in-progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {project.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {project.status === 'in-progress' && <AlertCircle className="w-3 h-3 mr-1" />}
                            {project.status.replace('-', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {project.description}
                        </p>
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="mt-1">
                            <span className="text-xs text-gray-500">
                              {project.technologies.slice(0, 3).join(', ')}
                              {project.technologies.length > 3 && ` +${project.technologies.length - 3} more`}
                            </span>
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {!includeAll && selectedProjects.length === 0 && (
                <div className="text-center py-6">
                  <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Select at least one project to export
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Export Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Export Preview
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              {exportType === 'portfolio' ? (
                <>
                  <div>• Profile information and skills</div>
                  <div>• {completedProjects.length} completed projects</div>
                  <div>• Portfolio analytics and summary</div>
                  <div>• Professional presentation format</div>
                </>
              ) : (
                <>
                  <div>• {includeAll ? projects.length : selectedProjects.length} selected projects</div>
                  <div>• Detailed project descriptions</div>
                  <div>• Technologies and tools used</div>
                  <div>• Project timelines and status</div>
                </>
              )}
              <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                Generated on {new Date().toLocaleDateString()} • PDF Format
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
              data-testid="cancel-export"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={loading || (exportType === 'projects' && !includeAll && selectedProjects.length === 0)}
              className="btn-primary inline-flex items-center"
              data-testid="confirm-export"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;