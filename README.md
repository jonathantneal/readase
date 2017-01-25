# readASE [<img src="https://upload.wikimedia.org/wikipedia/commons/c/c5/Colorwheel.svg" alt="Colorwheel" width="90" height="90" align="right">][readASE]

[![NPM Version][npm-img]][npm-url]
[![Build Status][cli-img]][cli-url]
[![Licensing][lic-image]][lic-url]
[![Changelog][log-image]][log-url]
[![Gitter Chat][git-image]][git-url]

[readASE] lets you read Adobe Swatch (ASE) files as JavaScript objects.

```bash
npm install readase --save-dev
```

```js
const fs      = require('fs');
const readASE = require('readase');

fs.readFile(
	'my-brand.ase',
	(error, buffer) => {
		if (!error) {
			console.log(
				readASE(buffer)
			); // { type: "group", name: "My Brand", entries: [ ...colors] }
		}
	}
);
```

[npm-url]: https://www.npmjs.com/package/readase
[npm-img]: https://img.shields.io/npm/v/readase.svg
[cli-url]: https://travis-ci.org/jonathantneal/readase
[cli-img]: https://img.shields.io/travis/jonathantneal/readase.svg
[lic-url]: LICENSE.md
[lic-image]: https://img.shields.io/npm/l/readase.svg
[log-url]: CHANGELOG.md
[log-image]: https://img.shields.io/badge/changelog-md-blue.svg
[git-url]: https://gitter.im/postcss/postcss
[git-image]: https://img.shields.io/badge/chat-gitter-blue.svg

[readASE]: https://github.com/jonathantneal/readase
