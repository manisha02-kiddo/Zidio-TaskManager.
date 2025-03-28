import React, { useState } from 'react';
import { Folder, GitBranch, Clock, ChevronDown, ChevronUp, Users,  FileText,  CheckSquare,  MessageCircle, Plus, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Subproject {
  id: number;
  name: string;
  description: string;
  progress: number;
  dueDate: string;
  team: string[];
  status: 'in-progress' | 'completed' | 'pending';
  tasks: number;
  documents: number;
}

interface Project {
  id: number;
  name: string;
  description: string;
  progress: number;
  dueDate: string;
  team: string[];
  subprojects: Subproject[];
  metrics: {
    tasks: number;
    documents: number;
    commits: number;
    discussions: number;
  };
}

interface NewProjectData {
  name: string;
  description: string;
  dueDate: string;
  team: string[];
}

export function Projects() {
  const [expandedProject, setExpandedProject] = useState<number | null>(null);
  const [selectedSubproject, setSelectedSubproject] = useState<Subproject | null>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectData, setNewProjectData] = useState<NewProjectData>({
    name: '',
    description: '',
    dueDate: '',
    team: []
  });
  const { user } = useAuth();

  const projects: Project[] = [
    {
      id: 1,
      name: 'Website Redesign',
      description: 'Complete overhaul of the company website',
      progress: 75,
      dueDate: '2024-04-15',
      team: ['John Doe', 'Jane Smith', 'Mike Johnson'],
      metrics: {
        tasks: 48,
        documents: 15,
        commits: 234,
        discussions: 56
      },
      subprojects: [
        {
          id: 11,
          name: 'Frontend Development',
          description: 'Implement new UI components and responsive design',
          progress: 85,
          dueDate: '2024-03-30',
          team: ['Jane Smith', 'Mike Johnson'],
          status: 'in-progress',
          tasks: 24,
          documents: 8
        },
        {
          id: 12,
          name: 'Backend API Integration',
          description: 'Connect new frontend with existing backend services',
          progress: 65,
          dueDate: '2024-04-10',
          team: ['John Doe'],
          status: 'in-progress',
          tasks: 16,
          documents: 5
        },
        {
          id: 13,
          name: 'Content Migration',
          description: 'Transfer and update content to new website structure',
          progress: 45,
          dueDate: '2024-04-05',
          team: ['Mike Johnson'],
          status: 'pending',
          tasks: 8,
          documents: 2
        }
      ]
    },
    {
      id: 2,
      name: 'Mobile App Development',
      description: 'New mobile application for customer engagement',
      progress: 45,
      dueDate: '2024-05-01',
      team: ['Sarah Wilson', 'Tom Brown'],
      metrics: {
        tasks: 36,
        documents: 12,
        commits: 156,
        discussions: 42
      },
      subprojects: [
        {
          id: 21,
          name: 'User Authentication',
          description: 'Implement secure login and registration system',
          progress: 100,
          dueDate: '2024-03-25',
          team: ['Sarah Wilson'],
          status: 'completed',
          tasks: 12,
          documents: 4
        },
        {
          id: 22,
          name: 'Product Catalog',
          description: 'Build product browsing and search functionality',
          progress: 60,
          dueDate: '2024-04-15',
          team: ['Tom Brown'],
          status: 'in-progress',
          tasks: 18,
          documents: 6
        },
        {
          id: 23,
          name: 'Payment Integration',
          description: 'Integrate payment gateway and checkout process',
          progress: 20,
          dueDate: '2024-04-25',
          team: ['Sarah Wilson', 'Tom Brown'],
          status: 'in-progress',
          tasks: 6,
          documents: 2
        }
      ]
    }
  ];

  const getStatusColor = (status: Subproject['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Here you would typically make an API call to create the project
      // For now, we'll just show a success message
      toast.success('Project created successfully!');
      setShowNewProjectModal(false);
      setNewProjectData({
        name: '',
        description: '',
        dueDate: '',
        team: []
      });
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    }
  };

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <button
          onClick={() => setShowNewProjectModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Project
        </button>
      </div>

      <div className="space-y-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Project Header */}
            <div 
              className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Folder className="h-6 w-6 text-indigo-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-500">{project.description}</p>
                  </div>
                </div>
                {expandedProject === project.id ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Due: {project.dueDate}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{project.team.length} members</span>
                </div>
                <div className="flex items-center space-x-2">
                  <GitBranch className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{project.metrics.commits} commits</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{project.metrics.discussions} discussions</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 rounded-full h-2"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Expanded Project Content */}
            {expandedProject === project.id && (
              <div className="border-t border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {project.subprojects.map((subproject) => (
                    <div
                      key={subproject.id}
                      className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedSubproject(subproject)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-gray-900">{subproject.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subproject.status)}`}>
                          {subproject.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{subproject.description}</p>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Progress</span>
                          <span className="font-medium">{subproject.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 rounded-full h-2"
                            style={{ width: `${subproject.progress}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center">
                            <CheckSquare className="h-4 w-4 mr-1" />
                            {subproject.tasks} tasks
                          </div>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            {subproject.documents} docs
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Create New Project</h2>
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-6">
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
                  Project Name *
                </label>
                <input
                  type="text"
                  id="projectName"
                  value={newProjectData.name}
                  onChange={(e) => setNewProjectData({ ...newProjectData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="projectDescription"
                  value={newProjectData.description}
                  onChange={(e) => setNewProjectData({ ...newProjectData, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="projectDueDate" className="block text-sm font-medium text-gray-700">
                  Due Date *
                </label>
                <input
                  type="date"
                  id="projectDueDate"
                  value={newProjectData.dueDate}
                  onChange={(e) => setNewProjectData({ ...newProjectData, dueDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Team Members</label>
                <div className="mt-2 space-y-2">
                  {['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'Tom Brown'].map((member) => (
                    <label key={member} className="inline-flex items-center mr-4">
                      <input
                        type="checkbox"
                        checked={newProjectData.team.includes(member)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewProjectData({
                              ...newProjectData,
                              team: [...newProjectData.team, member]
                            });
                          } else {
                            setNewProjectData({
                              ...newProjectData,
                              team: newProjectData.team.filter((t) => t !== member)
                            });
                          }
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{member}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
       <div>
    {user ? <p>Logged in as {user.email}</p> : <p>Please log in</p>}
  </div>

      {/* Subproject Details Modal */}
      {selectedSubproject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedSubproject.name}</h3>
                <p className="text-gray-600 mt-1">{selectedSubproject.description}</p>
              </div>
              <button
                onClick={() => setSelectedSubproject(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Team Members</h4>
                <div className="flex -space-x-2">
                  {selectedSubproject.team.map((member, index) => (
                    <img
                      key={index}
                      className="w-8 h-8 rounded-full border-2 border-white"
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member)}&background=random`}
                      alt={member}
                    />
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Due Date</h4>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2" />
                  {selectedSubproject.dueDate}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Progress</h4>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 rounded-full h-2"
                    style={{ width: `${selectedSubproject.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckSquare className="h-5 w-5 text-indigo-600 mr-2" />
                      <span className="font-medium">Tasks</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{selectedSubproject.tasks}</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-indigo-600 mr-2" />
                      <span className="font-medium">Documents</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{selectedSubproject.documents}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                View Details
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Edit Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
