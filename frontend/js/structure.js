/* =========================
   REGISTER
========================= */

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;

        if (!name || !email || !password) {
            alert("Please fill in all fields.");
            return;
        }

        try {

            const response = await fetch(
                "http://localhost:3000/api/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                /*
                 * Save user temporarily in LocalStorage
                 * so the existing login/dashboard functionality
                 * continues to work until we connect the Login API.
                 */
                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        name: name,
                        email: email,
                        password: password
                    })
                );

                alert(data.message);

                registerForm.reset();

                window.location.href = "login.html";

            } else {

                alert(data.message);

            }

        } catch (error) {

            console.error("Registration Error:", error);

            alert(
                "Unable to connect to the server. Please make sure the backend server is running."
            );

        }

    });
}


/* =========================
   LOGIN
========================= */

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const email =
                document.getElementById(
                    "loginEmail"
                ).value.trim();

            const password =
                document.getElementById(
                    "loginPassword"
                ).value;

            if (!email || !password) {

                alert(
                    "Please enter email and password."
                );

                return;
            }

            try {

                const response = await fetch(
                    "http://localhost:3000/api/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            email: email,
                            password: password
                        })
                    }
                );

                const data =
                    await response.json();

                if (response.ok) {

                    localStorage.setItem(
                        "loggedIn",
                        "true"
                    );

                    localStorage.setItem(
                        "user",
                        JSON.stringify(data.user)
                    );

                    alert(data.message);

                    window.location.href =
                        "dashboard.html";

                } else {

                    alert(data.message);

                }

            } catch (error) {

                console.error(
                    "Login Error:",
                    error
                );

                alert(
                    "Unable to connect to the server. Please make sure the backend server is running."
                );

            }

        }
    );
}
/* =========================
   CREATE BLOG
========================= */

const blogForm =
    document.getElementById("blogForm");

if (blogForm) {

    blogForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const title =
                document.getElementById(
                    "blogTitle"
                ).value.trim();

            const author =
                document.getElementById(
                    "blogAuthor"
                ).value.trim();

            const content =
                document.getElementById(
                    "blogContent"
                ).value.trim();

            if (!title || !author || !content) {

                alert(
                    "Please fill in all blog fields."
                );

                return;
            }

            try {

                const response = await fetch(
                    "http://localhost:3000/api/blogs",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            title: title,
                            author: author,
                            content: content
                        })
                    }
                );

                const data =
                    await response.json();

                if (response.ok) {

                    alert(data.message);

                    blogForm.reset();

                    window.location.href =
                        "dashboard.html";

                } else {

                    alert(data.message);

                }

            } catch (error) {

                console.error(
                    "Create Blog Error:",
                    error
                );

                alert(
                    "Unable to connect to the server. Please make sure the backend server is running."
                );

            }

        }
    );
}


/* =========================
   DISPLAY BLOGS ON HOME
========================= */

async function displayHomeBlogs() {

    const blogList =
        document.getElementById("blogList");

    if (!blogList) {
        return;
    }

    try {

        const response = await fetch(
            "http://localhost:3000/api/blogs"
        );

        const blogs = await response.json();

        if (blogs.length === 0) {

            blogList.innerHTML =
                "<p>No blogs available yet.</p>";

            return;
        }

        blogList.innerHTML = "";

        blogs.forEach(function (blog) {

            const card =
                document.createElement("div");

            card.className = "blog-card";

            card.innerHTML = `

                <h3>${blog.title}</h3>

                <p class="author">
                    By ${blog.author}
                </p>

                <p>
                    ${blog.content}
                </p>

            `;

            blogList.appendChild(card);

        });

    } catch (error) {

        console.error(
            "Home Blogs Error:",
            error
        );

        blogList.innerHTML =
            "<p>Unable to load blogs from server.</p>";

    }
}

displayHomeBlogs();

/* =========================
   DASHBOARD BLOGS
========================= */

async function displayDashboardBlogs() {

    const dashboardBlogs =
        document.getElementById("dashboardBlogs");

    if (!dashboardBlogs) {
        return;
    }

    try {

        const response = await fetch(
            "http://localhost:3000/api/blogs"
        );

        const blogs = await response.json();

        if (blogs.length === 0) {

            dashboardBlogs.innerHTML =
                "<p>You haven't created any blogs yet.</p>";

            return;
        }

        dashboardBlogs.innerHTML = "";

        blogs.forEach(function (blog) {

            const card =
                document.createElement("div");

            card.className = "blog-card";

            card.innerHTML = `

                <h3>${blog.title}</h3>

                <p class="author">
                    By ${blog.author}
                </p>

                <p>
                    ${blog.content}
                </p>

                <button
                    class="delete-btn"
                    onclick="deleteBlog(${blog.id})"
                >
                    Delete
                </button>

            `;

            dashboardBlogs.appendChild(card);

        });

    } catch (error) {

        console.error(
            "Dashboard Error:",
            error
        );

        dashboardBlogs.innerHTML =
            "<p>Unable to load blogs from server.</p>";

    }
}

displayDashboardBlogs();


/* =========================
   DELETE BLOG
========================= */

async function deleteBlog(id) {

    const confirmDelete =
        confirm("Are you sure you want to delete this blog?");

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:3000/api/blogs/${id}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (response.ok) {

            alert(data.message);

            displayDashboardBlogs();

        } else {

            alert(data.message);

        }

    } catch (error) {

        console.error("Delete Blog Error:", error);

        alert(
            "Unable to connect to the server. Please make sure the backend server is running."
        );

    }
}



/* =========================
   LOGOUT
========================= */

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            localStorage.removeItem(
                "loggedIn"
            );

            alert(
                "You have been logged out."
            );

            window.location.href =
                "index.html";

        }
    );

}


