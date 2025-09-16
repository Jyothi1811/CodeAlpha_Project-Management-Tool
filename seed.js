const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/project_tool_light';

async function seed(){
  await mongoose.connect(MONGO);
  console.log('Connected to mongo for seeding');

  await User.deleteMany({});
  await Project.deleteMany({});
  await Task.deleteMany({});

  const hash = await bcrypt.hash('123456', 10);
  const demo = await User.create({ name: 'Demo User', email: 'demo@example.com', password: hash });

  const p = await Project.create({ name: 'Demo Project', members: [demo._id] });

  await Task.create({ title: 'Welcome: view this demo', project: p._id, status: 'todo' });
  await Task.create({ title: 'Start working on task', project: p._id, status: 'in-progress' });
  await Task.create({ title: 'Completed task example', project: p._id, status: 'done' });

  console.log('Seeding done. Demo user: demo@example.com / 123456');
  process.exit(0);
}

seed().catch(e=>{ console.error(e); process.exit(1); });
