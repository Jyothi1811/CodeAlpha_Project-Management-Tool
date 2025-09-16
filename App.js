import React, { useEffect, useState } from 'react';
import axios from 'axios';
const API = process.env.REACT_APP_API || 'http://localhost:5000';

function Auth({ onAuth }){
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const handle = async ()=>{
    try{
      const url = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await axios.post(API + url, form);
      localStorage.setItem('token', res.data.token);
      onAuth(res.data.user);
    }catch(e){ alert(e.response?.data?.message || e.message); }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-indigo-600 mb-6">
          {isLogin ? 'Login' : 'Register'}
        </h2>
        <form onSubmit={(e)=>{ e.preventDefault(); handle(); }} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm text-gray-700 mb-1">Name</label>
              <input className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500" placeholder="Your name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Password</label>
            <input type="password" className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500" placeholder="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
          </div>
          <button className="w-full bg-indigo-600 text-white py-2 rounded-md" type="submit">{isLogin? 'Login':'Register'}</button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          {isLogin? "Don't have an account?" : "Already have an account?"}
          <button className="text-indigo-600 ml-2" onClick={()=>setIsLogin(!isLogin)}>{isLogin? 'Register':'Login'}</button>
        </p>
      </div>
    </div>
  );
}

export default function App(){
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(()=>{ fetchProjects(); },[]);

  const fetchProjects = async ()=>{
    try{
      const res = await axios.get(API + '/api/projects');
      setProjects(res.data);
      if(res.data[0]) setSelectedProject(res.data[0]);
    }catch(e){ console.error(e); }
  };

  const fetchTasks = async (projectId)=>{
    if(!projectId) return;
    const res = await axios.get(API + '/api/tasks/project/' + projectId);
    setTasks(res.data);
  };

  useEffect(()=>{ if(selectedProject) fetchTasks(selectedProject._id); },[selectedProject]);

  const addTask = async (title)=>{
    if(!selectedProject) return alert('select project');
    const res = await axios.post(API + '/api/tasks', { title, project: selectedProject._id });
    setTasks(prev=>[res.data, ...prev]);
  };

  const updateStatus = async (taskId, status)=>{
    const res = await axios.put(API + '/api/tasks/' + taskId, { status });
    setTasks(prev=> prev.map(t=> t._id===res.data._id? res.data : t));
  };

  if(!user) return <Auth onAuth={setUser} />;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-indigo-600 text-white p-4 font-bold">TaskFlow</div>
      <div className="flex">
        <div className="w-64 p-4 bg-white border-r">
          <div className="mb-4">Hello, {user.name || user.email || 'User'}</div>
          <button className="w-full bg-indigo-600 text-white py-2 rounded mb-4" onClick={async ()=>{ const name = prompt('Project name'); if(name){ await axios.post(API + '/api/projects', { name }); fetchProjects(); } }}>+ New Project</button>
          <div>
            {projects.map(p=> <div key={p._id} className={'p-2 cursor-pointer ' + (selectedProject && selectedProject._id===p._id? 'bg-indigo-100 font-semibold':'hover:bg-gray-50')} onClick={()=>setSelectedProject(p)}>{p.name}</div>)}
          </div>
        </div>
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{selectedProject? selectedProject.name : 'Select a project'}</h2>
            <div className="flex space-x-2">
              <input id="newtask" className="border px-2 py-1 rounded" placeholder="New task title" />
              <button className="bg-indigo-600 text-white px-3 py-1 rounded" onClick={()=>{ const t = document.getElementById('newtask').value; if(t) addTask(t); }}>Add</button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {['todo','in-progress','done'].map(col=> (
              <div key={col} className="bg-white p-4 rounded shadow">
                <h3 className="font-semibold mb-3 capitalize">{col.replace('-',' ')}</h3>
                <div className="space-y-2">
                  {tasks.filter(t=>t.status===col).map(task=> (
                    <div key={task._id} className="p-3 border rounded">
                      <div className="flex justify-between items-center">
                        <div>{task.title}</div>
                        <div className="flex gap-1">
                          {col!=='todo' && <button className="text-xs bg-gray-200 px-2 py-1 rounded" onClick={()=>updateStatus(task._id,'todo')}>To Do</button>}
                          {col!=='in-progress' && <button className="text-xs bg-yellow-200 px-2 py-1 rounded" onClick={()=>updateStatus(task._id,'in-progress')}>Start</button>}
                          {col!=='done' && <button className="text-xs bg-green-200 px-2 py-1 rounded" onClick={()=>updateStatus(task._id,'done')}>Done</button>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
