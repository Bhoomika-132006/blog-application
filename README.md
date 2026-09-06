# Full-Stack Blog Application

A responsive and user-friendly Blog Application developed using **HTML, CSS, JavaScript, Node.js, and Express.js**.

## 🚀 Features

- User Registration
- User Login
- Create and Publish Blogs
- Display Blogs
- Delete Blogs
- REST API Integration
- Backend Data Storage
- Responsive Design
- Git & GitHub

## 🛠️ Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript
- Fetch API

### Backend
- Node.js
- Express.js
- CORS
- REST APIs

### Data Storage
- JSON files

## 🔗 REST APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Check server status |
| GET | `/api/test` | Test API |
| POST | `/api/register` | Register user |
| POST | `/api/login` | Login user |
| POST | `/api/blogs` | Create blog |
| GET | `/api/blogs` | Get all blogs |
| DELETE | `/api/blogs/:id` | Delete blog |

## 📂 Project Structure

```text
blog/
├── backend/
│   ├── node_modules/
│   ├── blogs.json
│   ├── users.json
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
└── README.md
```

▶️ How to Run
1. Start the Backend

Open the terminal inside the backend folder: `node server.js`
The server will run at:http://localhost:3000

2. Start the Frontend

Open the frontend folder using Live Server.
Open:index.html

3. Use the Application
Register a new account.
Login using your credentials.
Create a blog.
View blogs on the Home page and Dashboard.
Delete blogs from the Dashboard.

📌 Project Status

Completed – Full-Stack Version

👩‍💻 Author

Bhoomika M S