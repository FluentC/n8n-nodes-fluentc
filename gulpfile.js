const { src, dest, parallel } = require('gulp');

function copyIcons() {
	return src('icons/logo192.png').pipe(dest('dist/nodes/FluentC/'));
}

function copyCodex() {
	return src('nodes/FluentC/FluentC.node.json').pipe(dest('dist/nodes/FluentC/'));
}

exports['build:icons'] = parallel(copyIcons, copyCodex);
exports.default = exports['build:icons'];
