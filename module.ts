const path = require('path');

export default function cookieModule() {
    // @ts-ignore
    (this as unknown as any).addPlugin(path.resolve(__dirname, 'plugin.js'));
}

module.exports.meta = require('./package.json');
