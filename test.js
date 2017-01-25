const fs      = require('fs');
const readASE = require('.');

fs.readFile(
	'test.ase',
	(error, buffer) => {
		if (!error) {
			console.log(
				readASE(buffer)
			); // { type: "group", name: "My Brand", entries: [ ...colors] }
		}
	}
);
