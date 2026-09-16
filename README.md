# Full-Stack Blog Application

A responsive and user-friendly full-stack Blog Application developed using **HTML, CSS, JavaScript, Node.js, Express.js, and MongoDB Atlas**.

The application allows users to register, log in, create and publish blogs, view blogs, read individual blog posts, and delete blogs through a Node.js and Express.js backend connected to MongoDB Atlas.

## 🚀 Features

- User Registration
- User Login
- Create and Publish Blogs
- Display Latest Blogs on Home Page
- View All Blogs on Dashboard
- Read Individual Blog Posts
- Delete Blogs
- MongoDB Atlas Database Integration
- Server-Side Form Handling
- Express.js Backend
- Responsive Design
- Git & GitHub Version Control

## 🛠️ Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js
- CORS
- dotenv

### Database
- MongoDB Atlas
- MongoDB Node.js Driver

### Development Tools
- Visual Studio Code
- Git
- GitHub
- MongoDB Atlas

## 🗄️ Database Structure

```text
blogDatabase
├── users
└── blogs
```

🏠 Home Page

The Home page displays the latest 3 blogs stored in MongoDB Atlas.

Users can:

View blog titles
View authors
Preview blog content
Read complete blog posts
Navigate to the Dashboard
Create a new blog
📊 Dashboard

The Dashboard displays all blogs stored in MongoDB Atlas.

Each blog provides:

Blog title
Author
Content
Read More option
Delete option

Blogs are displayed with the newest blogs first.

✍️ Create Blog

Users can create a blog by entering:

Blog Title
Author Name
Blog Content

The information is submitted through an HTML form and stored in the MongoDB Atlas blogs collection.

🔐 User Registration and Login
Registration

Users can create an account using:

Name
Email
Password

The information is stored in the MongoDB Atlas users collection.

Login

Registered users can log in using:

Email
Password

The server checks the submitted credentials against the users collection.

📂 Project Structure
blog/
│
├── backend/
│   ├── node_modules/
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── structure.js
│   ├── create-blog.html
│   ├── dashboard.html
│   ├── index.html
│   ├── login.html
│   └── register.html
│
├── .gitignore
│
└── README.md
🔒 Environment Variables

MongoDB connection details are stored securely in the .env file.

MONGODB_URI=your_mongodb_connection_string

The .env file should not be uploaded to GitHub.


📌 Project Status

Completed – Full-Stack Blog Application

👩‍💻 Author

Bhoomika M S