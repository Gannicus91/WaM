const fs = require('fs');
const { toJSON } = require('./utils');

const data = String(fs.readFileSync('questions.txt'));

fs.writeFileSync('questions.json', toJSON(data.split('\n').filter(el => el)))
