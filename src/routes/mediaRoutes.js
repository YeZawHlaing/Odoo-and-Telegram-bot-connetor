const express = require('express');
const multer = require('multer');
const mediaController = require('../controllers/mediaController');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

// Odoo upload endpoint (matches Odoo's files={'image': ...})
router.post('/upload', upload.single('image'), (req, res) =>
  mediaController.uploadFromOdoo(req, res)
);

// Flutter REST metadata endpoint by Odoo model & record ID
router.get('/record/:model/:recordId', (req, res) =>
  mediaController.getRecordMedia(req, res)
);

// Flutter binary image proxy endpoint
router.get('/:mediaId', (req, res) =>
  mediaController.streamMedia(req, res)
);

module.exports = router;