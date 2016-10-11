'use strict';

const express = require('express');
const raven = require('raven');
const winston = require('winston');
const expressWinston = require('express-winston');
const config = require('./config');
require('winston-loggly');

winston.add(winston.transports.Loggly, config.loggly);

// Instancia de express
const app = express();

// Sentry middelware
app.use(raven.middleware.express.requestHandler(config.sentry));

app.use(expressWinston.logger({
  transports: [
    new winston.transports.Loggly(config.loggly)
  ]
}));

// Rutas
require('./routes')(app);

app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Loggly(config.loggly)
  ]
}));

// Sentry middelware
app.use(raven.middleware.express.errorHandler(config.sentry));

app.listen(config.port, () =>
  winston.info(`Express app started on port ${config.port}`)
);

module.exports = app;
