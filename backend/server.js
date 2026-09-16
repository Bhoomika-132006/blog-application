// =========================
// IMPORT MODULES
// =========================

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const dns = require("dns");

require("dotenv").config();


// =========================
// DNS SETTINGS
// =========================

dns.setServers([
    "8.8.8.8",
    "1.1.1.1"
]);


// =========================
// MONGODB
// =========================

const {
    MongoClient,
    ObjectId
} = require("mongodb");

const bcrypt = require("bcrypt");


// =========================
// EXPRESS APP
// =========================

const app = express();

const PORT = 3000;


// =========================
// MONGODB CONNECTION
// =========================

const MONGODB_URI =
    process.env.MONGODB_URI;

const client =
    new MongoClient(MONGODB_URI);

let db;


// =========================
// CONNECT TO DATABASE
// =========================

async function connectDatabase() {

    try {

        await client.connect();

        db = client.db("blogDatabase");

        console.log(
            "MongoDB connected successfully"
        );

    } catch (error) {

        console.error(
            "MongoDB connection failed:",
            error
        );

        process.exit(1);
    }
}


// =========================
// MIDDLEWARE
// =========================

app.use(cors());

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


// =========================
// SERVE FRONTEND FILES
// =========================

app.use(
    express.static(
        path.join(
            __dirname,
            "../frontend"
        ),
        {
            index: false
        }
    )
);


// =========================
// HTML ESCAPE FUNCTION
// =========================

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// =========================
// HOME PAGE
// =========================

app.get("/", async (req, res) => {

    if (!db) {

        return res.status(500).send(`
            <h2>Database Error</h2>

            <p>
                Database is not connected.
            </p>
        `);

    }


    try {

        // Get latest 3 blogs
        const blogs =
            await db
                .collection("blogs")
                .find({})
                .sort({
                    createdAt: -1
                })
                .limit(3)
                .toArray();


        // Read index.html
        const filePath =
            path.join(
                __dirname,
                "../frontend/index.html"
            );


        let html =
            fs.readFileSync(
                filePath,
                "utf8"
            );


        // Blog HTML
        let blogsHTML = "";


        // No blogs
        if (blogs.length === 0) {

            blogsHTML = `
                <div class="no-blogs">

                    <h3>
                        No Blogs Available
                    </h3>

                    <p>
                        Be the first person
                        to publish a blog.
                    </p>

                    <br>

                    <a
                        href="/create-blog"
                        class="btn"
                    >
                        Create First Blog
                    </a>

                </div>
            `;

        }


        // Display latest blogs
        else {

            blogs.forEach(
                blog => {

                    blogsHTML += `

                        <article
                            class="blog-card"
                        >

                            <h3>
                                ${escapeHTML(
                                    blog.title
                                )}
                            </h3>


                            <p class="author">

                                <strong>
                                    Author:
                                </strong>

                                ${escapeHTML(
                                    blog.author
                                )}

                            </p>


                            <p>
                                ${escapeHTML(
                                    blog.content
                                )}
                            </p>


                            <a
                                href="/blog/${blog._id}"
                                class="btn"
                            >
                                Read More
                            </a>

                        </article>

                    `;

                }
            );

        }


        // Insert blogs into index.html
        html =
            html.replace(
                "<!-- BLOGS WILL BE INSERTED BY NODE.JS -->",
                blogsHTML
            );


        // Send Home page
        res.send(html);


    } catch (error) {

        console.error(
            "Home Page Error:",
            error
        );

        res.status(500).send(`
            <h2>
                Unable to load Home page.
            </h2>

            <p>
                Please try again later.
            </p>
        `);

    }

});


// =========================
// REGISTER PAGE
// =========================

app.get(
    "/register",
    (req, res) => {

        const filePath =
            path.join(
                __dirname,
                "../frontend/register.html"
            );

        res.sendFile(filePath);

    }
);


// =========================
// REGISTER USER
// =========================

