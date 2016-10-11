'use strict';

const path = require('path');
const dotenv = require('dotenv');

dotenv.config({silent: true, path: path.join(__dirname, '..', '.env')});

module.exports = {
  loggly: {
    token: process.env.LOGGLY_TOKEN,
    subdomain: process.env.LOGGLY_SUBDOMAIN,
    tags: ['node'],
    json: true
  },
  sentry: process.env.SENTRY_DSN,
  m2m: {user: process.env.M2M_USER, password: process.env.M2M_PASSWORD},
  port: process.env.PORT || 3000
};
