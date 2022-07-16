const memberData = require('./member_data.json');
const _ = require('lodash');
const fs = require('fs');
const {toJSON} = require('./utils');

function getOtherNames(data) {
	return data.reduce((prev, {name: name1, isNewbee}) => {
		const name = `${name1} ${isNewbee}`;
		if (isNewbee) {
			prev.push(name, name, name, name, name, name);
		} else {
			prev.push(name);
		}

		return prev;
	}, []);
}

function parseGuides() {
	const guides = memberData.reduce((prev, el, idx, arr) => {
		const other = [...arr];
		other.splice(idx, 1);
		let otherNames = getOtherNames(other);

		prev[el.name] = [];

		while (prev[el.name].length != other.length) {
			const name = _.sample(otherNames);
			prev[el.name].push(name);
			otherNames = otherNames.filter(el => el !== name);
		}

		if (prev[el.name].length !== new Set(prev[el.name]).size) {
			throw new Error('not compatible');
		}

		return prev;
	}, {});

	fs.writeFileSync('member_guides.json', toJSON(guides));
}

parseGuides();

module.exports = parseGuides;
