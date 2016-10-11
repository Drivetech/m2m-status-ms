'use strict';

const m2m = require('m2m-status');
const config = require('../config');

exports.get = (req, res, next) => {
  const client = new m2m(config.m2m);
  let promise = null;
  if (/\d{11}/.test(req.query.sim)) {
    promise = client.checkSim(`+${req.query.sim}`);
  } else if (/\d{19}/.test(req.query.icc)) {
    promise = client.checkIcc(req.query.icc);
  }
  if (promise === null) return res.sendStatus(401);
  return promise
    .then(result => res.json(result))
    .catch(err => next(err));
};
