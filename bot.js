if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const { Telegraf } = require('telegraf')
const LocalSession = require('telegraf-session-local')
const config = require('./config')
const { isAdmin, forwardToAdmin } = require('./utils')
const replyText = require('./replyText')

let users = {} // username:uid

// Создаем объект Telegraf.js
let bot = new Telegraf(config.token);
bot.use((new LocalSession({ database: 'user_data.json' })).middleware())
bot.command('remove', (ctx) => {
    ctx.replyWithMarkdown(`Removing session from database: \`${JSON.stringify(ctx.session)}\``)
        // Setting session to null, undefined or empty object/array will trigger removing it from database
    ctx.session = null
})
bot.hears(/!.+/gm, async(ctx, next) => {
    let username = ctx.message.from.username;
    if (!users[username])
        users[username] = ctx.message.from.id;

    if (isAdmin(ctx.message.from.id)) {
        return next();
    }
    // перенаправляем админу
    await forwardToAdmin(ctx);
});
bot.on('message', async(ctx, next) => {
    // убеждаемся что это админ ответил на сообщение пользователя
    if (!ctx.message.reply_to_message) {
        return next();
    }

    // TODO как-то нужно проверить всё это дело, и если нет, проверить из ctx.message.reply_to_message.forward_from.id
    // или наоборот, сначала из ctx.message.reply_to_message.forward_from.id, а потом из users
    let uid = users[ctx.message.reply_to_message.forward_sender_name];
    if (!uid) {
        return next();
    }

    if (!isAdmin(ctx.message.from.id)) {
        return next();
    }
    // отправляем копию пользователю
    await ctx.telegram.sendCopy(uid, ctx.message);
    return next();
})
bot.start((ctx, next) => {
    if (isAdmin(ctx.message.from.id)) {
        ctx.reply(replyText.helloAdmin);
    } else {
        ctx.reply('hello');
    }
});
bot.launch()
console.log('===== BOT JOB HAS BEEN STARTED ======')

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
