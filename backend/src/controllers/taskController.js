import { Task, Farmer, User } from '../models/index.js';

export const getTasksForFarmer = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const farmer = await Farmer.findOne({ user_id: userId });
    if (!farmer) return res.status(404).json({ error: 'Farmer profile not found' });

    const tasks = await Task.find({ farmer_id: farmer._id }).sort({ due_date: 1 }).lean();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const farmer = await Farmer.findOne({ user_id: userId });
    if (!farmer) return res.status(404).json({ error: 'Farmer profile not found' });

    const { title, description, due_date, priority } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const task = await Task.create({ farmer_id: farmer._id, title, description, due_date: due_date || null, priority: priority || 'medium' });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const farmer = await Farmer.findOne({ user_id: userId });
    if (!farmer || String(farmer._id) !== String(task.farmer_id)) return res.status(403).json({ error: 'Forbidden' });

    Object.assign(task, req.body);
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const farmer = await Farmer.findOne({ user_id: userId });
    if (!farmer || String(farmer._id) !== String(task.farmer_id)) return res.status(403).json({ error: 'Forbidden' });

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
