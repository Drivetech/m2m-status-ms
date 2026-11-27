'use strict';

const m2m = require('m2m-status');
const config = require('../config');

exports.get = (req, res, next) => {
  const client = new m2m(config.m2m);
  const {sim, icc} = req.query;
  let promise = null;
  if (typeof sim === 'string' && sim.length === 11 && /^\d+$/.test(sim)) {
    promise = client.checkSim(`+${sim}`);
  } else if (typeof icc === 'string' && icc.length === 19 && /^\d+$/.test(icc)) {
    promise = client.checkIcc(icc);
  }
  if (promise === null) return res.sendStatus(401);
  return promise
    .then(result => res.json(result))
    .catch(err => next(err));
};
