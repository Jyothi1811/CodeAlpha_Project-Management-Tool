const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

router.get('/', async (req,res)=>{
  const projects = await Project.find().populate('members','name email');
  res.json(projects);
});

router.post('/', async (req,res)=>{
  const { name } = req.body;
  const p = await Project.create({ name });
  res.json(p);
});

module.exports = router;
