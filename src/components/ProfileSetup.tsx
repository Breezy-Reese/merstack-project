import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Globe, MapPin, Code, Briefcase, Github, Link as LinkIcon, Save } from 'lucide-react';

const COUNTRIES = ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'India', 'Australia', 'Japan', 'Brazil', 'Mexico', 'Nigeria','Kenya', 'South Africa', 'Other'];
const LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Dart'];
const SKILLS = ['Frontend', 'Backend', 'Full Stack', 'Mobile', 'DevOps', 'UI/UX Design', 'Data Science', 'Machine Learning', 'Blockchain', 'Game Development', 'Cloud Architecture'];

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export default function ProfileSetup() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState({
    name: '',
    username: '',
    country: '',
    province: '',
    languages: [] as string[],
    skills: [] as string[],
    experience: 'Beginner' as 'Beginner' | 'Intermediate' | 'Expert',
    bio: '',
    github: '',
    portfolio: '',
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/profiles/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const profileData = data.profile;

        setProfile({
          name: profileData.name,
          username: profileData.username,
          country: profileData.country,
          province: profileData.province || '',
          languages: profileData.languages,
          skills: profileData.skills,
          experience: profileData.experience,
          bio: profileData.bio || '',
          github: profileData.github || '',
          portfolio: profileData.portfolio || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/profiles/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        setMessage('Profile updated successfully!');
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Error updating profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error updating profile');
    }

    setLoading(false);
  };

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    }
    return [...array, item];
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Complete Your Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
              <input
                type="text"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Globe className="w-4 h-4" />
                Country
              </label>
              <select
                value={profile.country}
                onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              >
                <option value="">Select Country</option>
                {COUNTRIES.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <MapPin className="w-4 h-4" />
                Province/State
              </label>
              <input
                type="text"
                value={profile.province}
                onChange={(e) => setProfile({ ...profile, province: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Optional"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Code className="w-4 h-4" />
              Programming Languages
            </label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setProfile({ ...profile, languages: toggleArrayItem(profile.languages, lang) })}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    profile.languages.includes(lang)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Briefcase className="w-4 h-4" />
              Skills & Expertise
            </label>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => setProfile({ ...profile, skills: toggleArrayItem(profile.skills, skill) })}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    profile.skills.includes(skill)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Experience Level</label>
            <div className="grid grid-cols-3 gap-4">
              {['Beginner', 'Intermediate', 'Expert'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setProfile({ ...profile, experience: level as any })}
                  className={`py-3 rounded-lg font-medium transition ${
                    profile.experience === level
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              rows={4}
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Github className="w-4 h-4" />
                GitHub Username
              </label>
              <input
                type="text"
                value={profile.github}
                onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="username"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <LinkIcon className="w-4 h-4" />
                Portfolio URL
              </label>
              <input
                type="url"
                value={profile.portfolio}
                onChange={(e) => setProfile({ ...profile, portfolio: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>

          {message && (
            <div className={`px-4 py-3 rounded-lg ${
              message.includes('success')
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
