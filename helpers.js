const memberData = require('./data.json');
const guides = require('./guides.json');

/**
 * Существует ли юзер с таким именем
 *
 * @param {String} name
 * @param {Object} data
 */
function userExists(name, data) {
	const users = data.filter(({nameComponents}) => {
		const formatName = name.split(/\s+/gm).reduce((prev, el) => {
			if (!el) {
				return prev;
			}

			prev.push(el.toLowerCase());

			return prev;
		}, [])

		return formatName.every((el) => ~nameComponents.indexOf(el));
	})

	if (users.length === 1) {
		return users.pop();
	} else if(users.length > 1) {
		throw new Error('Найдено несколько участников. Уточните запрос');
	} else {
		throw new Error('Участник не найден');
	}
}

/**
 * Получить юзера по имени
 *
 * @param {String} name
 * @returns {Object}
 */
function getUserByName(name) {
	try {
		return userExists(name, memberData);
	} catch (error) {
		throw error;
	}
}

/**
 * Получить юзера по id
 *
 * @param {Number} user_id
 * @returns {Object}
 */
function getUserById(user_id) {
	const user = memberData.find(({id}) => id === user_id)

	if (!user) {
		throw new Error('Участник не найден')
	}

	return user;
}

module.exports = {
	GUIDES: guides,
	userExists,
	getUserByName,
	getUserById
}
