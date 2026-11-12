# Telegram Media Middleware

A Node.js, Express, and MySQL middleware service that bridges **Odoo**, **Telegram Cloud Storage**, and **Flutter** mobile clients.

When a user uploads an image in Odoo, Odoo dispatches the raw binary stream to this middleware. The middleware forwards the image to a private Telegram channel via the Telegram Bot API, stores the persistent `file_id` mapping in MySQL, and exposes clean, token-free REST endpoints for mobile apps to fetch and stream images.

---

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
