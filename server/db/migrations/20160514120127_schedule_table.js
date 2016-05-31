
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('scheduledtweets', function(table) {
      table.increments('schedule_id').primary();
      table.string('scheduled_time');
      table.integer('bot_tweet_id').references('bot_tweet_id').inTable('generatedtweets');
      table.timestamps(true, true);
    }),
    knex.schema.createTable('templates', function(table) {
      table.increments('template_id').primary();
      table.jsonb('template');
      table.string('name');
      table.boolean('active');
      table.string('user_twitter_id').references('user_twitter_id').inTable('users');
      table.timestamps(true, true);
    })
  ]);
};

exports.down = function (knex, Promise) {
  return knex.dropTable('scheduledtweets')
  .dropTable('templates');
};
