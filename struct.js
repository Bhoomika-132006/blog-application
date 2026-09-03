/* =========================
   REGISTER
========================= */

const registerForm =
    document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const name =
                document.getElementById(
                    "registerName"
                ).value;

            const email =
                document.getElementById(
                    "registerEmail"
                ).value;

            const password =
                document.getElementById(
                    "registerPassword"
                ).value;


            const user = {
                name: name,
                email: email,
                password: password
            };


            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );


            alert(
                "Registration successful!"
            );


            window.location.href =
                "login.html";
        }
    );
}


/* =========================
   LOGIN
========================= */

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const email =
                document.getElementById(
                    "loginEmail"
                ).value;

            const password =
                document.getElementById(
                    "loginPassword"
                ).value;


            const savedUser =
                JSON.parse(
                    localStorage.getItem("user")
                );


            if (!savedUser) {

                alert(
                    "Please register first."
                );

                return;
            }


            if (
                email === savedUser.email &&
                password === savedUser.password
            ) {

                localStorage.setItem(
                    "loggedIn",
                    "true"
                );


                alert(
                    "Login successful!"
                );


                window.location.href =
                    "dashboard.html";

            } else {

                alert(
                    "Invalid email or password."
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
        function (event) {

            event.preventDefault();


            const title =
                document.getElementById(
                    "blogTitle"
                ).value;

            const author =
                document.getElementById(
                    "blogAuthor"
                ).value;

            const content =
                document.getElementById(
                    "blogContent"
                ).value;


            const blog = {

                id: Date.now(),

                title: title,

                author: author,

                content: content

            };


            let blogs =
                JSON.parse(
                    localStorage.getItem("blogs")
                ) || [];


            blogs.push(blog);


            localStorage.setItem(
                "blogs",
                JSON.stringify(blogs)
            );


            alert(
                "Blog published successfully!"
            );


            window.location.href =
                "dashboard.html";

        }
    );
}


/* =========================
   DISPLAY BLOGS ON HOME
========================= */

function displayHomeBlogs() {

    const blogList =
        document.getElementById(
            "blogList"
        );


    if (!blogList) {
        return;
    }


    const blogs =
        JSON.parse(
            localStorage.getItem("blogs")
        ) || [];


    if (blogs.length === 0) {

        blogList.innerHTML =
            "<p>No blogs available yet.</p>";

        return;
    }


    blogList.innerHTML = "";


    blogs.forEach(function (blog) {

        const card =
            document.createElement("div");

        card.className =
            "blog-card";


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
}


displayHomeBlogs();


/* =========================
   DASHBOARD BLOGS
========================= */

function displayDashboardBlogs() {

    const dashboardBlogs =
        document.getElementById(
            "dashboardBlogs"
        );


    if (!dashboardBlogs) {
        return;
    }


    const blogs =
        JSON.parse(
            localStorage.getItem("blogs")
        ) || [];


    if (blogs.length === 0) {

        dashboardBlogs.innerHTML =
            "<p>You haven't created any blogs yet.</p>";

        return;
    }


    dashboardBlogs.innerHTML = "";


    blogs.forEach(function (blog) {

        const card =
            document.createElement("div");

        card.className =
            "blog-card";


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
}


displayDashboardBlogs();


/* =========================
   DELETE BLOG
========================= */

function deleteBlog(id) {

    let blogs =
        JSON.parse(
            localStorage.getItem("blogs")
        ) || [];


    blogs =
        blogs.filter(
            function (blog) {

                return blog.id !== id;

            }
        );


    localStorage.setItem(
        "blogs",
        JSON.stringify(blogs)
    );


    alert(
        "Blog deleted successfully!"
    );


    displayDashboardBlogs();

}


/* =========================
   SHOW USER NAME
========================= */

function showUser() {

    const welcomeUser =
        document.getElementById(
            "welcomeUser"
        );


    if (!welcomeUser) {
        return;
    }


    const savedUser =
        JSON.parse(
            localStorage.getItem("user")
        );


    if (savedUser) {

        welcomeUser.innerText =
            "Welcome, " +
            savedUser.name +
            "!";

    }

}


showUser();


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