app.post(
    "/register",
    async (req, res) => {

        const {
            name,
            email,
            password
        } = req.body;


        // Check fields
        if (
            !name ||
            !email ||
            !password
        ) {

            return res.send(`
                <h2>
                    Registration Failed
                </h2>

                <p>
                    All fields are required.
                </p>

                <a href="/register">
                    Go Back
                </a>
            `);

        }


        // Check database
        if (!db) {

            return res.send(`
                <h2>
                    Database Error
                </h2>

                <p>
                    Database is not connected.
                </p>
            `);

        }


        try {

            const usersCollection =
                db.collection("users");


            // Check existing user
            const existingUser =
                await usersCollection.findOne({
                    email: email
                });


            if (existingUser) {

                return res.send(`
                    <h2>
                        User Already Exists
                    </h2>

                    <p>
                        An account with this
                        email already exists.
                    </p>

                    <a href="/login">
                        Go to Login
                    </a>
                `);

            }


            // Hash password
            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );


            // Create user
            const newUser = {

                name: name,

                email: email,

                password: hashedPassword,

                createdAt: new Date()

            };


            // Insert into MongoDB
            await usersCollection.insertOne(
                newUser
            );


            console.log(
                "New user registered:",
                email
            );


            res.send(`
                <h2>
                    Registration Successful
                </h2>

                <p>
                    Your account has been created.
                </p>

                <a href="/login">
                    Go to Login
                </a>
            `);


        } catch (error) {

            console.error(
                "Registration Error:",
                error
            );


            res.status(500).send(`
                <h2>
                    Registration Error
                </h2>

                <p>
                    Unable to register user.
                </p>
            `);

        }

    }
);


// =========================
// LOGIN PAGE
// =========================

app.get(
    "/login",
    (req, res) => {

        const filePath =
            path.join(
                __dirname,
                "../frontend/login.html"
            );

        res.sendFile(filePath);

    }
);


// =========================
// LOGIN USER
// =========================

app.post(
    "/login",
    async (req, res) => {

        const {
            email,
            password
        } = req.body;


        // Check fields
        if (
            !email ||
            !password
        ) {

            return res.send(`
                <h2>
                    Login Failed
                </h2>

                <p>
                    Email and password
                    are required.
                </p>

                <a href="/login">
                    Try Again
                </a>
            `);

        }


        // Check database
        if (!db) {

            return res.send(`
                <h2>
                    Database Error
                </h2>

                <p>
                    Database is not connected.
                </p>
            `);

        }


        try {

            const usersCollection =
                db.collection("users");


            // Find user using email
            const user =
                await usersCollection.findOne({
                    email: email
                });


            // User not found
            if (!user) {

                return res.send(`
                    <h2>
                        Login Failed
                    </h2>

                    <p>
                        Invalid email or password.
                    </p>

                    <a href="/login">
                        Try Again
                    </a>
                `);

            }


            // Compare entered password
            // with hashed password
            const passwordMatch =
                await bcrypt.compare(
                    password,
                    user.password
                );


            // Password does not match
            if (!passwordMatch) {

                return res.send(`
                    <h2>
                        Login Failed
                    </h2>

                    <p>
                        Invalid email or password.
                    </p>

                    <a href="/login">
                        Try Again
                    </a>
                `);

            }


            console.log(
                "User logged in:",
                email
            );


            // Successful login
            res.send(`
                <h2>
                    Login Successful
                </h2>

                <p>
                    Welcome,
                    ${escapeHTML(user.name)}!
                </p>

                <a href="/dashboard">
                    Go to Dashboard
                </a>
            `);


        } catch (error) {

            console.error(
                "Login Error:",
                error
            );


            res.status(500).send(`
                <h2>
                    Login Error
                </h2>

                <p>
                    Unable to login.
                </p>
            `);

        }

    }
);


// =========================
// CREATE BLOG PAGE
// =========================

app.get(
    "/create-blog",
    (req, res) => {

        const filePath =
            path.join(
                __dirname,
                "../frontend/create-blog.html"
            );

        res.sendFile(filePath);

    }
);


