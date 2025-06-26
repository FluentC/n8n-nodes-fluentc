const { src, dest, parallel } = require('gulp');

function copyIcons() {
    return src('icons/logo192.png')
        .pipe(dest('dist/nodes/FluentCTranslate/'))
        .pipe(dest('dist/nodes/FluentCLanguages/'))
        .pipe(dest('dist/nodes/FluentCCheckLanguage/'));
}

const build = parallel(copyIcons);
exports['build:icons'] = copyIcons;
exports.default = build;