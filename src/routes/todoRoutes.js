import { Router } from "express";
import db from "../db.js";

const router = Router();

//get All todos
router.get('/', (req, res) => {
    const getTodos = db.prepare(`SELECT * FROM todos WHERE user_id = ?`);
    const todos = getTodos.all(req.userId);
    res.json(todos);
});

//create a new todo
router.post('/', (req, res) => {
    const newTodo = req.body.task;
    const insertTodo = db.prepare(`INSERT INTO todos (user_id, task) VALUES (?, ?)`);
    const result = insertTodo.run(req.userId, newTodo);

    res.json({ id: result.lastInsertRowid, newTodo, completed: 0 });
});

//update existing todo
router.put('/:id', (req, res) => {
    const { completed } = req.body;

    const { id } = req.params;

    const updatedTodo = db.prepare(`UPDATE todos SET completed = ? WHERE id = ?`);
    updatedTodo.run(completed, id);

    res.json({ message: "todo completed" });
});

//delete a todo
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const deleteTodo = db.prepare(`DELETE FROM todos WHERE id = ? AND user_id = ?`);
    deleteTodo.run(id, req.userId);

    res.json({ message: "todo item succesfully deleted" });
});


export default router;