const fs = require('fs');
const { toJSON } = require('./utils');

function parseMembers() {
	const data = String(fs.readFileSync('data.csv'));

	const formattedData = data.split('\n').reduce((prev, el, idx) => {
		if (!el || idx === 0) {
			return prev;
		}

		const [name, secret, dateOfBirth, city, isNewbee, image] = el.split(',');

		prev.push({
			id: idx,
			name: name.trim(),
			image: image.trim(),
			dateOfBirth: dateOfBirth.trim(),
			city: city.trim(),
			secret_code: secret.trim(),
			isNewbee: isNewbee.trim().toLowerCase() === 'да',
			nameComponents: name.split(/\s+/gm).reduce((prev, el) => {
				if (!el) {
					return prev;
				}

				prev.push(el.toLowerCase());

				return prev;
			}, []),
		});

		return prev;
	}, []);

	fs.writeFileSync('member_data.json', toJSON(formattedData));
}

parseMembers();

module.exports = parseMembers;
