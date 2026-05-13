# Live Chat Client

The frontend of the Live Chat application, built with React and Socket.IO.

## 🚀 Features

- **Real-time Messaging**: Instant message delivery using Socket.IO.
- **Authentication**: Secure Signup and Login using JWT.
- **Chat History**: Persisted chat history between users.
- **User Status**: Real-time online/offline status indicators.
- **Typing Indicators**: See when others are typing.
- **Read Receipts**: Know when your messages have been read.
- **File Sharing**: Support for sharing images and files in chat.
- **Responsive Design**: Built with Material UI and MDB React for a modern look and feel.
- **Profile Management**: View and update user profiles.

## 🛠️ Tech Stack

- **Framework**: [React](https://reactjs.org/)
- **UI Components**: [Material UI](https://mui.com/), [MDB React UI Kit](https://mdbootstrap.com/docs/standard/)
- **Real-time Communication**: [Socket.io-client](https://socket.io/docs/v4/client-api/)
- **API Requests**: [Axios](https://axios-http.com/)
- **Routing**: [React Router Dom](https://reactrouter.com/)
- **Date Formatting**: [Moment.js](https://momentjs.com/)
- **Icons**: [FontAwesome](https://fontawesome.com/)

## ⚙️ Setup Instructions

### 1. Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### 2. Install Dependencies
```bash
cd client
npm install
# or
yarn install
```

### 3. Environment Variables
Create a `.env` file in the `client` directory based on `.env.example`:
```env
REACT_APP_CHAT_BASE_URL=http://localhost:5001
REACT_APP_BASE_URL=http://localhost:5001/api
```

### 4. Start the Application
```bash
npm start
```
The application will be available at `http://localhost:3000`.

## 📜 Available Scripts

- `npm start`: Runs the app in development mode.
- `npm run build`: Builds the app for production.
- `npm test`: Launches the test runner.
- `npm run eject`: Removes the single build dependency from your project.
