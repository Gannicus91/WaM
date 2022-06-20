const assert = require('assert');
const {userExists} = require('../helpers')

const { USER_DATA } = require('./fixtures');

describe('check user', () => {
	it('user exist', () => {
		assert.deepEqual(userExists('дживанян МАКСИМ', USER_DATA), {
			id: 4,
			name: 'Максим Арташесович Дживанян',
			nameComponents: new Set (['максим', 'арташесович', 'дживанян'])
		})
	});

	it('one word', () => {
		assert.deepEqual(userExists('язев', USER_DATA), {
			id: 1,
			name: 'Язев Илья Борисович',
			nameComponents: new Set (['язев', 'илья', 'борисович'])
		})
	});

	it('user dont exist', () => {
		assert.throws(() => userExists('вася пупкин', USER_DATA), Error, 'Участник не найден')
	});

	it('not enough data', () => {
		assert.throws(
			() => userExists('Дживанян', USER_DATA),
			Error,
			'Найдено несколько участников. Уточните запрос'
		)
	});
})
