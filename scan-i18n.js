"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var fast_glob_1 = require("fast-glob");
var fs_1 = require("fs");
var path_1 = require("path");
var chalk_1 = require("chalk");
// Collect all .vue files
var vueFiles = fast_glob_1.default.sync(['src/**/*.vue']);
var i18nKeys = new Set();
// Extract translation keys from Vue template blocks
function extractKeysFromTemplate(template) {
    var regex = /\{\{\s*(?:\$t|t)\(\s*['"`]([^'"`]+)['"`]\s*\)\s*\}\}/g;
    var match;
    while ((match = regex.exec(template)) !== null) {
        i18nKeys.add(match[1]);
    }
}
// Scan each .vue file
for (var _i = 0, vueFiles_1 = vueFiles; _i < vueFiles_1.length; _i++) {
    var file = vueFiles_1[_i];
    var content = fs_1.default.readFileSync(file, 'utf-8');
    var templateMatch = content.match(/<template[^>]*>([\s\S]*?)<\/template>/);
    if (templateMatch) {
        extractKeysFromTemplate(templateMatch[1]);
    }
}
// Load locale files and compare
var locales = ['en', 'kk', 'ru'];
var localeDir = path_1.default.resolve('src/i18n');
var missingByLocale = {};
var _loop_1 = function (locale) {
    var filePath = path_1.default.join(localeDir, "".concat(locale, ".json"));
    if (!fs_1.default.existsSync(filePath)) {
        console.warn(chalk_1.default.red("\u26A0\uFE0F Missing locale file: ".concat(filePath)));
        return "continue";
    }
    var localeData = JSON.parse(fs_1.default.readFileSync(filePath, 'utf-8'));
    var existingKeys = new Set(Object.keys(localeData));
    var missing = __spreadArray([], i18nKeys, true).filter(function (key) { return !existingKeys.has(key); });
    missingByLocale[locale] = missing;
};
for (var _a = 0, locales_1 = locales; _a < locales_1.length; _a++) {
    var locale = locales_1[_a];
    _loop_1(locale);
}
// Output results
console.log(chalk_1.default.yellow("\uD83D\uDD0D Found ".concat(i18nKeys.size, " translation keys in .vue templates.")));
for (var _b = 0, locales_2 = locales; _b < locales_2.length; _b++) {
    var localeItem = locales_2[_b];
    var missing = missingByLocale[localeItem];
    if (!missing)
        continue;
    console.log(chalk_1.default.blue("\n\uD83C\uDF10 Missing in ".concat(locale, ".json (").concat(missing.length, "):")));
    missing.forEach(function (key) { return console.log("  - ".concat(key)); });
}
