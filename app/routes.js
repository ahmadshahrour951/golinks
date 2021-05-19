const express = require('express');
const router = express.Router();

const controllers = require('./controllers');

router.get('/:username', controllers.getUserStats);

/////////////////////////////////////////////////////////////////////////////////////////
// Error page for error handling
/////////////////////////////////////////////////////////////////////////////////////////
router.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

/////////////////////////////////////////////////////////////////////////////////////////
// If no explicit error and route requested not found
/////////////////////////////////////////////////////////////////////////////////////////
router.use((req, res, next) => {
  res.status(404).json({ message: 'API endpoint invalid', data: {} });
});

module.exports = router;
