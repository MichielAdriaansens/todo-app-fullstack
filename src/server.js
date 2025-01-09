//to use import <script type="module">. or set in packagege.json
import express from 'express'; //const ... = require(..)
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import authRoutes from './routes/authRoutes.js';
import todoRoutes from './routes/todoRoutes.js';
import authMiddleware from './middleware/authMiddleware.js';

const app = express();
const PORT = process.env.PORT || 5000;

//Get current File's path
const __filename = fileURLToPath(import.meta.url);

//Get the directory path this file is stored at.
const __dirname = dirname(__filename);

//middleware
app.use(express.json());
//middleware function that is serving static files (files that should run client-side and not on server)
//from the public folder.. It's like setting the root folder from where front end stuff gets accessed
app.use(express.static(path.join(__dirname, "../public")));

//serves html from public folder
app.get('/', (req, res) => {

    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use('/auth', authRoutes);

app.use('/todos', authMiddleware, todoRoutes);

app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
});