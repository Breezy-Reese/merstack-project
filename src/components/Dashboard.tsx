import { useState, useEffect } from 'react';
import { Users, FolderKanban, MessageSquare, Globe, TrendingUp, Code } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Stats {
  totalDevelopers: number;
  totalProjects: number;
  totalMessages: number;
  topCountries: { country: string; count: number }[];
  topLanguages: { language: string; count: number }[];
  experienceLevels: { level: string; count: number }[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalDevelopers: 0,
    totalProjects: 0,
    totalMessages: 0,
    topCountries: [],
    topLanguages: [],
    experienceLevels: [],
  });
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_BASE || 'https://merstack-project.onrender.com';

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/profiles/stats`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to load stats');
      const data = await res.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-12 h-12 opacity-80" />
            <div className="text-right">
              <p className="text-3xl font-bold">{stats.totalDevelopers}</p>
              <p className="text-blue-100">Developers</p>
            </div>
          </div>
          <p className="text-blue-100 text-sm">Total registered developers on the platform</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <FolderKanban className="w-12 h-12 opacity-80" />
            <div className="text-right">
              <p className="text-3xl font-bold">{stats.totalProjects}</p>
              <p className="text-green-100">Projects</p>
            </div>
          </div>
          <p className="text-green-100 text-sm">Active collaboration projects</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <MessageSquare className="w-12 h-12 opacity-80" />
            <div className="text-right">
              <p className="text-3xl font-bold">{stats.totalMessages}</p>
              <p className="text-purple-100">Messages</p>
            </div>
          </div>
          <p className="text-purple-100 text-sm">Total messages exchanged</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-slate-900">Top Countries</h3>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topCountries.length > 0 ? stats.topCountries : [{ country: 'No Data', count: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="country" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} developers`, 'Count']} />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Code className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-slate-900">Popular Languages</h3>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topLanguages.length > 0 ? stats.topLanguages : [{ language: 'No Data', count: 0 }]} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="language" type="category" width={80} />
                <Tooltip formatter={(value) => [`${value} developers`, 'Count']} />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-slate-900">Experience Distribution</h3>
        </div>

        {stats.experienceLevels.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.experienceLevels}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.experienceLevels.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={
                      entry.level === 'Beginner' ? '#94a3b8' :
                      entry.level === 'Intermediate' ? '#3b82f6' :
                      '#10b981'
                    } />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} developers`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-slate-500 text-center py-8">No data available</p>
        )}
      </div>
    </div>
  );
}
