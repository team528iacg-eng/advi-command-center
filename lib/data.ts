export type User = {
  id: string; name: string; role: string; email: string; password: string;
  initials: string; color: string; bg: string; isAdmin: boolean;
};
export type Space = { id: string; name: string; color: string; emoji: string };
export type TaskList = { id: string; space: string; name: string; color: string };
export type Status = { id: string; label: string; color: string; bg: string };
export type Priority = { id: string; label: string; color: string };
export type Tag = { id: string; label: string; color: string; bg: string };

export type Task = {
  id: string; title: string; list: string; status: string; priority: string;
  assignees: string[]; due: string; est: number; logged: number;
  description: string; subtasks: { id: string; title: string; done: boolean }[];
  comments: { id: string; user: string; text: string; at: string }[];
  tags: string[]; createdAt: string;
};

export type Message = {
  id: string; from: string; to: string; text: string; at: string;
};

export const USERS: User[] = [
  { id:'hk', name:'Hemanth Kumar', role:'Admin',         email:'hemanth@advi.studio',  password:'hk123', initials:'HK', color:'#7C3AED', bg:'#EDE9FE', isAdmin:true },
  { id:'vm', name:'Vivek M',       role:'Director',       email:'vivek@advi.studio',    password:'vm123', initials:'VM', color:'#059669', bg:'#D1FAE5', isAdmin:false },
  { id:'ds', name:'Deeptham S',    role:'Sound Designer', email:'deeptham@advi.studio', password:'ds123', initials:'DS', color:'#D97706', bg:'#FEF3C7', isAdmin:false },
  { id:'pr', name:'Priya R',       role:'Producer',       email:'priya@advi.studio',    password:'pr123', initials:'PR', color:'#2563EB', bg:'#DBEAFE', isAdmin:false },
];

export const SPACES: Space[] = [
  { id:'528', name:'528 Film',          color:'#7C3AED', emoji:'🎬' },
  { id:'rz',  name:'RenderZero',        color:'#0EA5E9', emoji:'⚡' },
  { id:'lab', name:'AI Experience Lab', color:'#10B981', emoji:'🧪' },
];

export const LISTS: TaskList[] = [
  { id:'l1', space:'528', name:'Prologue Production', color:'#7C3AED' },
  { id:'l2', space:'528', name:'Post Production',     color:'#9333EA' },
  { id:'l3', space:'rz',  name:'Infrastructure',      color:'#0EA5E9' },
  { id:'l4', space:'rz',  name:'API Layer',           color:'#38BDF8' },
  { id:'l5', space:'lab', name:'Concept & Design',    color:'#10B981' },
];

export const STATUSES: Status[] = [
  { id:'todo',             label:'To Do',            color:'#6B7280', bg:'#F3F4F6' },
  { id:'in_progress',      label:'In Progress',      color:'#7C3AED', bg:'#EDE9FE' },
  { id:'review',           label:'In Review',        color:'#D97706', bg:'#FEF3C7' },
  { id:'pending_approval', label:'Pending Approval', color:'#F97316', bg:'#FFF7ED' },
  { id:'done',             label:'Done',             color:'#059669', bg:'#D1FAE5' },
];

export const PRIORITIES: Priority[] = [
  { id:'urgent', label:'Urgent', color:'#EF4444' },
  { id:'high',   label:'High',   color:'#F97316' },
  { id:'normal', label:'Normal', color:'#3B82F6' },
  { id:'low',    label:'Low',    color:'#9CA3AF' },
];

