const fs = require('fs')
const {userExists} = require('./helpers')

const userData = JSON.parse(String(fs.readFileSync('member_data.json'))).map(el => ({
	...el,
	nameComponents: new Set(el.nameComponents),
}))

console.log(userExists('дживанян Максим', userData));
