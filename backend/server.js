// ========================================================
// FULL-STACK BLOG APPLICATION - BACKEND (POSTGRESQL)
// ========================================================

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const { Pool } = require("pg");

require("dotenv").config();

// =========================
// EXPRESS CONFIGURATION
// =========================

const app = express();
const PORT = process.env.PORT || 3000;

// =========================
// POSTGRESQL POOL
// =========================

const pool = new Pool({
    host: process.env.PG_HOST || "127.0.0.1",
    port: parseInt(process.env.PG_PORT, 10) || 5432,
    database: process.env.PG_DATABASE || "blog_db",
    user: process.env.PG_USER || "postgres",
    password: process.env.PG_PASSWORD || "Bhoomika@2006",
});

let isDatabaseConnected = false;

async function checkDatabaseConnection() {
    try {
        const client = await pool.connect();
        const res = await client.query("SELECT NOW()");
        client.release();
        isDatabaseConnected = true;
        console.log("PostgreSQL connected successfully at:", res.rows[0].now);
    } catch (error) {
        isDatabaseConnected = false;
        console.error("PostgreSQL connection error:", error.message);
        console.warn("Server will continue running. Check your database credentials in .env");
    }
}

// =========================
// MIDDLEWARE
// =========================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express Session for Login State
app.use(
    session({
        secret: process.env.SESSION_SECRET || "myblog_secret_key_2026",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            httpOnly: true,
        },
    })
);

// Serve static assets from frontend
app.use(
    express.static(path.join(__dirname, "../frontend"), {
        index: false,
    })
);

// =========================
// HELPER FUNCTIONS
// =========================

