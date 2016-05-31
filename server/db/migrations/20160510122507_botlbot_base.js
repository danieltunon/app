exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function(table) {
    table.string('user_twitter_id').primary();
    table.string('token');
    table.string('tokenSecret');
    table.string('username');
    table.string('profile_img')
    table.timestamps(true, true);
  }).createTable('postedtweets', function(table){
    table.increments('tweet_id').primary();
    table.string('user_twitter_id').references('user_twitter_id').inTable('users');
    table.string('tweet_text');
    table.string('original_tweet_id');
    table.string('original_tweet_props');
    table.integer('favorite_count');
    table.integer('retweet_count');
    table.string('retweet_id');
    table.timestamps(true, true);
  }).createTable('generatedtweets', function(table) {
    table.increments('bot_tweet_id').primary();
    table.string('user_twitter_id').references('user_twitter_id').inTable('users');
    table.string('tweet_status').defaultTo('available');
    table.integer('retweet_count');
    table.integer('favorite_count');
    table.string('user_screen_name');
    table.string('user_followers_count');
    table.string('tweet_text');
    table.string('tweet_id_str');
    table.string('bot_tweet_body');
    table.string('news_headline');
    table.string('template_id');
    table.timestamps(true, true);
  });
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('postedtweets'),
    knex.schema.dropTable('generatedtweets'),
    knex.schema.dropTable('users'),
  ]);
};
