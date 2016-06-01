const knex = require('../db.js');
const moment = require('moment');

function scrubFetchedTweet(tweet, userId) {
  return {
    tweet_id_str: tweet.id_str,
    user_twitter_id: userId,
    retweet_count: tweet.retweet_count,
    favorite_count: tweet.favorite_count,
    user_screen_name: tweet.user.screen_name,
    user_followers_count: tweet.user.followers_count,
    tweet_text: tweet.text
  };
}
//cleans up data from post API call to Twitter
function scrubPostedTweet(tweet) {
  return {
    user_twitter_id: tweet.user.id_str,
    tweet_text: tweet.text,
    original_tweet_id: tweet.quoted_status_id_str,
    // right now not being used, but could store info from the original
    // tweet like retweet_count and followers_count to track performance
    // of our algorithm
    original_tweet_props: '',
    retweet_id: tweet.id_str,
    retweet_count: 0,
    favorite_count: 0,
    created_at: new Date(tweet.created_at),
    updated_at: new Date()
  };
}

function saveGeneratedTweets(tweets) {
  return knex('generatedtweets')
    .insert(tweets);
}

function getGeneratedTweets(userID, page) {
  return knex('generatedtweets')
    .where({ user_twitter_id: userID, tweet_status: 'available' })
    .select()
    .orderBy('updated_at', 'desc')
    .offset(page * 5)
    .limit(5);
}

function getScheduledTweets(userID) {
  return knex('generatedtweets')
  .where({ user_twitter_id: userID, tweet_status: 'scheduled' })
  .select();
}

function getPostedTweets(userID) {
  return knex('postedtweets')
    .where({ user_twitter_id: userID })
    .select();
}

function savePostedTweet(data) {
  return knex('postedtweets')
    .insert(scrubPostedTweet(data), 'retweet_id');
}

function deleteGeneratedTweet(tweet) {
  return knex('generatedtweets')
    .where({ tweet_id_str: tweet.id_str })
    .del();
}

function deleteScheduledTweet(schedule_id) {
  return knex('scheduledtweets')
    .where({ schedule_id: schedule_id })
    .del()
    .then(console.log)
    .catch(console.log);
}

function modifyTweetStatus(bot_tweet_id, status) {
  return knex('generatedtweets')
    .where({ bot_tweet_id: bot_tweet_id })
    .update({
      tweet_status: status,
      updated_at: new Date(),
    }, 'tweet_status');
}

function modifyTweetText(bot_tweet_id, bot_tweet_body) {
  return knex('generatedtweets')
    .where({ bot_tweet_id: bot_tweet_id })
    .update({
      bot_tweet_body: bot_tweet_body,
      updated_at: new Date(),
    }, 'bot_tweet_id');
}

function scheduleTweet(bot_tweet_id, scheduleTime) {
  return knex('generatedtweets')
    .where({ bot_tweet_id: bot_tweet_id })
    .select('tweet_status')
    .then((results) => {
      if (results[0].tweet_status === 'available') {
        return knex('scheduledtweets')
        .insert({
          scheduled_time: scheduleTime,
          bot_tweet_id: bot_tweet_id,
        }, 'schedule_id');
      }
      return knex('scheduledtweets')
      .where({ bot_tweet_id: bot_tweet_id })
      .update({
        scheduled_time: scheduleTime,
      }, 'schedule_id');
    })
    .then(() =>
      knex('generatedtweets')
      .where({ bot_tweet_id: bot_tweet_id })
      .update({
        tweet_status: 'scheduled',
        updated_at: new Date(),
      }, 'tweet_status')
    )
    .catch(console.log);
}

function deleteGeneratedTweets() {
  const currentDate = moment();
  return knex.select('created_at', 'bot_tweet_id')
  .from('generatedtweets')
  .then(function(dates) {
    console.log('dates ------->', dates);
    dates.forEach(function(date) {
      if (moment(date.created_at).add(24, 'hours').isBefore(currentDate)) {
        //delete tweets from database that are more than 24 hours old
        knex.table('generatedtweets')
        .where({'bot_tweet_id': date.bot_tweet_id })
        .del();
      }
    return dates;
    });
  });
};

// UNFINISHED -------> MOVE TO SERVICE
function findReadyTweets() {
  console.log('ready tweets')
  var nextFifteen = moment().add('15', 'minutes').format('X');
  var fifteenAgo = moment().subtract('15', 'minutes').format('X');//unix timestamp
  // console.log(moment.unix(fifteen).calendar());
  return knex('scheduledtweets')
  .whereBetween('scheduled_time', [fifteenAgo, nextFifteen])
  .innerJoin('generatedtweets', 'scheduledtweets.schedule_id', 'generatedtweets.schedule_id')
  .select(
    'scheduledtweets.schedule_id',
    'generatedtweets.bot_tweet_id',
    'generatedtweets.user_twitter_id'
  )
  .then(result => {console.log('ready result', result); return result;})
  .catch(console.log);
}

function joinTweetAndUserByTweetId(id) {
  return knex('generatedtweets')
    .join('users', 'users.user_twitter_id', '=', 'generatedtweets.user_twitter_id')
    .where({ bot_tweet_id: id })
    .select('users.token', 'users.tokenSecret', 'generatedtweets.bot_tweet_body')
    .then(response => response[0])
    .catch(console.log);
}

module.exports = {
  joinTweetAndUserByTweetId,
  getGeneratedTweets,
  saveGeneratedTweets,
  getScheduledTweets,
  deleteScheduledTweet,
  deleteGeneratedTweet,
  getPostedTweets,
  savePostedTweet,
  modifyTweetStatus,
  modifyTweetText,
  scheduleTweet,
  findReadyTweets,
};
