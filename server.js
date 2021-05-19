if (process.env.NODE_ENV !== 'production') {
  require('dotenv-safe').config();
}
const express = require('express');
const logger = require('morgan');
const cors = require('cors');

const routes = require('./app/routes');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(logger('combined'));
app.use(express.json());
app.use(cors('*'));

app.use('/api/v1', routes);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

module.exports = app;