// =========================
// CREATE BLOG
// =========================

app.post(
    "/create-blog",
    async (req, res) => {

        const {
            title,
            author,
            content
        } = req.body;


        // Check fields
        if (
            !title ||
            !author ||
            !content
        ) {

            return res.send(`
                <h2>
                    Blog Creation Failed
                </h2>

                <p>
                    All fields are required.
                </p>

                <a href="/create-blog">
                    Go Back
                </a>
            `);

        }


        // Check database
        if (!db) {

            return res.send(`
                <h2>
                    Database Error
                </h2>

                <p>
                    Database is not connected.
                </p>
            `);

        }


        try {

            const blogsCollection =
                db.collection("blogs");


            // Create blog
            const newBlog = {

                title: title,

                author: author,

                content: content,

                createdAt: new Date()

            };


            // Insert blog
            const result =
                await blogsCollection.insertOne(
                    newBlog
                );


            console.log(
                "New blog created:",
                result.insertedId
            );


            res.send(`
                <h2>
                    Blog Published Successfully
                </h2>

                <p>
                    Your blog has been saved
                    to MongoDB.
                </p>

                <p>
                    <strong>
                        Title:
                    </strong>

                    ${escapeHTML(title)}
                </p>

                <p>
                    <strong>
                        Author:
                    </strong>

                    ${escapeHTML(author)}
                </p>

                <br>

                <a href="/dashboard">
                    Go to Dashboard
                </a>

                <br><br>

                <a href="/create-blog">
                    Create Another Blog
                </a>
            `);


        } catch (error) {

            console.error(
                "Blog Creation Error:",
                error
            );


            res.status(500).send(`
                <h2>
                    Blog Creation Error
                </h2>

                <p>
                    Unable to create blog.
                </p>
            `);

        }

    }
);


// =========================
// DASHBOARD
// =========================

app.get(
    "/dashboard",
    async (req, res) => {

        // Check database
        if (!db) {

            return res.send(`
                <h2>
                    Database is not connected.
                </h2>
            `);

        }


        try {

            const blogsCollection =
                db.collection("blogs");


            // Get all blogs
            const blogs =
                await blogsCollection
                    .find({})
                    .sort({
                        createdAt: -1
                    })
                    .toArray();


            // Read dashboard HTML
            const dashboardPath =
                path.join(
                    __dirname,
                    "../frontend/dashboard.html"
                );


            let html =
                fs.readFileSync(
                    dashboardPath,
                    "utf8"
                );


            // Blog HTML
            let blogsHTML = "";


            // No blogs
            if (blogs.length === 0) {

                blogsHTML = `
                    <div class="no-blogs">

                        <h3>
                            No Blogs Available
                        </h3>

                        <p>
                            No blogs have been
                            published yet.
                        </p>

                        <br>

                        <a
                            href="/create-blog"
                            class="btn"
                        >
                            Create Blog
                        </a>

                    </div>
                `;

            }


            // Display blogs
            else {

                blogs.forEach(
                    blog => {

                        blogsHTML += `

                            <article
                                class="blog-card"
                            >

                                <h3>
                                    ${escapeHTML(
                                        blog.title
                                    )}
                                </h3>


                                <p class="author">

                                    <strong>
                                        Author:
                                    </strong>

                                    ${escapeHTML(
                                        blog.author
                                    )}

                                </p>


                                <p>
                                    ${escapeHTML(
                                        blog.content
                                    )}
                                </p>


                                <div>

                                    <a
                                        href="/blog/${blog._id}"
                                        class="btn"
                                    >
                                        Read More
                                    </a>


                                    <form
                                        action="/delete-blog/${blog._id}"
                                        method="POST"
                                        style="
                                            display:inline;
                                        "
                                    >

                                        <button
                                            type="submit"
                                            class="delete-btn"
                                        >
                                            Delete
                                        </button>

                                    </form>

                                </div>

                            </article>

                        `;

                    }
                );

            }


            // Insert blogs
            html =
                html.replace(
                    "<!-- BLOGS WILL BE INSERTED BY NODE.JS -->",
                    blogsHTML
                );


            // Send page
            res.send(html);


        } catch (error) {

            console.error(
                "Dashboard Error:",
                error
            );


            res.status(500).send(
                "Unable to load dashboard."
            );

        }

    }
);


