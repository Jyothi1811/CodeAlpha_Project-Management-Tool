const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

router.post('/', async (req,res)=>{
  const task = await Task.create(req.body);
  res.json(task);
});

router.get('/project/:projectId', async (req,res)=>{
  const tasks = await Task.find({ project: req.params.projectId }).sort({ createdAt: -1 });
  res.json(tasks);
});

router.put('/:id', async (req,res)=>{
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(task);
});

module.exports = router;
