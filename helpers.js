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

		return formatName.every((el) => nameComponents.has(el))
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
 * Сравнение множестве (Set)
 *
 * @param {Set} as
 * @param {Set} bs
 * @returns {boolean}
 */
function eqSet(as, bs) {
	if (as.size !== bs.size) return false;
	for (const a of as) if (!bs.has(a)) return false;
	return true;
}

module.exports = {
	eqSet,
	userExists,
}
