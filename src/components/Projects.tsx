import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, X, Users, Code, Calendar, FolderKanban } from 'lucide-react';

interface Project {
  _id: string;
  title: string;
  description?: string;
  tech_stack: string[];
  created_by: string;
  status: 'Planning' | 'Active' | 'Completed' | 'Archived';
  created_at: string;
  updated_at: string;
}

interface Profile {
  _id: string;
  name: string;
  username: string;
  country: string;
  province?: string;
  languages: string[];
  skills: string[];
  experience: 'Beginner' | 'Intermediate' | 'Expert';
  bio?: string;
  github?: string;
  portfolio?: string;
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

interface ProjectWithCreator extends Project {
  creator?: Profile;
  member_count?: number;
}

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectWithCreator[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    tech_stack: [] as string[],
    status: 'Planning' as 'Planning' | 'Active' | 'Completed' | 'Archived',
  });
  const [techInput, setTechInput] = useState('');

  const API_BASE = import.meta.env.VITE_API_BASE || '';

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/projects`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to load projects');
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
    setLoading(false);
  };

  const createProject = async () => {
    if (!newProject.title) return;

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(newProject),
      });
      if (!res.ok) throw new Error('Failed to create project');
      await loadProjects();
      setShowCreateModal(false);
      setNewProject({
        title: '',
        description: '',
        tech_stack: [],
        status: 'Planning',
      });
      setTechInput('');
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const addTech = () => {
    if (techInput && !newProject.tech_stack.includes(techInput)) {
      setNewProject({
        ...newProject,
        tech_stack: [...newProject.tech_stack, techInput],
      });
      setTechInput('');
    }
  };

  const removeTech = (tech: string) => {
    setNewProject({
      ...newProject,
      tech_stack: newProject.tech_stack.filter(t => t !== tech),
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planning': return 'bg-slate-100 text-slate-700';
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Completed': return 'bg-blue-100 text-blue-700';
      case 'Archived': return 'bg-slate-100 text-slate-500';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FolderKanban className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-900">Projects</h2>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <div key={project._id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 flex-1">{project.title}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>

            {project.description && (
              <p className="text-slate-600 mb-4 line-clamp-3">{project.description}</p>
            )}

            {project.tech_stack.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                  <Code className="w-4 h-4" />
                  <span className="font-medium">Tech Stack:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.tech_stack.slice(0, 4).map(tech => (
                    <span key={tech} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                      {tech}
                    </span>
                  ))}
                  {project.tech_stack.length > 4 && (
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                      +{project.tech_stack.length - 4}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users className="w-4 h-4" />
                <span>{project.member_count} member{project.member_count !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="w-4 h-4" />
                <span>{new Date(project.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {project.creator && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {project.creator.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{project.creator.name}</p>
                    <p className="text-xs text-slate-500">Project Creator</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <FolderKanban className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No projects yet</h3>
          <p className="text-slate-600 mb-4">Create your first project to start collaborating</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            Create Project
          </button>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900">Create New Project</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Project Title</label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="My Awesome Project"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  rows={4}
                  placeholder="Describe your project..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tech Stack</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Add technology..."
                  />
                  <button
                    type="button"
                    onClick={addTech}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newProject.tech_stack.map(tech => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg flex items-center gap-2"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTech(tech)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <div className="grid grid-cols-4 gap-3">
                  {['Planning', 'Active', 'Completed', 'Archived'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setNewProject({ ...newProject, status: status as any })}
                      className={`py-3 rounded-lg font-medium transition ${
                        newProject.status === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={createProject}
                  disabled={!newProject.title}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
