import { Task, Farmer, User } from '../models/index.js';

// Get tasks for the authenticated farmer
export const getTasksForFarmer = async (req, res) => {
  try {
    // require authentication middleware to set req.user
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const farmer = await Farmer.findOne({ where: { user_id: userId } });
    if (!farmer) return res.status(404).json({ error: 'Farmer profile not found' });

    const tasks = await Task.findAll({ where: { farmer_id: farmer.id }, order: [['due_date','ASC']] });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const farmer = await Farmer.findOne({ where: { user_id: userId } });
    if (!farmer) return res.status(404).json({ error: 'Farmer profile not found' });

    const { title, description, due_date, priority } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const task = await Task.create({
      farmer_id: farmer.id,
      title,
      description,
      due_date: due_date || null,
      priority: priority || 'medium',
    });

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
    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const farmer = await Farmer.findOne({ where: { user_id: userId } });
    if (!farmer || farmer.id !== task.farmer_id) return res.status(403).json({ error: 'Forbidden' });

    await task.update(req.body);
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
    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const farmer = await Farmer.findOne({ where: { user_id: userId } });
    if (!farmer || farmer.id !== task.farmer_id) return res.status(403).json({ error: 'Forbidden' });

    await task.destroy();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