// =========================
// INDIVIDUAL BLOG
// =========================

app.get(
    "/blog/:id",
    async (req, res) => {

        if (!db) {

            return res.send(
                "Database is not connected."
            );

        }


        try {

            const blogId =
                new ObjectId(
                    req.params.id
                );


            const blog =
                await db
                    .collection("blogs")
                    .findOne({
                        _id: blogId
                    });


            // Blog not found
            if (!blog) {

                return res.send(`
                    <h2>
                        Blog Not Found
                    </h2>

                    <a href="/dashboard">
                        Back to Dashboard
                    </a>
                `);

            }


            // Display blog
            res.send(`

                <!DOCTYPE html>

                <html lang="en">

                <head>

                    <meta charset="UTF-8">

                    <meta
                        name="viewport"
                        content="width=device-width,
                        initial-scale=1.0"
                    >

                    <title>
                        ${escapeHTML(blog.title)}
                    </title>

                    <link
                        rel="stylesheet"
                        href="/css/style.css"
                    >

                </head>


                <body>

                    <header>

                        <div class="navbar">

                            <h1>
                                My Blog
                            </h1>

                            <nav>

                                <a href="/">
                                    Home
                                </a>

                                <a href="/dashboard">
                                    Dashboard
                                </a>

                                <a href="/create-blog">
                                    Create Blog
                                </a>

                            </nav>

                        </div>

                    </header>


                    <main class="container">

                        <article
                            class="blog-details"
                        >

                            <h1>
                                ${escapeHTML(
                                    blog.title
                                )}
                            </h1>


                            <p class="author">

                                <strong>
                                    Author:
                                </strong>

                                ${escapeHTML(
                                    blog.author
                                )}

                            </p>


                            <p>

                                <strong>
                                    Published:
                                </strong>

                                ${new Date(
                                    blog.createdAt
                                ).toLocaleString()}

                            </p>


                            <hr>


                            <div class="content">

                                ${escapeHTML(
                                    blog.content
                                )}

                            </div>


                            <br>


                            <a
                                href="/dashboard"
                                class="btn back-btn"
                            >
                                Back to Dashboard
                            </a>

                        </article>

                    </main>


                    <footer>

                        <p>
                            &copy; 2026 My Blog.
                            All Rights Reserved.
                        </p>

                    </footer>

                </body>

                </html>

            `);


        } catch (error) {

            console.error(
                "Blog Details Error:",
                error
            );


            res.status(400).send(`
                <h2>
                    Invalid Blog ID
                </h2>

                <a href="/dashboard">
                    Back to Dashboard
                </a>
            `);

        }

    }
);


// =========================
// DELETE BLOG
// =========================

app.post(
    "/delete-blog/:id",
    async (req, res) => {

        if (!db) {

            return res.send(
                "Database is not connected."
            );

        }


        try {

            const blogId =
                new ObjectId(
                    req.params.id
                );


            await db
                .collection("blogs")
                .deleteOne({
                    _id: blogId
                });


            console.log(
                "Blog deleted:",
                blogId
            );


            // Return to dashboard
            res.redirect(
                "/dashboard"
            );


        } catch (error) {

            console.error(
                "Delete Blog Error:",
                error
            );


            res.status(500).send(
                "Unable to delete blog."
            );

        }

    }
);


// =========================
// START SERVER
// =========================

async function startServer() {

    await connectDatabase();

    app.listen(
        PORT,
        () => {

            console.log(
                `Server running at http://localhost:${PORT}`
            );

        }
    );

}


startServer();