export const INITIAL_TASKS: Task[] = [
  { id:'t1', title:'Colour grade — scene 1-4',    list:'l1', status:'in_progress',      priority:'urgent', assignees:['vm'],         due:'2026-03-20', est:180, logged:120, description:'Grade scenes 1-4 using the approved LUT. Reference: /assets/lut/advi_main.cube', subtasks:[{id:'s1',title:'Apply LUT to timeline',done:true},{id:'s2',title:'Match skin tones',done:false},{id:'s3',title:'Export ProRes 4K',done:false}], comments:[{id:'c1',user:'hk',text:'Priority — client review is Thursday.',at:'2026-03-16T09:00'}], tags:['film','review'], createdAt:'2026-03-10T08:00' },
  { id:'t2', title:'Spatial audio mix — prologue', list:'l1', status:'review',           priority:'high',   assignees:['ds'],         due:'2026-03-20', est:240, logged:180, description:'Full Dolby Atmos mix for the 8-minute prologue.', subtasks:[{id:'s4',title:'Dialogue stem',done:true},{id:'s5',title:'Music stem',done:true},{id:'s6',title:'Atmos render',done:false}], comments:[], tags:['film'], createdAt:'2026-03-11T09:00' },
  { id:'t3', title:'Narration VO record',          list:'l1', status:'pending_approval', priority:'urgent', assignees:['hk','vm'],    due:'2026-03-18', est:120, logged:60,  description:'Record and edit final narration VO for prologue.', subtasks:[], comments:[{id:'c2',user:'pr',text:'Studio booked for 2pm tomorrow.',at:'2026-03-16T10:30'}], tags:['urgent'], createdAt:'2026-03-12T09:00' },
  { id:'t4', title:'Storyboard review',            list:'l1', status:'done',             priority:'normal', assignees:['vm','pr'],    due:'2026-03-15', est:90,  logged:85,  description:'Review and approve storyboard panels 1-40.', subtasks:[{id:'s7',title:'Panels 1-20',done:true},{id:'s8',title:'Panels 21-40',done:true}], comments:[], tags:[], createdAt:'2026-03-08T09:00' },
  { id:'t5', title:'GPU cluster setup',            list:'l3', status:'in_progress',      priority:'high',   assignees:['hk'],         due:'2026-03-22', est:300, logged:90,  description:'Configure 8x A100 GPU cluster for RenderZero.', subtasks:[{id:'s9',title:'Driver install',done:true},{id:'s10',title:'CUDA config',done:false},{id:'s11',title:'Benchmark',done:false}], comments:[], tags:['infra'], createdAt:'2026-03-13T09:00' },
  { id:'t6', title:'REST API — render endpoints',  list:'l4', status:'todo',             priority:'normal', assignees:['hk'],         due:'2026-03-25', est:240, logged:0,   description:'Build /render, /status, /cancel endpoints.', subtasks:[], comments:[], tags:[], createdAt:'2026-03-14T09:00' },
  { id:'t7', title:'AI concept wireframes',        list:'l5', status:'in_progress',      priority:'normal', assignees:['pr'],         due:'2026-03-21', est:120, logged:60,  description:'Wireframe the AI chat interface for the Experience Lab.', subtasks:[], comments:[], tags:['ai'], createdAt:'2026-03-14T10:00' },
  { id:'t8', title:'Post credits sequence edit',   list:'l2', status:'todo',             priority:'low',    assignees:['vm'],         due:'2026-03-28', est:60,  logged:0,   description:'Edit the post-credits sequence from raw footage.', subtasks:[], comments:[], tags:['film'], createdAt:'2026-03-15T09:00' },
];

export const INITIAL_MESSAGES: Message[] = [
  { id:'m1', from:'vm', to:'hk', text:'Hey, colour grade is looking great. Just a small note on the highlights in scene 3.', at:'2026-03-16T08:30' },
  { id:'m2', from:'hk', to:'vm', text:'Thanks! I'll pull those down. Should be ready for review by 3pm.', at:'2026-03-16T08:45' },
  { id:'m3', from:'ds', to:'hk', text:'Spatial mix is done. Rendering the Atmos file now — about 40 mins.', at:'2026-03-16T09:15' },
  { id:'m4', from:'pr', to:'hk', text:'Studio is confirmed for VO tomorrow at 2pm. Should we do 2 takes?', at:'2026-03-16T09:45' },
  { id:'m5', from:'vm', to:'hk', text:'Scene 4 lighting is off — need to revisit before client.', at:'2026-03-16T10:00' },
  { id:'m6', from:'hk', to:'ds', text:'Great! Send the wav when done.', at:'2026-03-16T09:20' },
  { id:'m7', from:'hk', to:'pr', text:'Yes, let's do 3 takes. Book an extra hour just in case.', at:'2026-03-16T10:05' },
];

export const DOCS = [
  { id:'d1', title:'Project Brief — 528 Film',        type:'Brief',        icon:'📋', size:'2.4 MB', updated:'Mar 14', tags:['film','urgent'] },
  { id:'d2', title:'Sprint 3 Planning Notes',          type:'Meeting Notes', icon:'📝', size:'840 KB', updated:'Mar 15', tags:['review'] },
  { id:'d3', title:'Sound Design Spec',                type:'Spec',          icon:'🎵', size:'1.1 MB', updated:'Mar 12', tags:['film'] },
  { id:'d4', title:'RenderZero Technical Architecture',type:'Architecture',  icon:'🏗',  size:'3.2 MB', updated:'Mar 10', tags:['infra'] },
  { id:'d5', title:'AI Assistant Prompt Library',      type:'Reference',     icon:'✦',  size:'560 KB', updated:'Mar 13', tags:['ai'] },
  { id:'d6', title:'Client Presentation Deck',         type:'Presentation',  icon:'📊', size:'18 MB', updated:'Mar 15', tags:['film','review'] },
];
