import { useState, useEffect } from 'react';
import { Users, FolderKanban, MessageSquare, Globe, TrendingUp, Code } from 'lucide-react';

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

  const API_BASE = import.meta.env.VITE_API_BASE || '';

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

          {stats.topCountries.length > 0 ? (
            <div className="space-y-4">
              {stats.topCountries.map((item, index) => (
                <div key={item.country}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-700 font-medium">{item.country}</span>
                    <span className="text-slate-600">{item.count} developers</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(item.count / stats.totalDevelopers) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No data available</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Code className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-slate-900">Popular Languages</h3>
          </div>

          {stats.topLanguages.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {stats.topLanguages.map((item) => (
                <div
                  key={item.language}
                  className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition"
                >
                  <p className="text-slate-900 font-medium mb-1">{item.language}</p>
                  <p className="text-slate-600 text-sm">{item.count} developers</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No data available</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-slate-900">Experience Distribution</h3>
        </div>

        {stats.experienceLevels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.experienceLevels.map((item) => (
              <div key={item.level} className="text-center">
                <div className="relative inline-block mb-4">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      className="text-slate-100"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - item.count / stats.totalDevelopers)}`}
                      className={`${
                        item.level === 'Beginner' ? 'text-slate-400' :
                        item.level === 'Intermediate' ? 'text-blue-500' :
                        'text-green-500'
                      }`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-slate-900">{item.count}</span>
                  </div>
                </div>
                <p className="text-lg font-semibold text-slate-900">{item.level}</p>
                <p className="text-slate-600 text-sm">
                  {((item.count / stats.totalDevelopers) * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-8">No data available</p>
        )}
      </div>
    </div>
  );
}
