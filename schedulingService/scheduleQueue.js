const async = require('async');
const Tweets = require('../server/db/controllers/tweetsController');
const twit = require('../templateServices/helpers').twit;
require('dotenv').config();

function createPostJob(botTweetId, userTwitterId, scheduledId) {
  console.log('job is running');
  return Tweets.joinTweetAndUserByTweetId(botTweetId)
  .then(join => twit.post(join.bot_tweet_body, join.token, join.tokenSecret))
  .then(data => Tweets.savePostedTweet(data))
  .then(() => Tweets.modifyTweetStatus(botTweetId, 'posted'))
  .then(() => Tweets.deleteScheduledTweet(scheduledId))
  .catch(err => {console.log(err); return err;});
}

const q = async.queue(
  (task, cb) =>
    createPostJob(task.bot_tweet_id, task.user_twitter_id, task.schedule_id)
    .then(() => cb())
    .catch(cb),
  1
);

function enqueue(templates) {
  console.log('enqueuing')
  q.push(templates, (err) => console.log(err));
}

function processNext(schedule_id, user_twitter_id, res) {
  console.log('processingNext');
  q.unshift({ schedule_id, user_twitter_id, res }, (err) => console.log(err));
}

module.exports = {
  enqueue,
  processNext,
};
