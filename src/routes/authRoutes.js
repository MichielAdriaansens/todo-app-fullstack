import express from 'express';
//for encrypting sensitive data
import bcrypt from 'bcryptjs';
//alfa numeric password generator
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { Router } from 'express';

const router = Router();

//regeister a new user '/auth/register'
router.post('/register', (req, res) => {
    const { username, password } = req.body;

    //password encryption
    const hashedPassword = bcrypt.hashSync(password, 8);

    //save new user and hashed password to db
    try {
        //check if user doesn't already exists in db
        const user = getUser(username);
        if (user) {
            return res.status(409).send({ message: `${user.user} allready registered` });
        }

        const insertUser = db.prepare(`INSERT INTO users(user, password)
            VALUES (?, ?)`);

        const result = insertUser.run(username, hashedPassword);

        //Create a Default Todo
        const defaultTodo = `Yoo! Add your first todo :)`;
        const insertTodo = db.prepare(`INSERT INTO todos(user_id, task)
            VALUES(?, ?)`);

        insertTodo.run(result.lastInsertRowid, defaultTodo);

        //create new token
        const token = jwt.sign({ id: result.lastInsertRowid }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.json({ token });
    } catch (err) {
        console.log(err.message);
        res.sendStatus(503);
    }

});
//Login as registered user
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    try {
        const user = getUser(username);

        if (!user) {
            return res.status(404).send({ message: "User not found!" });
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password);

        if (!passwordIsValid) {
            return res.status(401).send({ message: "invalid password :(" });
        }

        //succesful login
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "24h" });
        res.json({ token });

    } catch (err) {
        console.log(err.message);
        res.sendStatus(503);
    }
});

//Retrieve a user from db (SQL database)
function getUser(_username) {
    const getUser = db.prepare(`SELECT * FROM users WHERE user = ?`);
    const user = getUser.get(_username);

    return user;
}

export default router;