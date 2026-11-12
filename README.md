# Telegram Media Middleware

A Node.js, Express, and MySQL middleware service that bridges **Odoo**, **Telegram Cloud Storage**, and **Flutter** mobile clients.

When a user uploads an image in Odoo, Odoo dispatches the raw binary stream to this middleware. The middleware forwards the image to a private Telegram channel via the Telegram Bot API, stores the persistent `file_id` mapping in MySQL, and exposes clean, token-free REST endpoints for mobile apps to fetch and stream images.

---
## System Architecture Diagram

This is draw.io link to check how system work
[View System Architecture Diagram (draw.io)](https://drive.google.com/file/d/1PkXK8alMpuY6-hxhOvzmv0RZo3Yd3jWZ/view?usp=sharing)

## API Documentation for Mobile dev
[Implementing REST API Guide](Odoo-and-Telegram-bot-connetor/MOBILE.md)

## Architecture Overview

```text
[Odoo ERP]
   │  POST /api/v1/media/upload (multipart/form-data)
   ▼
[Express Middleware] ──► [MySQL Database] (Stores media_id <-> telegram_file_id)
   │
   ├──► [Telegram Bot API] (sendPhoto -> Private Channel Cloud Storage)
   │
   ◄──  GET /api/v1/media/:mediaId (Streams binary image to Flutter)
[Flutter Mobile App]
```

---

## Key Features

- Zero Bot Token Exposure: Mobile clients consume standard REST URLs (/api/v1/media/:mediaId) without ever accessing raw Telegram file URLs or bot tokens.

- Automatic Database Provisioning: Automatically creates the MySQL database (telegram_media_db) and media_files schema table at server startup.

- Layered Architecture: Clean separation across Routes, Controllers, Services (TelegramService), and Repositories (MediaRepository).

---

## Project Structure

```text
telegram-media-middleware/
├── .env.example                # Environment variable template
├── .gitignore                  # Git ignore rules
├── package.json                # Dependencies and scripts
├── README.md                   # Project documentation
└── src/
    ├── server.js               # Application entry point & DB bootstrap
    ├── config/
    │   └── db.js               # MySQL connection pool & auto-schema setup
    ├── routes/
    │   └── mediaRoutes.js      # Express router & Multer upload configuration
    ├── controllers/
    │   └── mediaController.js  # Request validation, upload & streaming handlers
    ├── services/
    │   └── telegramService.js  # Telegram Bot API integration (sendPhoto, getFile)
    └── repositories/
        └── mediaRepository.js  # Parameterized MySQL queries
```

---
## Prerequisites

- Node.js v18+

- MySQL 8.0+ (or MariaDB 10.6+)

- Telegram Bot & Private Channel:

1. Create a bot via @BotFather (/newbot) and copy the Bot Token.
2. Create a private Telegram channel, add the bot as an Administrator with Post Messages permission, and retrieve the channel's numeric chat_id (-100...).

---

## Installation and Setup

1. Clone the repository
```text
git clone [https://github.com/](https://github.com/)<your-username>/telegram-media-middleware.git
cd telegram-media-middleware
```

2. install dependency
```text
npm install
```

3. Configure environment variables:
   
Copy .env.example to .env and fill in your local or production credentials:
```text
cp .env.example .env
```

4. Start the server
```text
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

