const express = require('express');
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get Tasks
router.get('/', authMiddleware, (req, res) => {
    db.all(`SELECT * FROM tasks WHERE user_id = ?`, [req.user.id], (err, tasks) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(tasks);
    });
});

// Create Task
router.post('/', authMiddleware, (req, res) => {
    const { title, description, due_date } = req.body;

    db.run(`INSERT INTO tasks (title, description, due_date, user_id) VALUES (?, ?, ?, ?)`, 
        [title, description, due_date, req.user.id], 
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID });
        });
});

// Update Task
router.put('/:id', authMiddleware, (req, res) => {
    const { title, description, status, due_date } = req.body;

    db.run(`UPDATE tasks SET title = ?, description = ?, status = ?, due_date = ? WHERE id = ? AND user_id = ?`, 
        [title, description, status, due_date, req.params.id, req.user.id], 
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Task updated successfully' });
        });
});

// Delete Task
router.delete('/:id', authMiddleware, (req, res) => {
    db.run(`DELETE FROM tasks WHERE id = ? AND user_id = ?`, [req.params.id, req.user.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Task deleted successfully' });
    });
});

module.exports = router;
