const crypto = require('crypto');
const telegramService = require('../services/telegramService');
const mediaRepository = require('../repositories/mediaRepository');

const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');

class MediaController {
  // POST /api/v1/media/upload (Consumed by Odoo)
  async uploadFromOdoo(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided under field "image"' });
      }

      const odooModel = req.body.odoo_model || 'unknown.model';
      const odooRecordId = req.body.odoo_record_id || '0';
      const caption = `${odooModel} #${odooRecordId}`;

      // 1. Push buffer to Telegram private channel
      const { fileId, uniqueId } = await telegramService.uploadPhoto(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        caption
      );

      // 2. Generate short public slug and persist mapping in MySQL
      const mediaId = `m_${crypto.randomBytes(6).toString('hex')}`;
      await mediaRepository.saveMedia({
        mediaId,
        odooModel,
        odooRecordId: String(odooRecordId),
        telegramFileId: fileId,
        telegramUniqueId: uniqueId,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
      });

      const publicUrl = `${PUBLIC_BASE_URL}/api/v1/media/${mediaId}`;
      console.log(`[UPLOAD] Synced ${caption} -> ${mediaId}`);

      return res.status(200).json({
        media_id: mediaId,
        url: publicUrl,
      });
    } catch (error) {
      console.error('[UPLOAD ERROR]', error.response?.data || error.message);
      return res.status(502).json({
        error: 'Failed to process and store image on Telegram',
        details: error.message,
      });
    }
  }

  // GET /api/v1/media/:mediaId (Consumed by Flutter Image.network / CachedNetworkImage)
  async streamMedia(req, res) {
    try {
      const { mediaId } = req.params;
      const record = await mediaRepository.findByMediaId(mediaId);

      if (!record) {
        return res.status(404).json({ error: 'Media not found' });
      }

      const stream = await telegramService.getFileStream(record.telegram_file_id);

      res.setHeader('Content-Type', record.mime_type || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache on mobile client for 24h
      stream.pipe(res);
    } catch (error) {
      console.error('[STREAM ERROR]', error.response?.data || error.message);
      return res.status(502).json({ error: 'Unable to fetch image from storage' });
    }
  }

  // GET /api/v1/media/record/:model/:recordId (JSON metadata endpoint for Flutter API)
  async getRecordMedia(req, res) {
    try {
      const { model, recordId } = req.params;
      const items = await mediaRepository.findByOdooRecord(model, recordId);

      const formatted = items.map((item) => ({
        media_id: item.media_id,
        url: `${PUBLIC_BASE_URL}/api/v1/media/${item.media_id}`,
        mime_type: item.mime_type,
        file_size: item.file_size,
        created_at: item.created_at,
      }));

      return res.json({
        odoo_model: model,
        odoo_record_id: recordId,
        media: formatted,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new MediaController();