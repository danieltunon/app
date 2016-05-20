const Tweets = require('../server/db/controllers/tweetsController');
require('isomorphic-fetch');
const enqueue = require('./scheduleQueue').enqueue;

Tweets.findReadyTweets()
.then(enqueue)
.then(console.log)
.catch(console.log);
