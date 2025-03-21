const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Todo } = require("./models");
const authMiddleware = require("./authMiddleware");

const router = express.Router();

// Register User
router.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "User registered!" });
    } catch (err) {
        res.status(400).json({ error: "Username already exists" });
    }
});

// Login User
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });
    res.json({ token });
});

// Get Todos (Public - for testing only)
router.get("/public/todos", async (req, res) => {
    const todos = await Todo.find();
    res.json(todos);
});

// Get Todos
router.get("/todos", authMiddleware, async (req, res) => {
    const todos = await Todo.find({ userId: req.user.id });
    res.json(todos);
});

// Add Todo
router.post("/todos", authMiddleware, async (req, res) => {
    const newTodo = new Todo({ userId: req.user.id, task: req.body.task });
    await newTodo.save();
    res.json(newTodo);
});

// Update Todo
router.put("/todos/:id", authMiddleware, async (req, res) => {
    const updatedTodo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });
    res.json(updatedTodo);
});

// Delete Todo
router.delete("/todos/:id", authMiddleware, async (req, res) => {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
});

module.exports = router;
