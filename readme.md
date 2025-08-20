# Chat Application

This is a Node.js and Express-based chat application where users can create **public** or **private** chat rooms, send and receive messages in real-time, and manage authentication with JWT.

---

## 🚀 Features

- User authentication (JWT-based)
- Create chat rooms:
  - **Public Rooms**: anyone can join
  - **Private Rooms**: only invited members can join
- Join chat rooms
- Real-time messaging
- Event-driven structure using `chat.event.ts`
- Error handling with a custom `AppError`

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Authentication**: JSON Web Token (JWT)
- **Database**: MySQL
- **Realtime**: Socket.io
- **Language**: TypeScript

---

## ⚙️ Setup & Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/philip/chat-app.git
   cd chat-app

2. To Install dependencies, run

  ```bash
    npm install

3. To start server, run 

  ```bash
    npm run dev