function escapeHTML(value) {
    if (value === null || value === undefined) return "";
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function truncateText(text, maxLength = 140) {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
}

function renderNavbar(user) {
    if (user) {
        return `
            <a href="/">Home</a>
            <a href="/dashboard">Dashboard</a>
            <a href="/create-blog">Create Blog</a>
            <span class="user-badge" style="margin-left: 10px;">Hi, ${escapeHTML(user.name)}</span>
            <a href="/logout" style="color: #ff6b6b; margin-left: 10px;">Logout</a>
        `;
    }
    return `
        <a href="/">Home</a>
        <a href="/dashboard">Dashboard</a>
        <a href="/create-blog">Create Blog</a>
        <a href="/login">Login</a>
        <a href="/register">Register</a>
    `;
}

function renderMessagePage({ title, heading, message, isSuccess = true, actionUrl = "/", actionText = "Back to Home", user = null }) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>My Blog - ${escapeHTML(title)}</title>
        <link rel="stylesheet" href="/css/style.css">
    </head>
    <body>
        <header>
            <div class="navbar">
                <h1>My Blog</h1>
                <nav>
                    ${renderNavbar(user)}
                </nav>
            </div>
        </header>

        <main class="container">
            <section class="message-section ${isSuccess ? "success" : "error"}">
                <h2>${escapeHTML(heading)}</h2>
                <p>${escapeHTML(message)}</p>
                <a href="${actionUrl}" class="btn">${escapeHTML(actionText)}</a>
            </section>
        </main>

        <footer>
            <p>&copy; 2026 My Blog. All Rights Reserved.</p>
        </footer>
        <script src="/js/structure.js"></script>
    </body>
    </html>
    `;
}

// =========================
// ROUTE: HOME PAGE
// =========================

app.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM blogs ORDER BY created_at DESC LIMIT 3");
        const blogs = result.rows;

        const filePath = path.join(__dirname, "../frontend/index.html");
        let html = fs.readFileSync(filePath, "utf8");

        // Dynamic Navbar
        html = html.replace(/<nav>[\s\S]*?<\/nav>/, `<nav>${renderNavbar(req.session.user)}</nav>`);

        let blogsHTML = "";
        if (blogs.length === 0) {
            blogsHTML = `
                <div class="no-blogs">
                    <h3>No Blogs Available</h3>
                    <p>Be the first person to publish a blog post!</p>
                    <br>
                    <a href="/create-blog" class="btn">Create First Blog</a>
                </div>
            `;
        } else {
            blogs.forEach((blog) => {
                const dateStr = blog.created_at ? new Date(blog.created_at).toLocaleDateString() : "";
                blogsHTML += `
                    <article class="blog-card">
                        <h3>${escapeHTML(blog.title)}</h3>
                        <p class="author">
                            <strong>Author:</strong> ${escapeHTML(blog.author)} ${dateStr ? `&bull; ${dateStr}` : ""}
                        </p>
                        <p>${escapeHTML(truncateText(blog.content, 140))}</p>
                        <a href="/blog/${blog.id}" class="btn">Read More</a>
                    </article>
                `;
            });
        }

        html = html.replace("<!-- BLOGS WILL BE INSERTED BY NODE.JS -->", blogsHTML);
        res.send(html);
    } catch (error) {
        console.error("Home Page Error:", error.message);
        res.status(500).send(
            renderMessagePage({
                title: "Error",
                heading: "Unable to Load Home Page",
                message: "A database error occurred while fetching blogs. Please verify your PostgreSQL connection.",
                isSuccess: false,
                user: req.session.user,
            })
        );
    }
});

// =========================
// ROUTE: REGISTER
// =========================

app.get("/register", (req, res) => {
    if (req.session.user) {
        return res.redirect("/dashboard");
    }
    const filePath = path.join(__dirname, "../frontend/register.html");
    let html = fs.readFileSync(filePath, "utf8");
    html = html.replace(/<nav>[\s\S]*?<\/nav>/, `<nav>${renderNavbar(req.session.user)}</nav>`);
    res.send(html);
});

app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password || !name.trim() || !email.trim() || !password.trim()) {
        return res.status(400).send(
            renderMessagePage({
                title: "Registration Failed",
                heading: "All Fields Required",
                message: "Please fill in all the required fields to register.",
                isSuccess: false,
                actionUrl: "/register",
                actionText: "Go Back",
                user: null,
            })
        );
    }

    try {
        const existing = await pool.query("SELECT id FROM users WHERE LOWER(email) = LOWER($1)", [email.trim()]);
        if (existing.rows.length > 0) {
            return res.status(409).send(
                renderMessagePage({
                    title: "Account Exists",
                    heading: "Email Already Registered",
                    message: "An account with this email address already exists. Please log in instead.",
                    isSuccess: false,
                    actionUrl: "/login",
                    actionText: "Go to Login",
                    user: null,
                })
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
            [name.trim(), email.trim(), hashedPassword]
        );

        console.log("New user registered successfully:", email.trim());
        res.send(
            renderMessagePage({
                title: "Registration Successful",
                heading: "Welcome Aboard!",
                message: "Your account has been created successfully. You can now log in.",
                isSuccess: true,
                actionUrl: "/login",
                actionText: "Go to Login",
                user: null,
            })
        );
    } catch (error) {
        console.error("Registration Error:", error.message);
        res.status(500).send(
            renderMessagePage({
                title: "Error",
                heading: "Registration Failed",
                message: "A database error occurred during registration. Please try again later.",
                isSuccess: false,
                actionUrl: "/register",
                actionText: "Try Again",
                user: null,
            })
        );
    }
});

// =========================
// ROUTE: LOGIN
// =========================

app.get("/login", (req, res) => {
    if (req.session.user) {
        return res.redirect("/dashboard");
    }
    const filePath = path.join(__dirname, "../frontend/login.html");
    let html = fs.readFileSync(filePath, "utf8");
    html = html.replace(/<nav>[\s\S]*?<\/nav>/, `<nav>${renderNavbar(req.session.user)}</nav>`);
    res.send(html);
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password || !email.trim() || !password.trim()) {
        return res.status(400).send(
            renderMessagePage({
                title: "Login Failed",
                heading: "Credentials Required",
                message: "Both email and password are required to log in.",
                isSuccess: false,
                actionUrl: "/login",
                actionText: "Try Again",
                user: null,
            })
        );
    }

    try {
        const result = await pool.query("SELECT * FROM users WHERE LOWER(email) = LOWER($1)", [email.trim()]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).send(
                renderMessagePage({
                    title: "Login Failed",
                    heading: "Invalid Credentials",
                    message: "No user found with the provided email address.",
                    isSuccess: false,
                    actionUrl: "/login",
                    actionText: "Try Again",
                    user: null,
                })
            );
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).send(
                renderMessagePage({
                    title: "Login Failed",
                    heading: "Invalid Password",
                    message: "The password entered is incorrect. Please try again.",
                    isSuccess: false,
                    actionUrl: "/login",
                    actionText: "Try Again",
                    user: null,
                })
            );
        }

        // Set session
        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
        };

        console.log("User logged in:", user.email);
        res.redirect("/dashboard");
    } catch (error) {
        console.error("Login Error:", error.message);
        res.status(500).send(
            renderMessagePage({
                title: "Error",
                heading: "Login Error",
                message: "A database error occurred during login. Please try again later.",
                isSuccess: false,
                actionUrl: "/login",
                actionText: "Try Again",
                user: null,
            })
        );
    }
});

// =========================
// ROUTE: LOGOUT
// =========================

app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Logout Error:", err);
        }
        res.redirect("/");
    });
});

// =========================
// ROUTE: DASHBOARD
// =========================

app.get("/dashboard", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM blogs ORDER BY created_at DESC");
        const blogs = result.rows;

        const dashboardPath = path.join(__dirname, "../frontend/dashboard.html");
        let html = fs.readFileSync(dashboardPath, "utf8");

        // Dynamic Navbar
        html = html.replace(/<nav>[\s\S]*?<\/nav>/, `<nav>${renderNavbar(req.session.user)}</nav>`);

        // Personalized greeting
        if (req.session.user) {
            html = html.replace(
                '<p id="welcomeUser">Welcome to your blog dashboard!</p>',
                `<p id="welcomeUser">Welcome back, <strong class="user-badge">${escapeHTML(req.session.user.name)}</strong>!</p>`
            );
        }

        let blogsHTML = "";
        if (blogs.length === 0) {
            blogsHTML = `
                <div class="no-blogs">
                    <h3>No Blogs Available</h3>
                    <p>No blogs have been published yet. Be the first to publish one!</p>
                    <br>
                    <a href="/create-blog" class="btn">Create Blog</a>
                </div>
            `;
        } else {
            blogs.forEach((blog) => {
                const dateStr = blog.created_at ? new Date(blog.created_at).toLocaleDateString() : "";
                blogsHTML += `
                    <article class="blog-card">
                        <h3>${escapeHTML(blog.title)}</h3>
                        <p class="author">
                            <strong>Author:</strong> ${escapeHTML(blog.author)} ${dateStr ? `&bull; ${dateStr}` : ""}
                        </p>
                        <p>${escapeHTML(truncateText(blog.content, 140))}</p>
                        <div>
                            <a href="/blog/${blog.id}" class="btn">Read More</a>
                            <a href="/edit-blog/${blog.id}" class="btn" style="background-color: #28a745;">Edit</a>
                            <form action="/delete-blog/${blog.id}" method="POST" style="display:inline;">
                                <button type="submit" class="delete-btn">Delete</button>
                            </form>
                        </div>
                    </article>
                `;
            });
        }

        html = html.replace("<!-- BLOGS WILL BE INSERTED BY NODE.JS -->", blogsHTML);
        res.send(html);
    } catch (error) {
        console.error("Dashboard Error:", error.message);
        res.status(500).send(
            renderMessagePage({
                title: "Error",
                heading: "Unable to Load Dashboard",
                message: "Could not fetch blogs from the database. Please check PostgreSQL.",
                isSuccess: false,
                user: req.session.user,
            })
        );
    }
});

// =========================
// ROUTE: CREATE BLOG
// =========================

app.get("/create-blog", (req, res) => {
    const filePath = path.join(__dirname, "../frontend/create-blog.html");
    let html = fs.readFileSync(filePath, "utf8");

    // Dynamic Navbar
    html = html.replace(/<nav>[\s\S]*?<\/nav>/, `<nav>${renderNavbar(req.session.user)}</nav>`);

    // Auto-fill author name if user is logged in
    if (req.session.user) {
        html = html.replace(
            'placeholder="Enter author name"',
            `value="${escapeHTML(req.session.user.name)}" placeholder="Enter author name"`
        );
    }

    res.send(html);
});

app.post("/create-blog", async (req, res) => {
    const { title, author, content } = req.body;

    if (!title || !author || !content || !title.trim() || !author.trim() || !content.trim()) {
        return res.status(400).send(
            renderMessagePage({
                title: "Error",
                heading: "All Fields Required",
                message: "Title, author, and content are all required to publish a blog.",
                isSuccess: false,
                actionUrl: "/create-blog",
                actionText: "Back to Editor",
                user: req.session.user,
            })
        );
    }

    try {
        const result = await pool.query(
            "INSERT INTO blogs (title, author, content) VALUES ($1, $2, $3) RETURNING id",
            [title.trim(), author.trim(), content.trim()]
        );

        console.log("New blog created with ID:", result.rows[0].id);
        res.redirect("/dashboard");
    } catch (error) {
        console.error("Blog Creation Error:", error.message);
        res.status(500).send(
            renderMessagePage({
                title: "Error",
                heading: "Unable to Publish Blog",
                message: "A database error occurred while saving your blog post.",
                isSuccess: false,
                actionUrl: "/create-blog",
                actionText: "Try Again",
                user: req.session.user,
            })
        );
    }
});

// =========================
// ROUTE: INDIVIDUAL BLOG
// =========================

app.get("/blog/:id", async (req, res) => {
    const blogId = parseInt(req.params.id, 10);
    if (isNaN(blogId)) {
        return res.status(400).send(
            renderMessagePage({
                title: "Invalid ID",
                heading: "Invalid Blog ID",
                message: "The requested blog ID is not valid.",
                isSuccess: false,
                actionUrl: "/dashboard",
                actionText: "Back to Dashboard",
                user: req.session.user,
            })
        );
    }

    try {
        const result = await pool.query("SELECT * FROM blogs WHERE id = $1", [blogId]);
        const blog = result.rows[0];

        if (!blog) {
            return res.status(404).send(
                renderMessagePage({
                    title: "Not Found",
                    heading: "Blog Post Not Found",
                    message: "The blog post you requested does not exist or has been deleted.",
                    isSuccess: false,
                    actionUrl: "/dashboard",
                    actionText: "Back to Dashboard",
                    user: req.session.user,
                })
            );
        }

        const createdDate = blog.created_at ? new Date(blog.created_at).toLocaleString() : "";
        const updatedDate = blog.updated_at ? new Date(blog.updated_at).toLocaleString() : "";

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${escapeHTML(blog.title)} - My Blog</title>
                <link rel="stylesheet" href="/css/style.css">
            </head>
            <body>
                <header>
                    <div class="navbar">
                        <h1>My Blog</h1>
                        <nav>
                            ${renderNavbar(req.session.user)}
                        </nav>
                    </div>
                </header>

                <main class="container">
                    <article class="blog-details">
                        <h1>${escapeHTML(blog.title)}</h1>
                        <p class="author">
                            <strong>Author:</strong> ${escapeHTML(blog.author)}
                        </p>
                        <p>
                            <strong>Published:</strong> ${createdDate}
                        </p>
                        ${
                            updatedDate
                                ? `<p><strong>Updated:</strong> ${updatedDate}</p>`
                                : ""
                        }
                        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                        <div class="content">${escapeHTML(blog.content)}</div>
                        <br>
                        <div style="margin-top: 25px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                            <a href="/dashboard" class="btn">Back to Dashboard</a>
                            <a href="/edit-blog/${blog.id}" class="btn" style="background-color: #28a745;">Edit Blog</a>
                            <form action="/delete-blog/${blog.id}" method="POST" style="display: inline;">
                                <button type="submit" class="delete-btn">Delete Blog</button>
                            </form>
                        </div>
                    </article>
                </main>

                <footer>
                    <p>&copy; 2026 My Blog. All Rights Reserved.</p>
                </footer>
                <script src="/js/structure.js"></script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error("Blog View Error:", error.message);
        res.status(500).send(
            renderMessagePage({
                title: "Error",
                heading: "Unable to Load Blog",
                message: "Could not retrieve the blog post from the database.",
                isSuccess: false,
                actionUrl: "/dashboard",
                actionText: "Back to Dashboard",
                user: req.session.user,
            })
        );
    }
});

// =========================
// ROUTE: EDIT BLOG (GET)
// =========================

app.get("/edit-blog/:id", async (req, res) => {
    const blogId = parseInt(req.params.id, 10);
    if (isNaN(blogId)) {
        return res.status(400).send(
            renderMessagePage({
                title: "Invalid ID",
                heading: "Invalid Blog ID",
                message: "The requested blog ID is not valid.",
                isSuccess: false,
                actionUrl: "/dashboard",
                actionText: "Back to Dashboard",
                user: req.session.user,
            })
        );
    }

    try {
        const result = await pool.query("SELECT * FROM blogs WHERE id = $1", [blogId]);
        const blog = result.rows[0];

        if (!blog) {
            return res.status(404).send(
                renderMessagePage({
                    title: "Not Found",
                    heading: "Blog Not Found",
                    message: "The blog post you want to edit does not exist.",
                    isSuccess: false,
                    actionUrl: "/dashboard",
                    actionText: "Back to Dashboard",
                    user: req.session.user,
                })
            );
        }

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Edit Blog - ${escapeHTML(blog.title)}</title>
                <link rel="stylesheet" href="/css/style.css">
            </head>
            <body>
                <header>
                    <div class="navbar">
                        <h1>My Blog</h1>
                        <nav>
                            ${renderNavbar(req.session.user)}
                        </nav>
                    </div>
                </header>

                <main>
                    <section class="create-blog-section">
                        <h2>Edit Blog</h2>
                        <p>Update your blog post details below.</p>

                        <form action="/edit-blog/${blog.id}" method="POST">
                            <div>
                                <label for="blogTitle">Blog Title</label>
                                <input
                                    type="text"
                                    id="blogTitle"
                                    name="title"
                                    value="${escapeHTML(blog.title)}"
                                    required
                                >
                            </div>

                            <div>
                                <label for="blogAuthor">Author</label>
                                <input
                                    type="text"
                                    id="blogAuthor"
                                    name="author"
                                    value="${escapeHTML(blog.author)}"
                                    required
                                >
                            </div>

                            <div>
                                <label for="blogContent">Blog Content</label>
                                <textarea
                                    id="blogContent"
                                    name="content"
                                    rows="8"
                                    required
                                >${escapeHTML(blog.content)}</textarea>
                            </div>

                            <button type="submit">Update Blog</button>
                        </form>

                        <br>
                        <a href="/dashboard" class="btn" style="background-color: #6c757d; display: block; text-align: center;">Cancel and Return</a>
                    </section>
                </main>

                <footer>
                    <p>&copy; 2026 My Blog. All Rights Reserved.</p>
                </footer>
                <script src="/js/structure.js"></script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error("Edit Blog Error:", error.message);
        res.status(500).send(
            renderMessagePage({
                title: "Error",
                heading: "Unable to Open Editor",
                message: "Could not load the blog post for editing.",
                isSuccess: false,
                actionUrl: "/dashboard",
                actionText: "Back to Dashboard",
                user: req.session.user,
            })
        );
    }
});

// =========================
// ROUTE: EDIT BLOG (POST)
// =========================

app.post("/edit-blog/:id", async (req, res) => {
    const blogId = parseInt(req.params.id, 10);
    const { title, author, content } = req.body;

    if (isNaN(blogId) || !title || !author || !content || !title.trim() || !author.trim() || !content.trim()) {
        return res.status(400).send(
            renderMessagePage({
                title: "Update Failed",
                heading: "All Fields Required",
                message: "Please fill in all fields before updating the blog.",
                isSuccess: false,
                actionUrl: `/edit-blog/${req.params.id}`,
                actionText: "Back to Editor",
                user: req.session.user,
            })
        );
    }

    try {
        const result = await pool.query(
            "UPDATE blogs SET title = $1, author = $2, content = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id",
            [title.trim(), author.trim(), content.trim(), blogId]
        );

        if (result.rows.length === 0) {
            return res.status(404).send(
                renderMessagePage({
                    title: "Not Found",
                    heading: "Blog Not Found",
                    message: "The blog post you tried to update could not be found.",
                    isSuccess: false,
                    actionUrl: "/dashboard",
                    actionText: "Back to Dashboard",
                    user: req.session.user,
                })
            );
        }

        console.log("Blog updated successfully:", blogId);
        res.redirect(`/blog/${blogId}`);
    } catch (error) {
        console.error("Update Blog Error:", error.message);
        res.status(500).send(
            renderMessagePage({
                title: "Error",
                heading: "Update Failed",
                message: "A database error occurred while updating the blog.",
                isSuccess: false,
                actionUrl: `/edit-blog/${blogId}`,
                actionText: "Back to Editor",
                user: req.session.user,
            })
        );
    }
});

// =========================
// ROUTE: DELETE BLOG
// =========================

app.post("/delete-blog/:id", async (req, res) => {
    const blogId = parseInt(req.params.id, 10);
    if (isNaN(blogId)) {
        return res.status(400).send(
            renderMessagePage({
                title: "Invalid ID",
                heading: "Invalid Blog ID",
                message: "The requested blog ID is not valid for deletion.",
                isSuccess: false,
                actionUrl: "/dashboard",
                actionText: "Back to Dashboard",
                user: req.session.user,
            })
        );
    }

    try {
        const result = await pool.query("DELETE FROM blogs WHERE id = $1", [blogId]);

        if (result.rowCount === 0) {
            return res.status(404).send(
                renderMessagePage({
                    title: "Not Found",
                    heading: "Blog Not Found",
                    message: "The blog post you tried to delete was not found.",
                    isSuccess: false,
                    actionUrl: "/dashboard",
                    actionText: "Back to Dashboard",
                    user: req.session.user,
                })
            );
        }

        console.log("Blog deleted successfully:", blogId);
        res.redirect("/dashboard");
    } catch (error) {
        console.error("Delete Blog Error:", error.message);
        res.status(500).send(
            renderMessagePage({
                title: "Error",
                heading: "Unable to Delete",
                message: "A database error occurred while attempting to delete the blog.",
                isSuccess: false,
                actionUrl: "/dashboard",
                actionText: "Back to Dashboard",
                user: req.session.user,
            })
        );
    }
});

// =========================
// START SERVER
// =========================

async function startServer() {
    await checkDatabaseConnection();

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

startServer();
