const knex = require('../db.js');

function saveTemplate(template, userId) {
  return knex('templates')
    .insert({
      template: JSON.stringify(template.template),
      name: template.name,
      user_twitter_id: userId,
      active: true
    }, 'template_id')
    .then(result => result[0]);
}

function updateTemplate(templateId, template) {
  return knex('templates')
    .where({template_id: templateId})
    .update({
      template: JSON.stringify(template.template),
      name: template.name
      // in theory, would also have active here
    });
}

function deleteTemplate(templateId, userId) {
  return knex('templates')
    .where({template_id: templateId, user_twitter_id: userId})
    .del();
}

function getTemplate(templateId) {
  return knex('templates')
    .where({template_id: templateId})
    .select();
}

function getTemplateNames(userId) {
  return knex('templates')
    .where({user_twitter_id: userId})
    .select('template_id', 'name')
    .orderBy('name');
}

function getAllTemplates() {
  return knex('templates')
    .select('template_id', 'user_twitter_id');
}

module.exports = {
  saveTemplate,
  updateTemplate,
  deleteTemplate,
  getTemplate,
  getTemplateNames
};
