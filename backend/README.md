# 📘 User Management API

A clean, layered backend API for user management built with Node.js, Express, TypeScript, and MongoDB.  
The project focuses on scalable architecture, centralized error handling, and predictable request flow.

---

## 🧱 Tech Stack

- Node.js
- Express (ESM)
- TypeScript
- MongoDB + Mongoose

---

## 📁 Project Structure

src/
├─ app.ts # application boundary
├─ index.ts # server bootstrap
├─ db/ # database connection
├─ models/ # domain schemas
├─ routes/ # API contracts
├─ controllers/ # request orchestration
├─ middlewares/ # validation & error handling
├─ utils/ # shared utilities


---

## 🚀 How to Run Locally

```bash
npm install
npm run dev

The server will start on the configured port and connect to the database.

🔐 Environment Variables

Create a .env file in the project root:

PORT=3000
MONGO_URI=your_mongodb_connection_string

📡 API Endpoints
Users
Method	Route	Description
POST	/api/v1/users	Create a new user
GET	/api/v1/users	List users (supports pagination)
GET	/api/v1/users/:id	Get user by ID
PUT	/api/v1/users/:id	Update user
DELETE	/api/v1/users/:id	Deactivate user

⚠️ Error Handling Philosophy

This project uses centralized error handling.

Controllers throw standardized AppError instances

Async errors are safely propagated

A global error middleware formats all error responses

The server never crashes on async failures

All error responses follow a consistent structure.

🧠 Architecture Overview

The application follows a layered architecture:

Routes define API contracts

Controllers orchestrate request handling

Models define domain structure

Middlewares handle validation and errors

Utilities provide shared behavior

This separation keeps the codebase scalable and easy to reason about.

 Project Status

This project is complete and review-ready.
It is intended to demonstrate clean backend architecture rather than feature breadth.
