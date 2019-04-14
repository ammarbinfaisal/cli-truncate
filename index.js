'use strict';
const sliceAnsi = require('slice-ansi');
const stringWidth = require('string-width');

module.exports = (text, columns, options) => {
	options = {
		position: 'end',
		preferTruncationOnSpace: false,
		...options
	};

	const {position, preferTruncationOnSpace} = options;
	const ellipsis = '…';

	if (typeof text !== 'string') {
		throw new TypeError(`Expected \`input\` to be a string, got ${typeof text}`);
	}

	if (typeof columns !== 'number') {
		throw new TypeError(`Expected \`columns\` to be a number, got ${typeof columns}`);
	}

	if (columns < 1) {
		return '';
	}

	if (columns === 1) {
		return ellipsis;
	}

	const length = stringWidth(text);

	if (length <= columns) {
		return text;
	}

	if (position === 'start') {
		if (preferTruncationOnSpace) {
			const nearestSpace = getIndexOfNearestSpace(text, length - columns + 1, true);
			return ellipsis + sliceAnsi(text, nearestSpace, length).trim();
		}

		return ellipsis + sliceAnsi(text, length - columns + 1, length);
	}

	if (position === 'middle') {
		const half = Math.floor(columns / 2);

		if (preferTruncationOnSpace) {
			const spaceNearFirstBreakPoint = getIndexOfNearestSpace(text, half);
			const spaceNearSecondBreakPoint = getIndexOfNearestSpace(text, length - (columns - half) + 1, true);
			return sliceAnsi(text, 0, spaceNearFirstBreakPoint) + ellipsis + sliceAnsi(text, spaceNearSecondBreakPoint, length).trim();
		}

		return sliceAnsi(text, 0, half) + ellipsis + sliceAnsi(text, length - (columns - half) + 1, length);
	}

	if (position === 'end') {
		if (preferTruncationOnSpace) {
			const nearestSpace = getIndexOfNearestSpace(text, columns - 1);
			return sliceAnsi(text, 0, nearestSpace) + ellipsis;
		}

		return sliceAnsi(text, 0, columns - 1) + ellipsis;
	}

	throw new Error(`Expected \`options.position\` to be either \`start\`, \`middle\` or \`end\`, got ${position}`);
};

function getIndexOfNearestSpace(string, index, shouldSearchRight) {
	if (string.charAt(index) === ' ') {
		return index;
	}

	for (let i = 1; i <= 3; i++) {
		if (shouldSearchRight) {
			if (string.charAt(index + i) === ' ') {
				return index + i;
			}
		} else if (string.charAt(index - i) === ' ') {
			return index - i;
		}
	}

	return index;
}
