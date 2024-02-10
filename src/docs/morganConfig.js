const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const createFile = (path) => {
  if (!fs.existsSync(path)) {
    fs.closeSync(fs.openSync(path, 'w'));
  }
};

morgan.token('req-headers-length', function (req, res, param) {
  return Object.keys(req.headers).length;
});

morgan.token('req-headers', function (req, res, param) {
  return JSON.stringify(req.headers);
});

morgan.token('body', (req, res) => {
  let body = JSON.stringify(req.body);
  if (body.length > 150) {
    return body.substring(0, 150) + '...';
  }
  return body;
});

morgan.token('ip', (req, res) => {
  var forwardedIpsStr = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  var IP = 'NA';

  if (forwardedIpsStr) {
    IP = forwardedIps = forwardedIpsStr.split(',')[0];
  }
  return IP;
});

morgan.token('path', (req, res) => {
  var allPathParams = req.params;

  if (allPathParams) {
    return JSON.stringify(allPathParams);
  }

  return '';
});

morgan.token('query', (req, res) => {
  var allQueryParams = req.query;

  if (allQueryParams) {
    return JSON.stringify(allQueryParams);
  }

  return '';
});

/**
 * The final prepared morgan format
 * @returns {string} Morgan config in json form.
 */
const accessLogFormat = () =>
  JSON.stringify({
    method: ':method',
    url: ':url',
    http_version: ':http-version',
    response_time: ':response-time',
    status: ':status',
    content_length: ':res[content-length]',
    timestamp: ':date[iso]',
    headers_count: ':req-headers-length',
    ip: ':ip',
  });

// `:date[iso] :method :status :url :http-version ResponseTime=> :response-time   HeaderLength=> :req-headers-length ip=> :ip PathData=> :path QueryData=> :query Body=> :body ResponseLength=> :res[content-length] Response=> :res`;
/**
 * The final prepared morgan format
 * @returns {string} Morgan config in json form.
 */
const errorLogFormat = () =>
  JSON.stringify({
    method: ':method',
    url: ':url',
    http_version: ':http-version',
    response_time: ':response-time',
    status: ':status',
    content_length: ':res[content-length]',
    timestamp: ':date[iso]',
    headers_count: ':req-headers-length',
    ip: ':ip',
    path: ':path',
    query: ':query',
    body: ':body',
  });

createFile('app.error.log');
createFile('app.access.log');

const errorLogStream = fs.createWriteStream(path.join('app.error.log'), {
  flags: 'a+',
});

const accessLogStream = fs.createWriteStream(path.join('app.access.log'), {
  flags: 'a+',
});

const errorLogger = morgan(errorLogFormat(), {
  stream: errorLogStream,
  skip: (req, res) => res.statusCode < 400,
});

const accessLogger = morgan(accessLogFormat(), {
  stream: accessLogStream,
  skip: (req, res) => res.statusCode >= 400,
});

module.exports = {
  errorLogger,
  accessLogger,
};

