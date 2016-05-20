const Template = require('../server/db/controllers/templatesController');
require('isomorphic-fetch');
const enqueue = require('./templateServices/templateQueue').enqueue;

Template.getAllTemplates()
.then(enqueue)
.catch(console.log);
