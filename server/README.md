# Live Chat Server

The backend of the Live Chat application, built with Node.js, Express, and Socket.IO.

## 🚀 Features

- **REST API**: Comprehensive API for user authentication and management.
- **Real-time Communication**: Powered by Socket.IO for instant messaging and events.
- **Authentication**: JWT (JSON Web Tokens) based authentication.
- **Database**: MongoDB integration using Mongoose for data persistence.
- **File Uploads**: Support for image and file uploads using Multer.
- **Image Processing**: Image optimization and resizing using Sharp.
- **Security**: Password hashing with Bcryptjs and CORS protection.

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) / [Mongoose](https://mongoosejs.com/)
- **Real-time**: [Socket.io](https://socket.io/)
- **Authentication**: [JSON Web Tokens (JWT)](https://jwt.io/)
- **File Handling**: [Multer](https://github.com/expressjs/multer), [Sharp](https://sharp.pixelplumbing.com/)
- **Utilities**: [Bcryptjs](https://github.com/dcodeIO/bcrypt.js), [UUID](https://github.com/uuidjs/uuid), [FS-Extra](https://github.com/jprichardson/node-fs-extra)

## ⚙️ Setup Instructions

### 1. Prerequisites
- Node.js (v14 or higher)
- MongoDB (Local or Atlas)
- npm or yarn

### 2. Install Dependencies
```bash
cd server
npm install
# or
yarn install
```

### 3. Environment Variables
Create a `.env` file in the `server` directory based on `.env.example`:
```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=http://localhost:3000
```

### 4. Database Setup
Ensure your MongoDB server is running and the `MONGODB_URI` in your `.env` file is correct.

### 5. Start the Server
```bash
npm start
```
The server will be available at `http://localhost:5001`.

## 📂 Project Structure

- `src/server.js`: Main entry point and Express app configuration.
- `src/socket.js`: Socket.IO logic and event handlers.
- `src/db.js`: MongoDB connection setup.
- `src/models/`: Mongoose schemas (User, Message).
- `src/routes/`: Express API routes.
- `src/uploads/`: Directory for uploaded files.
