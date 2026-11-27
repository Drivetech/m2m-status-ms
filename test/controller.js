'use strict';

const assert = require('assert');
const Client = require('m2m-status');
const clientModule = require.cache[require.resolve('m2m-status')];
const calls = [];
const result = {status: 'ACTIVE'};

clientModule.exports = class {
  checkSim(value) {
    calls.push(['checkSim', value]);
    return Promise.resolve(result);
  }

  checkIcc(value) {
    calls.push(['checkIcc', value]);
    return Promise.resolve(result);
  }
};

let get;
try {
  get = require('../src/api/controller').get;
} finally {
  clientModule.exports = Client;
}

const sim = '56912345678';
const icc = '8956012345678901234';
const cases = [{query: {}}];

Object.keys({sim, icc}).forEach(field => {
  const value = {sim, icc}[field];
  const invalidValues = [
    '',
    value.slice(1),
    value + '0',
    'prefix' + value,
    value + 'suffix',
    '+' + value,
    ' ' + value,
    value + ' ',
    value + '\n',
    value.slice(0, -1) + 'x',
    [value],
    [value, value],
    {value},
    {toString: value},
    Number(value),
    null
  ];
  invalidValues.forEach(invalid => cases.push({query: {[field]: invalid}}));
});

cases.push(
  {query: {sim}, expectedCall: ['checkSim', '+' + sim]},
  {query: {icc}, expectedCall: ['checkIcc', icc]},
  {query: {sim, icc}, expectedCall: ['checkSim', '+' + sim]},
  {query: {sim: 'prefix' + sim, icc}, expectedCall: ['checkIcc', icc]}
);

function verify(testCase) {
  calls.length = 0;
  let response;
  const res = {
    sendStatus(status) {
      response = {status};
    },
    json(body) {
      response = {body};
    }
  };

  return Promise.resolve(get({query: testCase.query}, res, err => {
    throw err;
  })).then(() => {
    const message = JSON.stringify(testCase.query);
    if (testCase.expectedCall) {
      assert.deepStrictEqual(calls, [testCase.expectedCall], message);
      assert.deepStrictEqual(response, {body: result}, message);
    } else {
      assert.deepStrictEqual(calls, [], message);
      assert.deepStrictEqual(response, {status: 401}, message);
    }
  });
}

cases.reduce((previous, testCase) => previous.then(() => verify(testCase)),
  Promise.resolve())
  .then(() => {
    process.stdout.write(`Passed ${cases.length} controller validation checks.\n`);
  })
  .catch(err => {
    process.stderr.write(err.stack + '\n');
    process.exitCode = 1;
  });
