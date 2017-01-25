// constants
const ASE_SIGNATURE = 0x41534546;
const ASE_VERSION_MAJOR = 1;
const ASE_VERSION_MINOR = 0;
const ASE_BLOCK_TYPE_COLOR = 0x1;
const ASE_BLOCK_TYPE_GROUP_START = 0xC001;
const ASE_BLOCK_TYPE_GROUP_END = 0xC002;
const ASE_COLOR_TYPES = ['global', 'spot', 'normal'];

// get an object from an ase buffer
module.exports = (buffer) => {
	assert(Buffer.isBuffer(buffer), 'The argument is not an instance of Buffer', TypeError);
	assert(buffer.readUInt32BE(0) === ASE_SIGNATURE, 'Invalid file signature: ASEF header expected');
	assert(buffer.readUInt16BE(4) === ASE_VERSION_MAJOR, 'Only version 1.0 of the ASE format is supported');
	assert(buffer.readUInt16BE(6) === ASE_VERSION_MINOR, 'Only version 1.0 of the ASE format is supported');

	return readBlocks(buffer, 12).reduce(reduceGroups, []);
};

// reads blocks from a buffer
const readBlocks = (buffer, offset) => {
	const result = [];

	let length = buffer.readUInt32BE(8);
	let readOffset = offset;

	while (length--) {
		readOffset += readBlock(buffer, readOffset, result);
	}

	return result;
};

// reads a block from a buffer
const readBlock = (buffer, offset, result) => {
	const type = buffer.readUInt16BE(offset);

	switch (type) {
		case ASE_BLOCK_TYPE_COLOR:
			result.push(readColorEntry(buffer, offset + 6));

			break;
		case ASE_BLOCK_TYPE_GROUP_START:
			result.push(readGroupStart(buffer, offset + 6));

			break;
		case ASE_BLOCK_TYPE_GROUP_END:
			result.push({
				type: 'group-end'
			});

			break;
		default:
			throw new Error('Unsupported type ' + type.toString(16) + ' at offset ' + offset);
	}

	return 6 + buffer.readUInt32BE(offset + 2);
};

// reads a group start from a buffer
const readGroupStart = (buffer, offset) => {
	const nameLength = buffer.readUInt16BE(offset);

	return {
		type: 'group-start',
		name: bufferToUTF16(buffer, offset + 2, nameLength).trim()
	};
};

// reads a color entry from a buffer
const readColorEntry = (buffer, offset) => {
	var nameLength = buffer.readUInt16BE(offset);

	return {
		type: 'color',
		name: bufferToUTF16(buffer, offset + 2, nameLength).trim(),
		color: readColor(buffer, offset + 2 + nameLength * 2)
	};
};

// reads a color from a buffer
const readColor = (buffer, offset) => {
	const model = buffer.toString('utf8', offset, offset + 4).trim();

	switch (model) {
		case 'RGB':
			return {
				model: model,
				r: Math.round(buffer.readFloatBE(offset + 4) * 255),
				g: Math.round(buffer.readFloatBE(offset + 8) * 255),
				b: Math.round(buffer.readFloatBE(offset + 12) * 255),
				type: ASE_COLOR_TYPES[buffer.readUInt16BE(offset + 16)]
			};
		case 'CMYK':
			return {
				model: model,
				c: Math.round(buffer.readFloatBE(offset + 4) * 100),
				m: Math.round(buffer.readFloatBE(offset + 8) * 100),
				y: Math.round(buffer.readFloatBE(offset + 12) * 100),
				k: Math.round(buffer.readFloatBE(offset + 16) * 100),
				type: ASE_COLOR_TYPES[buffer.readUInt16BE(offset + 20)]
			};
		case 'Gray':
			return {
				model: model,
				gray: buffer.readFloatBE(offset + 4),
				type: ASE_COLOR_TYPES[buffer.readUInt16BE(offset + 8)]
			};
		case 'LAB':
			return {
				model: model,
				lightness: buffer.readFloatBE(offset + 4),
				a: buffer.readFloatBE(offset + 8),
				b: buffer.readFloatBE(offset + 12),
				type: ASE_COLOR_TYPES[buffer.readUInt16BE(offset + 16)]
			};
		default:
			throw new Error('Unsupported color model: ' + model + ' at offset ' + offset);
	}
};

// converts a buffer to utf-16
const bufferToUTF16 = (buffer, position, nameLength) => {
	let name = '';
	let index = 0;

	while (index < nameLength - 1) {
		name += String.fromCharCode(
			buffer.readUInt16BE(position + index * 2)
		);

		index += 1;
	}

	return name;
};

// asserts a condition or throws an error
const assert = (condition, message, ErrorType = Error) => {
	if (!condition) {
		throw new ErrorType(message);
	}
};

// reduces groups into object keys
const reduceGroups = (accumulated, item) => {
	const last = accumulated[accumulated.length - 1];

	if (last && last.type === 'group-start') {
		if (item.type === 'group-end') {
			last.type = 'group';
		} else {
			if (item.color.model === 'RGB') {
				item.color.hex = rgbToHex(item.color);
			} else if (item.color.model === 'CMYK') {
				item.color.hex = cmykToHex(item.color);
			}

			last.entries.push(item);
		}
	} else if (item.type === 'group-start') {
		item.entries = [];

		accumulated.push(item);
	} else {
		accumulated.push(item);
	}

	return accumulated;
};

// converts rgb to hex
const rgbToHex = ({ r, g, b }) => {
	return `#${ ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1) }`;
};

// converts cmyk to hex (without a color profile)
const cmykToHex = ({ c, m, y, k }) => {
	return rgbToHex({
		r: Math.round(255 * (1 - c / 100) * (1 - k / 100)),
		g: Math.round(255 * (1 - m / 100) * (1 - k / 100)),
		b: Math.round(255 * (1 - y / 100) * (1 - k / 100))
	});
};
