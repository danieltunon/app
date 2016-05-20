const express = require('express');
var bodyParser = require('body-parser');
require('dotenv').config();
const templateQueue = require('./templateQueue');
const scheduleQueue = require('../schedulingService/scheduleQueue');

const app = express();
app.use(bodyParser.urlencoded({ extended: 'true' }));
app.use(bodyParser.json());

app.post('/queue/templates/', function(req, res) {
  console.log('omg a post came in')
  templateQueue.enqueue(req.body);
  res.status(201);
});

app.post('/generate/users/:uid/templates/:tid', function (req, res) {
  console.log('got your post')
  templateQueue.processNext(req.params.tid, req.params.uid, res);
});

app.post('/queue/scheduled', function(req, res) {
  console.log('omg a post came in')
  scheduleQueue.enqueue(req.body);
  res.status(201);
});

app.post('/post/users/:uid/tweets/:tid', function(req, res) {
  console.log('got your post')
  scheduleQueue.processNext(req.params.tid, req.params.uid, res);
});

app.listen(8558);
console.log('Listening on port 8558');
