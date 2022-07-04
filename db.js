const memberData = require('./member_data.json');
const {userExists} = require('./helpers')
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
	getUserById,
	getUserByName,
}
