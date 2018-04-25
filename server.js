var express = require('express')
var proxy = require('express-http-proxy');

var app = express();

var port = Number(process.argv[2]) || 3000;
var proxy_addr = process.argv[3] || 'http://localhost:3001';

// works but probably not the right way to do this...
app.use('/api', proxy(proxy_addr, {
  proxyReqPathResolver: function(req) {
    return `/api${req.url}`;
  }
}));

app.use(express.static('build'));

app.listen(port, function () {
  console.log(`Running production server on ${port}.`);
  console.log(`Proxying /api to ${proxy_addr}.`);
});
