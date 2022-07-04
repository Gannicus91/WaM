const fs = require('fs');
const _ = require('lodash');
const { userExists } = require('./helpers');
const { toJSON } = require('./utils');

const data = String(fs.readFileSync('data.csv'));

const formattedData = data.split('\r\n').reduce((prev, el, idx) => {
	if (!el || idx === 0) {
		return prev;
	}

	const [name, secret, dateOfBirth, city, image] = el.split(',');

	prev.push({
		id: idx,
		name: name.trim(),
		image: image || null,
		dateOfBirth,
		city,
		secret_code: secret,
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

const guides = formattedData.reduce((prev, el, idx, arr) => {
	const other = [...arr];
	other.splice(idx, 1);
	prev[el.name] = _.shuffle(other.map((el) => el.name));

	return prev;
}, {});

function generateGuidesId(guides) {
	return Object.keys(guides).reduce((prev, el) => {
		const user = userExists(el, formattedData);
		prev[user.id] = guides[el].map((name) => userExists(name, formattedData).id);
		return prev;
	}, {});
}

fs.writeFileSync('member_data.json', toJSON(formattedData));
fs.writeFileSync('member_guides.json', toJSON(guides));
fs.writeFileSync('guides.json', toJSON(generateGuidesId(guides)));
