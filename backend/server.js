const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Blog API Server is running"
    });
});

app.get("/api/test", (req, res) => {
    res.json({
        message: "API is working successfully"
    });
});

app.post("/api/register", (req, res) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    const users = JSON.parse(
        fs.readFileSync("users.json", "utf8")
    );

    const existingUser = users.find(
        user => user.email === email
    );

    if (existingUser) {
        return res.status(400).json({
            message: "User already exists"
        });
    }

    const newUser = {
        id: Date.now(),
        name,
        email,
        password
    };

    users.push(newUser);

    fs.writeFileSync(
        "users.json",
        JSON.stringify(users, null, 2)
    );

    res.status(201).json({
        message: "Registration successful",
        user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        }
    });
});

// Login API
app.post("/api/login", (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    const users = JSON.parse(
        fs.readFileSync("users.json", "utf8")
    );

    const user = users.find(
        user =>
            user.email === email &&
            user.password === password
    );

    if (!user) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    res.json({
        message: "Login successful",
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    });
});


// Create Blog API
app.post("/api/blogs", (req, res) => {

    const { title, author, content } = req.body;

    if (!title || !author || !content) {
        return res.status(400).json({
            message: "All blog fields are required"
        });
    }

    const blogs = JSON.parse(
        fs.readFileSync("blogs.json", "utf8")
    );

    const newBlog = {
        id: Date.now(),
        title: title,
        author: author,
        content: content
    };

    blogs.push(newBlog);

    fs.writeFileSync(
        "blogs.json",
        JSON.stringify(blogs, null, 2)
    );

    res.status(201).json({
        message: "Blog published successfully",
        blog: newBlog
    });
});


// Get All Blogs API
app.get("/api/blogs", (req, res) => {

    const blogs = JSON.parse(
        fs.readFileSync("blogs.json", "utf8")
    );

    res.json(blogs);
});


// Delete Blog API
app.delete("/api/blogs/:id", (req, res) => {

    const id = Number(req.params.id);

    let blogs = JSON.parse(
        fs.readFileSync("blogs.json", "utf8")
    );

    const blogExists = blogs.some(
        blog => blog.id === id
    );

    if (!blogExists) {
        return res.status(404).json({
            message: "Blog not found"
        });
    }

    blogs = blogs.filter(
        blog => blog.id !== id
    );

    fs.writeFileSync(
        "blogs.json",
        JSON.stringify(blogs, null, 2)
    );

    res.json({
        message: "Blog deleted successfully"
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});