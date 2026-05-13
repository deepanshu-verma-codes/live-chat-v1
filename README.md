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
