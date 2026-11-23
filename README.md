# Full-Stack Blog Application

A responsive and user-friendly full-stack Blog Application developed using **HTML, CSS, JavaScript, Node.js, Express.js, and PostgreSQL**.

The application allows users to register, log in with secure password hashing and session tracking, create and publish blogs, view blogs, read individual blog posts, edit posts, and delete blogs through an Express.js backend connected to a local **PostgreSQL** database.

## 🚀 Features

- **User Authentication**: User registration and login with `bcrypt` password hashing and `express-session` cookies.
- **Dynamic Navigation**: Navigation bar automatically adapts to show logged-in user's name and Logout link.
- **Personalized Dashboard**: Greets logged-in users and allows full CRUD management of blogs.
- **Create & Publish Blogs**: Create blog posts with automatic author attribution for logged-in users.
- **Home Page Previews**: Displays the latest 3 blogs with clean excerpts and direct read-more navigation.
- **Read Blog Posts**: Dedicated blog details page with author, published date, updated date, and full content.
- **Edit Blogs**: Update blog post titles, authors, and content seamlessly with automatic `updated_at` timestamps.
- **Delete Blogs with Confirmation**: Safe deletion prompts before removing posts.
- **PostgreSQL Database Integration**: Persistent storage using the `pg` client connected to local PostgreSQL (`blog_db`).
- **Responsive Design**: Clean, modern CSS styling fully responsive across mobile, tablet, and desktop screens.

## 🛠️ Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript (`structure.js`)

### Backend
- Node.js
- Express.js
- PostgreSQL Client (`pg`)
- `express-session` (Session management)
- `bcrypt` (Secure password hashing)
- `cors`
- `dotenv`

### Database
- PostgreSQL (Local instance, port 5432)

---

## 🗄️ Database Structure

**Database Name:** `blog_db`

### `users` Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### `blogs` Table
```sql
CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

---

## 📂 Project Structure

```text
blog/
│
├── backend/
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
└── README.md
```

---

## 🔒 Environment Variables

Configuration details are stored securely in `backend/.env`:

```env
# Server Port
PORT=3000

# PostgreSQL Configuration
PG_HOST=127.0.0.1
PG_PORT=5432
PG_DATABASE=blog_db
PG_USER=postgres
PG_PASSWORD=your_postgres_password

# Session Secret
SESSION_SECRET=your_secret_key
```

> **Note:** Never commit `.env` containing sensitive credentials to public GitHub repositories.

---

## 🚦 How to Run the Application

1. **Install Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Set up PostgreSQL**:
   Ensure PostgreSQL is running on port 5432 with the database `blog_db` and tables created as shown above.

3. **Start the Server**:
   ```bash
   npm start
   ```

4. **Access the App**:
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 📌 Project Status

Completed – Full-Stack Blog Application with PostgreSQL & Session Authentication.

👩‍💻 **Author:** Bhoomika M S
