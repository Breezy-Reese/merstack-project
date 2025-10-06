import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProfile extends Document {
  _id: string; // use string for UUID
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
  created_at: Date;
  updated_at: Date;
}

const ProfileSchema: Schema<IProfile> = new Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  country: { type: String, default: '' },
  province: { type: String },
  languages: { type: [String], default: [] },
  skills: { type: [String], default: [] },
  experience: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Expert'],
    default: 'Beginner'
  },
  bio: { type: String },
  github: { type: String },
  portfolio: { type: String },
  profile_image: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export interface IProject extends Document {
  _id: string;
  title: string;
  description?: string;
  tech_stack: string[];
  created_by: string; // reference to profile _id
  status: 'Planning' | 'Active' | 'Completed' | 'Archived';
  created_at: Date;
  updated_at: Date;
}

const ProjectSchema: Schema<IProject> = new Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  tech_stack: { type: [String], default: [] },
  created_by: { type: String, required: true, ref: 'Profile' },
  status: {
    type: String,
    enum: ['Planning', 'Active', 'Completed', 'Archived'],
    default: 'Planning'
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export interface IProjectMember extends Document {
  _id: string;
  project_id: string; // reference to project _id
  user_id: string; // reference to profile _id
  role: string;
  joined_at: Date;
}

const ProjectMemberSchema: Schema<IProjectMember> = new Schema({
  _id: { type: String, required: true },
  project_id: { type: String, required: true, ref: 'Project' },
  user_id: { type: String, required: true, ref: 'Profile' },
  role: { type: String, default: 'Member' },
  joined_at: { type: Date, default: Date.now }
}, {
  collection: 'project_members'
});

export interface IMessage extends Document {
  _id: string;
  sender_id: string; // reference to profile _id
  receiver_id?: string; // reference to profile _id, nullable for group messages
  project_id?: string; // reference to project _id, nullable for direct messages
  content: string;
  message_type: 'direct' | 'project_group';
  created_at: Date;
}

const MessageSchema: Schema<IMessage> = new Schema({
  _id: { type: String, required: true },
  sender_id: { type: String, required: true, ref: 'Profile' },
  receiver_id: { type: String, ref: 'Profile' },
  project_id: { type: String, ref: 'Project' },
  content: { type: String, required: true },
  message_type: {
    type: String,
    enum: ['direct', 'project_group'],
    default: 'direct'
  },
  created_at: { type: Date, default: Date.now }
});

// Add indexes for better query performance
ProfileSchema.index({ country: 1 });
ProfileSchema.index({ username: 1 });
ProjectSchema.index({ created_by: 1 });
ProjectMemberSchema.index({ project_id: 1 });
ProjectMemberSchema.index({ user_id: 1 });
MessageSchema.index({ sender_id: 1 });
MessageSchema.index({ receiver_id: 1 });
MessageSchema.index({ project_id: 1 });

// Update updated_at on save
ProfileSchema.pre<IProfile>('save', function(next) {
  this.updated_at = new Date();
  next();
});

ProjectSchema.pre<IProject>('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Export models
export const Profile: Model<IProfile> = mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);
export const Project: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
export const ProjectMember: Model<IProjectMember> = mongoose.models.ProjectMember || mongoose.model<IProjectMember>('ProjectMember', ProjectMemberSchema);
export const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
