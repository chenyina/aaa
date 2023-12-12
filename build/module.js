"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require('path');
function cookieModule() {
    // @ts-ignore
    this.addPlugin(path.resolve(__dirname, 'plugin.js'));
}
exports.default = cookieModule;
module.exports.meta = require('./package.json');
