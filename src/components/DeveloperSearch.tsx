import { useState, useEffect } from 'react';
import { Search, MapPin, Code, Briefcase, Github, Link as LinkIcon, Mail } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

interface Profile {
  _id: string;
  name: string;
  username: string;
  country: string;
  province: string;
  languages: string[];
  skills: string[];
  experience: 'Beginner' | 'Intermediate' | 'Expert';
  bio: string;
  github: string;
  portfolio: string;
  created_at: string;
  updated_at: string;
}

export default function DeveloperSearch() {
  const [developers, setDevelopers] = useState<Profile[]>([]);
  const [filteredDevelopers, setFilteredDevelopers] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDevelopers();
  }, []);

  useEffect(() => {
    filterDevelopers();
  }, [searchTerm, countryFilter, languageFilter, skillFilter, developers]);

  const loadDevelopers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/profiles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setDevelopers(data.profiles);
      }
    } catch (error) {
      console.error('Error loading developers:', error);
    }
    setLoading(false);
  };

  const filterDevelopers = () => {
    let filtered = developers;

    if (searchTerm) {
      filtered = filtered.filter(dev =>
        dev.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dev.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dev.bio && dev.bio.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (countryFilter) {
      filtered = filtered.filter(dev => dev.country === countryFilter);
    }

    if (languageFilter) {
      filtered = filtered.filter(dev => dev.languages.includes(languageFilter));
    }

    if (skillFilter) {
      filtered = filtered.filter(dev => dev.skills.includes(skillFilter));
    }

    setFilteredDevelopers(filtered);
  };

  const countries = [...new Set(developers.map(d => d.country).filter(Boolean))];
  const languages = [...new Set(developers.flatMap(d => d.languages))];
  const skills = [...new Set(developers.flatMap(d => d.skills))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading developers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Search className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-900">Find Developers</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or bio..."
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">All Countries</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>

          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">All Languages</option>
            {languages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>

          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">All Skills</option>
            {skills.map(skill => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 text-sm text-slate-600">
          Found {filteredDevelopers.length} developer{filteredDevelopers.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDevelopers.map(developer => (
          <div key={developer._id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {developer.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900">{developer.name}</h3>
                <p className="text-slate-600">@{developer.username}</p>
              </div>
            </div>

            {developer.bio && (
              <p className="text-slate-700 mb-4 line-clamp-3">{developer.bio}</p>
            )}

            <div className="space-y-2 mb-4">
              {developer.country && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4" />
                  <span>{developer.country}{developer.province ? `, ${developer.province}` : ''}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="w-4 h-4 text-slate-600" />
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  developer.experience === 'Expert' ? 'bg-green-100 text-green-700' :
                  developer.experience === 'Intermediate' ? 'bg-blue-100 text-blue-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {developer.experience}
                </span>
              </div>
            </div>

            {developer.languages.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                  <Code className="w-4 h-4" />
                  <span className="font-medium">Languages:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {developer.languages.slice(0, 3).map(lang => (
                    <span key={lang} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                      {lang}
                    </span>
                  ))}
                  {developer.languages.length > 3 && (
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                      +{developer.languages.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {developer.skills.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {developer.skills.slice(0, 2).map(skill => (
                    <span key={skill} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                  {developer.skills.length > 2 && (
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                      +{developer.skills.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t border-slate-200">
              {developer.github && (
                <a
                  href={`https://github.com/${developer.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {developer.portfolio && (
                <a
                  href={developer.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                >
                  <LinkIcon className="w-4 h-4" />
                </a>
              )}
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDevelopers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No developers found</h3>
          <p className="text-slate-600">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}
