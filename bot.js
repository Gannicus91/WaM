if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}
const { Telegraf } = require('telegraf');
const LocalSession = require('telegraf-session-local');
const _ = require('lodash');
const GUIDES = require('./guides.json');
const config = require('./config');
const replyText = require('./replyText');
const { getFriendDataByName } = require('./helpers');
const { getUserById, getUserByName } = require('./db');
const questions = require('./questions.json');

// Создаем объект Telegraf.js
const bot = new Telegraf(config.token);

bot.use((new LocalSession({ database: 'user_data.json' })).middleware());

bot.command('remove', (ctx) => {
	ctx.replyWithMarkdown(`Removing session from database: \`${JSON.stringify(ctx.session)}\``);
	ctx.session = null;
});

bot.start((ctx) => {
	if (ctx.session.user) {
		return;
	}
	ctx.reply(replyText.hello);
});

bot.command('friends', async (ctx) => {
	if (!ctx.session.user) {
		return;
	}

	const
		friends = _.get(ctx, 'session.friends', []),
		current = _.get(ctx, 'session.current');

	let msgText = friends.map(({name}) => name).join('\n');

	if (current) {
		msgText += config.onlyPhoto ? '\nНекто' : `\n${current.name}`;
	}

	const msg = await ctx.reply(msgText);

	ctx.session.meta = {
		friendsMsgId: msg.message_id,
	};
});

bot.on('message', (ctx, next) => {
	const
		replyMessageId = _.get(ctx, 'message.reply_to_message.message_id');
	const friendId = _.get(ctx, `session.messageMap.${replyMessageId}`);

	if (friendId) {
		const
			pathToStorage = `session.friendsStorage.${friendId}`;
		const current = _.get(ctx, pathToStorage, []);

		_.set(ctx, pathToStorage, [...current, ctx.message.text]);

		return;
	}

	return next();
});

bot.on('message', (ctx, next) => {
	const
		replyMessageId = _.get(ctx, 'message.reply_to_message.message_id', '');
	const friendsMsgId = _.get(ctx, 'session.meta.friendsMsgId');
	const msgText = ctx.message.text.trim().toLowerCase();

	if (replyMessageId === friendsMsgId) {
		try {
			const user = msgText !== 'некто' ? getFriendDataByName(msgText, ctx) : ctx.session.current;
			ctx.reply(_.get(ctx, `session.friendsStorage.${user.id}`, []).join('\n___\n'));
		} catch (err) {
			ctx.reply(err.message);
		}

		return;
	}

	return next();
});

bot.on('text', async (ctx, next) => {
	try {
		if (ctx.session.tmp_user || ctx.session.user) {
			return next();
		}

		ctx.session.tmp_user = getUserByName(ctx.message.text);
		await ctx.reply(replyText.inputSecret);
	} catch (err) {
		ctx.reply(err.message);
	}
});

bot.on('text', async (ctx, next) => {
	const { user, tmp_user } = ctx.session;

	if (user || !tmp_user) {
		return next();
	}

	if (ctx.message.text === ctx.session.tmp_user.secret_code) {
		ctx.session.user = ctx.session.tmp_user;
		ctx.session.guide = GUIDES[ctx.session.user.id];
		ctx.session.score = 0;
		ctx.session.friends = [];
		ctx.session.friendsStorage = {};
		ctx.session.messageMap = {};
		await ctx.reply(`Привет, добро пожаловать в бот, ${ctx.session.user.name}! 
Сейчас тебе будут приходить фото участников нашего летника.
Твоя задача проста:
1) Найди его на турбазе и познакомься с ним
2) Узнай ответ на вопрос, предложенный ботом или выполни задание
3) Узнай его секретный код и отправь боту, чтобы получить следующее фото`);
		next();
	} else {
		await ctx.reply('Неверный код!');
		await ctx.reply('Введите имя снова');
	}
	ctx.session.tmp_user = null;
});

bot.on('text', async (ctx, next) => {
	const { user, current } = ctx.session;

	if (!user || !current) {
		return next();
	}

	const { text } = ctx.message;

	if (text.trim().toLowerCase() === current.secret_code.trim().toLowerCase()) {
		await ctx.reply('Круто!');
		ctx.session.friends && ctx.session.friends.push(ctx.session.current);
		ctx.session.current = null;
		ctx.session.score += 1;
		return next();
	}
	await ctx.reply('Неверно');
});

bot.on('text', async (ctx, next) => {
	const { user, guide } = ctx.session;

	if (!user || !guide.length) {
		return next();
	}

	const
		userId = guide.shift();
	const anotherUser = getUserById(userId);
	const message = `Твоя следующая цель: ${anotherUser.name}`;

	ctx.session.current = anotherUser;

	if (anotherUser.image) {
		const msg = await ctx.replyWithPhoto(
			{ url: anotherUser.image },
			{ caption: config.onlyPhoto ? 'Твоя следующая цель' : message },
		);
		ctx.session.messageMap[msg.message_id] = anotherUser.id;
	} else {
		await ctx.reply(message);
	}
	await ctx.reply(questions[~~(Math.random() * 20)]);
});

bot.on('text', async (ctx, next) => {
	const { user, guide, current } = ctx.session;

	if (!user || guide.length || current) {
		return next();
	}

	await ctx.reply(`Поздравляю🎉
Теперь ты знаешь всех в этом лагере😱`);
});

bot.launch();

console.log('===== BOT JOB HAS BEEN STARTED ======');

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
