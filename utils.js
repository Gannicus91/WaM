const config = require('./config');
const replyText = require('./replyText');

/**
 * Проверяем пользователя на права
 * @param userId {number}
 * @returns {boolean}
 */
const isAdmin = (userId) => String(userId) === String(config.admin);

/**
 *  Перенаправляем админу от пользователя или уведомляем админа об ошибке
 * @param ctx
 */
const forwardToAdmin = async (ctx) => {
  if (isAdmin(ctx.message.from.id)) {
    await ctx.reply(replyText.replyWrong);
  } else {
    await ctx.forwardMessage(config.admin, ctx.from.id, ctx.message.id);
  }
};

/**
 *
 * @param {Object} data
 * @return {string}
 */
const toJSON = (data) => JSON.stringify(data, (k, v) => {
  if (v instanceof Set) {
    return [...v];
  }

  return v;
}, 2);

module.exports = {
  isAdmin,
  forwardToAdmin,
  toJSON,
};
