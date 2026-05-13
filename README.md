## 📸 Screenshots

| Chat Room | Signup Form | Feature Highlight |
| :---: | :---: | :---: |
| <img src="https://res.cloudinary.com/damecjgp9/image/upload/v1778662392/Screenshot_2026-05-13_at_2.17.25_PM_vlah9m.png" width="300" /> | <img src="https://res.cloudinary.com/damecjgp9/image/upload/v1778662391/Screenshot_2026-05-13_at_2.22.32_PM_uol089.png" width="300" /> | <img src="https://res.cloudinary.com/damecjgp9/image/upload/v1778662390/Screenshot_2026-05-13_at_2.13.43_PM_fjk6ey.png" width="300" /> |

# Live Chat Application (v1)

A full-stack real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO.

## 🌟 Overview

This project is a feature-rich real-time messaging platform. It allows users to sign up, log in, and engage in instant private conversations. The application supports real-time status updates, typing indicators, and file sharing.

## 📂 Project Structure

The project is divided into two main parts:

- **[Client](./client)**: A React-based frontend application.
- **[Server](./server)**: A Node.js/Express-based backend application.

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (Local or Atlas)
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd live-chat-v1
   ```

2. **Set up the Server**
   ```bash
   cd server
   npm install
   # Create .env and configure MONGODB_URI, JWT_SECRET
   npm start
   ```

3. **Set up the Client**
   ```bash
   cd ../client
   npm install
   # Create .env and configure REACT_APP_BASE_URL
   npm start
   ```

## 🛠️ Key Technologies

- **Frontend**: React, Material UI, Socket.io-client, Axios, React Router.
- **Backend**: Node.js, Express, Socket.io, JWT, Mongoose.
- **Database**: MongoDB.
- **File Handling**: Multer, Sharp.

## 📖 Detailed Documentation

- For frontend details, see [client/README.md](./client/README.md).
- For backend details, see [server/README.md](./server/README.md).

## 🚀 Live Demo

[![Deploy to Render](https://img.shields.io/badge/Live%20Demo-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://live-chat-v1-1.onrender.com/)
