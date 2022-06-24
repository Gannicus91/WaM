if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const { Telegraf } = require('telegraf')
const LocalSession = require('telegraf-session-local')
const config = require('./config')
const { isAdmin } = require('./utils')
const replyText = require('./replyText')
const { getUserById, getUserByName, GUIDES } = require('./helpers');

// Создаем объект Telegraf.js
let bot = new Telegraf(config.token);

bot.use((new LocalSession({ database: 'user_data.json' })).middleware())

bot.command('remove', (ctx) => {
    ctx.replyWithMarkdown(`Removing session from database: \`${JSON.stringify(ctx.session)}\``)
        // Setting session to null, undefined or empty object/array will trigger removing it from database
    ctx.session = null
});

bot.start((ctx) => {
    if (isAdmin(ctx.message.from.id)) {
        ctx.reply(replyText.helloAdmin);
    } else {
        ctx.reply(replyText.hello);
    }
});

bot.on('message', async (ctx, next) => {
    try {
        if (ctx.session.tmp_user || ctx.session.user) {
            return next()
        }

        ctx.session.tmp_user = getUserByName(ctx.message.text);
        await ctx.reply(replyText.inputSecret);
    } catch (err) {
        ctx.reply(err.message);
    }
});

bot.on('message', async (ctx, next) => {
    const {user, tmp_user} = ctx.session;

    if (user || !tmp_user) {
        return next();
    }

    if (ctx.message.text === ctx.session.tmp_user.secret_code) {
        ctx.session.user = ctx.session.tmp_user;
        ctx.session.guide = GUIDES[ctx.session.user.id];
        ctx.session.score = 0;
        await ctx.reply(`Добро пожаловать, ${ctx.session.user.name}`);
        next();
    } else {
        await ctx.reply('Неверный код!');
        await ctx.reply('Введите имя снова');
    }
    ctx.session.tmp_user = null;
});

bot.on('message', async (ctx, next) => {
    const {user, current} = ctx.session;

    if (!user || !current) {
        return next();
    }

    const {text} = ctx.message;

    if (text === current.secret_code) {
        await ctx.reply('Круто!');
        ctx.session.current = null;
        ctx.session.score += 1;
        return next();
    } else {
        await ctx.reply('Неверно');
    }
});

bot.on('message', async (ctx, next) => {
    const {user, guide} = ctx.session;

    if (!user || !guide.length) {
        return next();
    }

    const
      userId = guide.shift(),
      anotherUser = getUserById(userId);

    ctx.session.current = anotherUser;
    await ctx.reply(`Твоя следующая цель: ${anotherUser.name}`);
});

bot.on('message', async (ctx, next) => {
    const {user, guide, current} = ctx.session;

    if (!user || guide.length || current) {
        return next();
    }

    await ctx.reply('Поздравляю');
});

bot.launch()

console.log('===== BOT JOB HAS BEEN STARTED ======')

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
