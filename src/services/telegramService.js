const axios = require('axios');
const FormData = require('form-data');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const TELEGRAM_FILE_API = `https://api.telegram.org/file/bot${BOT_TOKEN}`;

class TelegramService {
  /**
   * Uploads an image buffer to the configured private Telegram channel.
   * Returns { fileId, uniqueId } of the highest-resolution variant.
   */
  async uploadPhoto(fileBuffer, filename, mimeType, caption = '') {
    const form = new FormData();
    form.append('chat_id', CHAT_ID);
    if (caption) {
      form.append('caption', caption);
    }
    form.append('photo', fileBuffer, {
      filename: filename || 'upload.jpg',
      contentType: mimeType || 'image/jpeg',
    });

    const response = await axios.post(`${TELEGRAM_API}/sendPhoto`, form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
      timeout: 20000,
    });

    if (!response.data || !response.data.ok) {
      throw new Error(`Telegram sendPhoto failed: ${JSON.stringify(response.data)}`);
    }

    // Telegram returns multiple resolutions; the last item is the largest
    const photos = response.data.result.photo;
    const bestPhoto = photos[photos.length - 1];

    return {
      fileId: bestPhoto.file_id,
      uniqueId: bestPhoto.file_unique_id,
    };
  }

  /**
   * Resolves a Telegram file_id to a fresh binary stream for Flutter clients.
   */
  async getFileStream(fileId) {
    const infoRes = await axios.get(`${TELEGRAM_API}/getFile`, {
      params: { file_id: fileId },
      timeout: 10000,
    });

    if (!infoRes.data || !infoRes.data.ok) {
      throw new Error('Failed to retrieve file_path from Telegram');
    }

    const filePath = infoRes.data.result.file_path;
    const downloadUrl = `${TELEGRAM_FILE_API}/${filePath}`;

    const fileStreamRes = await axios.get(downloadUrl, {
      responseType: 'stream',
      timeout: 20000,
    });

    return fileStreamRes.data;
  }
}

module.exports = new TelegramService();