# Mobile Developer Integration Guide (Flutter)

This guide explains how the Flutter mobile app fetches product/record images and metadata from the **Telegram Media Middleware** REST API.

---

## 1. Base URL Configuration

Depending on how you are testing the Flutter app, configure your API base URL accordingly:

| Environment | Base URL | Notes |
| :--- | :--- | :--- |
| **Android Emulator** | `http://10.0.2.2:3000` | `10.0.2.2` maps to your host machine's `127.0.0.1` |
| **iOS Simulator** | `http://127.0.0.1:3000` | Shares host network interface directly |
| **Physical Phone (Same Wi-Fi)** | `http://<PC_LAN_IP>:3000` | e.g., `http://192.168.1.25:3000` (Ensure port `3000` is allowed in Firewall) |
| **Production Server** | `https://your-domain.com` | Deployed HTTPS endpoint |

> **Important:** Do **not** use `127.0.0.1` or `localhost` on a physical mobile device, as that points to the phone itself rather than the backend server.

---

## 2. REST API Endpoints

### A. Get Media Metadata by Odoo Record
Use this endpoint when you have an Odoo model name (e.g., `product.template`) and record ID (e.g., `11`) and need its associated image URL(s).

* **Method:** `GET`
* **Endpoint:** `/api/v1/media/record/:model/:recordId`
* **Example Request:**
  ```http
  GET /api/v1/media/record/product.template/11 HTTP/1.1
  Host: 192.168.1.25:3000
  Accept: application/json

---

## Success Response (200 OK)
```json
{
  "odoo_model": "product.template",
  "odoo_record_id": "11",
  "media": [
    {
      "media_id": "m_2eef8e5f9902",
      "url": "[http://192.168.1.25:3000/api/v1/media/m_2eef8e5f9902](http://192.168.1.25:3000/api/v1/media/m_2eef8e5f9902)",
      "mime_type": "image/jpeg",
      "file_size": 12974,
      "created_at": "2026-11-12T03:50:00.000Z"
    }
  ]
}
```
---

### B. Stream Image Binary Directly

Pass this URL directly into Flutter image widgets (Image.network or CachedNetworkImage). The server handles authentication and streaming behind the scenes and returns standard image bytes.

- Method: GET

- Endpoint: /api/v1/media/:mediaId

- Example URL:
  ```text
  [http://192.168.1.25:3000/api/v1/media/m_2eef8e5f9902](http://192.168.1.25:3000/api/v1/media/m_2eef8e5f9902)
  ```

- Response Headers:

1. Content-Type: image/jpeg (or image/png)
2. Cache-Control: public, max-age=86400 (24-hour client caching enabled)

- Error Responses:

1. 404 Not Found: { "error": "Media not found" } — Invalid mediaId.

2. 502 Bad Gateway: { "error": "Unable to fetch image from storage" } — Upstream storage timeout; show a fallback placeholder image in the UI.
---
