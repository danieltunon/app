const async = require('async');
const Tweets = require('../../server/db/controllers/tweetsController');

function createPostJob(generatedTweetId, scheduledId, res) {
  console.log('job is running');
  return Tweets.joinTweetAndUserByTweetId(generatedTweetId)
  .then(join => twit.post(join.bot_tweet_body, join.token, join.tokenSecret))
  .then(data => {
    res && res.status(201).send('post success');
    return Tweets.savePostedTweet(data)
  })
  .then(() => Tweets.modifyTweetStatus(generatedTweetId, 'posted'))
  .then(() => Tweets.deleteScheduledTweet(scheduledId))
  .catch(err => {console.log(err); return err;});
}

const q = async.queue(
  (task, cb) =>
    createTemplateJob(task.template_id, task.user_twitter_id, task.res)
    .then(() => cb())
    .catch(cb),
  1
);

function enqueue(templates) {
  q.push(templates, (err) => console.log(err));
}

function processNext(template_id, user_twitter_id, res) {
  console.log('processingNext');
  q.unshift({ template_id, user_twitter_id, res }, (err) => console.log(err));
}

module.exports = {
  enqueue,
  processNext,
};
