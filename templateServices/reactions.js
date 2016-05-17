const emoji = require('./helpers/').emoji;
const _ = require('lodash');

function randomValue(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getIndexCache(keyword) {
  return emoji.indexCache[keyword];
}

const getEmoji = _.flow(getIndexCache, randomValue, (i) => emoji.list[i])

function getUnicodeFromEmoji(emoji) {
  return emoji.data.unicode;
}

function formatUnicodeForHTML(unicode) {
  return `&#x${unicode};`;
}

const getEmojiUnicode = _.flow(getEmoji, getUnicodeFromEmoji, formatUnicodeForHTML);

module.exports = getEmojiUnicode;