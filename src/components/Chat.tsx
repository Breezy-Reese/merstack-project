import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Send, MessageSquare } from 'lucide-react';
import io from 'socket.io-client';

interface Message {
  _id: string;
  sender_id: string;
  receiver_id?: string;
  project_id?: string;
  content: string;
  message_type: 'direct' | 'project_group' | 'general';
  created_at: string;
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

interface MessageWithSender extends Message {
  sender?: Profile;
}

interface Project {
  _id: string;
  title: string;
  description?: string;
}

export default function Chat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Profile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'direct' | 'project' | 'general'>('direct');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  useEffect(() => {
    loadConversations();
    loadProjects();
  }, [user]);

  useEffect(() => {
    if (viewMode === 'direct' && selectedUser) {
      loadDirectMessages();
    } else if (viewMode === 'project' && selectedProject) {
      loadProjectMessages();
    } else if (viewMode === 'general') {
      loadGeneralMessages();
    }
  }, [selectedUser, selectedProject, viewMode]);

  useEffect(() => {
    if (!socket) {
      const token = localStorage.getItem('token');
      const socketInstance = io(API_BASE, {
        auth: { token },
      });
      socketInstance.on('connect', () => {
        console.log('Socket connected:', socketInstance.id);
        socketInstance.emit('authenticate', token);
      });
      socketInstance.on('new_message', (message: MessageWithSender) => {
        if (viewMode === 'direct') {
          if (
            (message.sender_id === selectedUser?._id && message.receiver_id === user?.id) ||
            (message.sender_id === user?.id && message.receiver_id === selectedUser?._id)
          ) {
            setMessages((prevMessages) => [...prevMessages, message]);
          }
        } else if (viewMode === 'project') {
          if (message.project_id === selectedProject?._id) {
            setMessages((prevMessages) => [...prevMessages, message]);
          }
        } else if (viewMode === 'general') {
          if (message.message_type === 'general') {
            setMessages((prevMessages) => [...prevMessages, message]);
          }
        }
      });
      setSocket(socketInstance);
    }
  }, [socket, selectedUser, selectedProject, viewMode, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    if (!user) return;

    try {
      const res = await fetch(`${API_BASE}/api/messages/conversations`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to load conversations');
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadProjects = async () => {
    if (!user) return;

    try {
      const res = await fetch(`${API_BASE}/api/projects`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to load projects');
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadDirectMessages = async () => {
    if (!user || !selectedUser) return;

    try {
      const res = await fetch(`${API_BASE}/api/messages/direct/${selectedUser._id}`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to load messages');
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadProjectMessages = async () => {
    if (!user || !selectedProject) return;

    try {
      const res = await fetch(`${API_BASE}/api/messages/project/${selectedProject._id}`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to load project messages');
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading project messages:', error);
    }
  };

  const loadGeneralMessages = async () => {
    if (!user) return;

    try {
      const res = await fetch(`${API_BASE}/api/messages/general`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to load general messages');
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading general messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!user || (viewMode === 'direct' && !selectedUser) || (viewMode === 'project' && !selectedProject) || !newMessage.trim()) return;

    setLoading(true);

    try {
      const body: any = {
        content: newMessage,
        message_type: viewMode,
      };
      if (viewMode === 'direct' && selectedUser) {
        body.receiver_id = selectedUser._id;
      } else if (viewMode === 'project' && selectedProject) {
        body.project_id = selectedProject._id;
      }

      const res = await fetch(`${API_BASE}/api/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to send message');
      setNewMessage('');
      if (viewMode === 'direct') {
        loadDirectMessages();
      } else if (viewMode === 'project') {
        loadProjectMessages();
      } else if (viewMode === 'general') {
        loadGeneralMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }

    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 12rem)' }}>
      <div className="flex h-full">
        <div className="w-80 border-r border-slate-200 flex flex-col">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">Messages</h2>
            </div>
            <div className="mt-4 flex space-x-4">
              <button
                onClick={() => {
                  setViewMode('direct');
                  setSelectedProject(null);
                  setSelectedUser(null);
                }}
                className={`px-3 py-1 rounded ${
                  viewMode === 'direct' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Direct
              </button>
              <button
                onClick={() => {
                  setViewMode('project');
                  setSelectedUser(null);
                  setSelectedProject(null);
                }}
                className={`px-3 py-1 rounded ${
                  viewMode === 'project' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Projects
              </button>
              <button
                onClick={() => {
                  setViewMode('general');
                  setSelectedUser(null);
                  setSelectedProject(null);
                }}
                className={`px-3 py-1 rounded ${
                  viewMode === 'general' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                General
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {viewMode === 'direct' ? (
              conversations.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No conversations yet</p>
                  <p className="text-sm mt-2">Start chatting with developers from the search page</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv._id}
                    onClick={() => setSelectedUser(conv)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition ${
                      selectedUser?._id === conv._id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {conv.name.charAt(0)}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-slate-900">{conv.name}</p>
                      <p className="text-sm text-slate-500">@{conv.username}</p>
                    </div>
                  </button>
                ))
              )
            ) : viewMode === 'project' ? (
              projects.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No projects yet</p>
                  <p className="text-sm mt-2">Join or create projects to start group chats</p>
                </div>
              ) : (
                projects.map((project) => (
                  <button
                    key={project._id}
                    onClick={() => setSelectedProject(project)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition ${
                      selectedProject?._id === project._id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                      {project.title.charAt(0)}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-slate-900">{project.title}</p>
                      <p className="text-sm text-slate-500">{project.description || 'No description'}</p>
                    </div>
                  </button>
                ))
              )
            ) : viewMode === 'general' ? (
              messages.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No general messages yet</p>
                  <p className="text-sm mt-2">Ask general questions here</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md px-4 py-3 rounded-2xl ${
                        message.sender_id === user?.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 text-slate-900'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender_id === user?.id ? 'text-purple-100' : 'text-slate-500'
                        }`}
                      >
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )
            ) : null}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {(viewMode === 'direct' && selectedUser) || (viewMode === 'project' && selectedProject) || viewMode === 'general' ? (
            <>
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      viewMode === 'direct' ? 'bg-blue-500' : viewMode === 'project' ? 'bg-green-500' : 'bg-purple-500'
                    }`}
                    style={{
                      background:
                        viewMode === 'direct'
                          ? 'linear-gradient(to bottom right, #3b82f6, #2563eb)'
                          : viewMode === 'project'
                          ? 'linear-gradient(to bottom right, #22c55e, #16a34a)'
                          : 'linear-gradient(to bottom right, #7c3aed, #6d28d9)',
                    }}
                  >
                    {(viewMode === 'direct' ? selectedUser?.name : viewMode === 'project' ? selectedProject?.title : 'General')?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {viewMode === 'direct' ? selectedUser?.name : viewMode === 'project' ? selectedProject?.title : 'General'}
                    </p>
                    <p className="text-sm text-slate-500">
                      {viewMode === 'direct' ? `@${selectedUser?.username}` : viewMode === 'project' ? selectedProject?.description || '' : 'Ask general questions here'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md px-4 py-3 rounded-2xl ${
                        message.sender_id === user?.id
                          ? viewMode === 'direct'
                            ? 'bg-blue-600 text-white'
                            : viewMode === 'project'
                            ? 'bg-green-600 text-white'
                            : 'bg-purple-600 text-white'
                          : 'bg-slate-100 text-slate-900'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender_id === user?.id
                            ? viewMode === 'direct'
                              ? 'text-blue-100'
                              : viewMode === 'project'
                              ? 'text-green-100'
                              : 'text-purple-100'
                            : 'text-slate-500'
                        }`}
                      >
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-6 border-t border-slate-200">
                <div className="flex gap-3">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      (viewMode === 'direct' && selectedUser) ||
                      (viewMode === 'project' && selectedProject) ||
                      viewMode === 'general'
                        ? 'Type a message...'
                        : 'Select a conversation to start messaging'
                    }
                    disabled={
                      !(
                        (viewMode === 'direct' && selectedUser) ||
                        (viewMode === 'project' && selectedProject) ||
                        viewMode === 'general'
                      )
                    }
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                    rows={1}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={
                      !newMessage.trim() ||
                      loading ||
                      !(
                        (viewMode === 'direct' && selectedUser) ||
                        (viewMode === 'project' && selectedProject) ||
                        viewMode === 'general'
                      )
                    }
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
