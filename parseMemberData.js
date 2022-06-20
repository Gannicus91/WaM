const fs = require('fs');

const data = String(fs.readFileSync('members.txt'));

const formattedData = data.split('\n').reduce((prev, el, idx) => {
	if (!el) {
		return prev;
	}

	prev.push({
		id: idx + 1,
		name: el,
		nameComponents: el.split(/\s+/gm).reduce((prev, el) => {
			if (!el) {
				return prev;
			}

			prev.push(el.toLowerCase());

			return prev;
		}, [])
	})

	return prev;
}, []);

const jsonData = JSON.stringify(formattedData, (k, v) => {
	if (v instanceof Set) {
		return [...v];
	}

	return v;
}, 2);

fs.writeFileSync('member_data.json', jsonData);
