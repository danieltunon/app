const path = require('path');
// const client = require('./db/redisClient.js');
const User = require('./db/controllers/userController.js');
// temp will be removed when services are up
const getTweetsFromFeed = require('../templateServices/myFeed');
const Tweets = require('./db/controllers/tweetsController');
const twit = require('../templateServices/helpers').twit;
const Templates = require('./db/controllers/templatesController');
require('isomorphic-fetch');

const ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
  // Return error content: res.jsonp(...) or redirect: res.redirect('/login')
};

module.exports = function(app, passport) {

  // Redirect the user to Twitter for authentication.  When complete, Twitter
  // will redirect the user back to the application at
  //   /auth/callback
  app.get('/auth', passport.authenticate('twitter'));

  // Twitter will redirect the user to this URL after approval.  Finish the
  // authentication process by attempting to obtain an access token.  If
  // access was granted, the user will be logged in.  Otherwise,
  // authentication has failed.
  app.get('/auth/callback',
    passport.authenticate('twitter', {
      failureRedirect: '/',
      successRedirect: '/dashboard'
    })
  );

  app.get('/logout', function(req, res) {
    req.logout();
    res.clearCookie('test');
    res.redirect('/');
  });

  app.get('/authenticate', ensureAuthenticated, function(req, res) {
    res.status(200).json({ authID: req.user.id });
  });

// call when dashboard is loaded -> retrieves data from database
  app.get('/tweets/generated', ensureAuthenticated, function (req, res) {
    Tweets.getGeneratedTweets(req.user.id, req.query.page)
    .then(results => res.status(200).json(results))
    .catch(err => res.status(500).send(err));
  });

  app.get('/tweets/scheduled', function (req, res) {
    Tweets.getScheduledTweets(req.user.id)
    .then(results => res.status(200).json(results))
    .catch(err => res.status(500).send(err))
  });

  app.get('/tweets/posted', ensureAuthenticated, function (req, res) {
    Tweets.getPostedTweets(req.user.id)
    .then(results => res.status(200).json(results))
    .catch(err => res.status(500).send(err));
  });

  app.put('/tweets/:id', ensureAuthenticated, function (req, res) {
    console.log('req-body-text ---------->', req.params.id, '------>', req.body);
    Tweets.modifyTweetText(req.params.id, req.body.text)
    .then((status) => res.status(201).send(status))
    .catch(err => res.status(500).send(err));
  });

  app.post('/tweets/:id', function (req, res) {
    Tweets.joinTweetAndUserByTweetId(req.params.id)
    .then(response => twit.post(
      response.bot_tweet_body,
      response.token, response.tokenSecret))
    .then(data => Tweets.savePostedTweet(data))
    // using bot_tweet_id to modify generatedtweets table to show as 'posted'
    .then(id => Tweets.modifyTweetStatus(req.params.id, 'posted'))
    .then(status => res.status(201).send(status))
    .catch(err => res.status(500).send(err));
  });

  // create route for scheduling
  app.post('/tweets/schedule/:id', ensureAuthenticated, function(req, res) {
    console.log(req.body, req.params.id);
    Tweets.scheduleTweet(req.params.id, req.body.schedule)
    .then(reply => res.status(201).send(reply))
    .catch(err => res.status(500).send(err));
  });
  // trash tweet on client side does not delete from generated tables.
  // set up worker to clear out database periodically

  app.delete('/tweets/:id', ensureAuthenticated, function(req, res) {
    Tweets.modifyTweetStatus(req.params.id, 'trashed')
    .then(status => res.status(201).send(status))
    .catch(err => res.status(500).send(err));
  });

  app.post('/templates', ensureAuthenticated, function(req, res) {
    console.log('POSTED TO /TEMPLATES', req.body);
    console.log('USER ID IS', req.user.id);
    Templates.saveTemplate(req.body, req.user.id)
      .then(id => { res.status(201).send('you posted it'); return id; })
      .then(id => fetch(`http://127.0.0.1:8558/generate/users/${req.user.id}/templates/${id}`,
        {
          method: 'POST',
          credentials: 'same-origin'
        }))
      .catch((err) => res.status(400).send(`you dint post it: ${err}`));
  });

  app.put('/templates/:id', ensureAuthenticated, function(req, res) {
    console.log('PUTTED TO /TEMPLATES/:id', req.params.id);
    Templates.updateTemplate(req.params.id, req.body)
      .then(t => res.status(201).json(t))
      .then(() => fetch(`http://127.0.0.1:8558/generate/users/${req.user.id}/templates/${req.params.id}`,
        {
          method: 'POST',
          credentials: 'same-origin'
        }))
      .catch(err => res.status(400).send(`you dint put it ${err}`));
  });

  app.get('/templates/:id', ensureAuthenticated, function(req, res) {
    console.log('GETTED TO /TEMPLATES/:id', req.params.id);
    Templates.getTemplate(req.params.id)
      .then(t => { console.log(t); return res.status(200).json(t) })
      .catch((err) => res.status(400).send(`you dint got it: ${err}`));
  });

  app.delete('/templates/:id', ensureAuthenticated, function(req, res) {
    console.log('DELETED AT /TEMPLATES/:id', req.params.id);
    Templates.deleteTemplate(req.params.id, req.user.id)
      .then(t => res.status(201).send('you deleted it'))
      .catch((err) => res.status(400).send(`you dint delete it: ${err}`));
  });

  app.get('/templates', ensureAuthenticated, function(req, res) {
    console.log('GETTED TO /TEMPLATES');
    // console.log(req.user.id);
    Templates.getTemplateNames(req.user.id)
    // Templates.getTemplateNames('727615201575469056')
      .then(t => res.status(200).json(t))
      .catch(err => res.status(400).send(`you failed to get names: ${err}`));
  });

  ///testing the database deletion worker
  //REMOVE WHEN WORKER IS SET UP
  app.get('/testsdeletedb', function(req, res) {
    Tweets.deleteGeneratedTweets()
    .then(response => res.status(201).send(response))
    .catch(err => res.status(500).send(err))
  });

  app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/../build/bundle.html'));
  });
  app.get('/*', ensureAuthenticated, function(req, res) {
    res.sendFile(path.join(__dirname, '/../build/bundle.html'));
  });
};
