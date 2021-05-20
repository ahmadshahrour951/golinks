const express = require('express');
const logger = require('morgan');
const cors = require('cors');

const routes = require('./app/routes');

const app = express();
const PORT = process.env.PORT || 5000;

// third party packages middleware
app.use(logger('combined'));
app.use(express.json());
app.use(cors('*'));

app.use('/', routes);

// Server starts here
app
  .listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  })
  .on('error', function (err) {
    if (err.errno === 'EADDRINUSE') {
      console.log(
        `----- Port ${PORT} is busy -----`
      );
    } else {
      console.log(err);
    }
  });


module.exports = app;
