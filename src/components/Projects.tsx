
import { Folder, GitBranch, Clock } from 'lucide-react';

export function Projects() {
  const projects = [
    {
      id: 1,
      name: 'Website Redesign',
      description: 'Complete overhaul of the company website',
      progress: 75,
      dueDate: '2024-04-15',
      team: ['John Doe', 'Jane Smith', 'Mike Johnson']
    },
    {
      id: 2,
      name: 'Mobile App Development',
      description: 'New mobile application for customer engagement',
      progress: 45,
      dueDate: '2024-05-01',
      team: ['Sarah Wilson', 'Tom Brown']
    }
  ];

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Folder className="h-6 w-6 text-indigo-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
              </div>
              <span className="text-sm text-gray-500 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {project.dueDate}
              </span>
            </div>
            <p className="text-gray-600 mb-4">{project.description}</p>
            <div className="mb-4">
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
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                {project.team.map((member, index) => (
                  <img
                    key={index}
                    className="w-8 h-8 rounded-full border-2 border-white"
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member)}&background=random`}
                    alt={member}
                  />
                ))}
              </div>
              <div className="flex items-center text-gray-500">
                <GitBranch className="h-4 w-4 mr-1" />
                <span className="text-sm">4 branches</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}