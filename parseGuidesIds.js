const {userExists} = require('./helpers');
const fs = require('fs');
const {toJSON} = require('./utils');
const memberData = require('./member_data.json');
const guides = require('./member_guides.json');

function parseGuidesIds() {
	function generateGuidesId(guides, data) {
		return Object.keys(guides).reduce((prev, el) => {
			const user = userExists(el, data);
			prev[user.id] = guides[el].map((name) => userExists(name, data).id);
			return prev;
		}, {});
	}

	fs.writeFileSync('guides.json', toJSON(generateGuidesId(guides, memberData)));
}

parseGuidesIds();

module.exports = parseGuidesIds;
