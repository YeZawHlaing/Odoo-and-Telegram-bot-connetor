const { pool } = require('../config/db');

class MediaRepository {
  async saveMedia({
    mediaId,
    odooModel,
    odooRecordId,
    telegramFileId,
    telegramUniqueId,
    mimeType,
    fileSize,
  }) {
    const sql = `
      INSERT INTO media_files 
        (media_id, odoo_model, odoo_record_id, telegram_file_id, telegram_unique_id, mime_type, file_size)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await pool.execute(sql, [
      mediaId,
      odooModel,
      odooRecordId,
      telegramFileId,
      telegramUniqueId,
      mimeType,
      fileSize,
    ]);
  }

  async findByMediaId(mediaId) {
    const sql = `
      SELECT media_id, odoo_model, odoo_record_id, telegram_file_id, mime_type, file_size, created_at
      FROM media_files
      WHERE media_id = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(sql, [mediaId]);
    return rows[0] || null;
  }

  async findByOdooRecord(odooModel, odooRecordId) {
    const sql = `
      SELECT media_id, mime_type, file_size, created_at
      FROM media_files
      WHERE odoo_model = ? AND odoo_record_id = ?
      ORDER BY created_at DESC
    `;
    const [rows] = await pool.execute(sql, [odooModel, String(odooRecordId)]);
    return rows;
  }
}

module.exports = new MediaRepository();