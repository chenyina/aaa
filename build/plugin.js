"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const js_cookie_1 = __importDefault(require("js-cookie"));
const defaultOptions = { path: '/' };
class Cookies {
    constructor(ctx) {
        this.converter = {
            read: function (value) {
                return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
            },
            write(value) {
                return encodeURIComponent(String(value)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
            },
        };
        this.ctx = ctx;
    }
    _get(key, json = false) {
        let jar = {};
        let cookies = this.ctx.req.headers.cookie ? this.ctx.req.headers.cookie.split('; ') : [];
        for (let i = 0; i < cookies.length; i++) {
            let parts = cookies[i].split('=');
            let cookie = parts.slice(1).join('=');
            if (!json && cookie[0] === '"') {
                cookie = cookie.slice(1, -1);
            }
            try {
                let foundKey = this.converter.read(parts[0]);
                cookie = this.converter.read(cookie);
                if (json) {
                    try {
                        cookie = JSON.parse(cookie);
                    }
                    catch (e) {
                    }
                }
                jar[foundKey] = cookie;
                if (key === foundKey) {
                    break;
                }
            }
            catch (e) {
            }
        }
        return key ? jar[key] : jar;
    }
    set(key, value, options) {
        options = Object.assign(defaultOptions, options);
        if (typeof options.expires === 'number') {
            options.expires = new Date(Date.now() + options.expires * 864e5);
        }
        if (options.expires) {
            options.expires = options.expires.toUTCString();
        }
        try {
            let result = JSON.stringify(value);
            if (/^[\{\[]/.test(result)) {
                value = result;
            }
        }
        catch (e) {
        }
        key = encodeURIComponent(String(key))
            .replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
            .replace(/[\(\)]/g, escape);
        value = this.converter.write(value);
        let attributes = '';
        for (let attributeName in options) {
            if (!options[attributeName]) {
                continue;
            }
            attributes += '; ' + attributeName;
            if (options[attributeName] === true) {
                continue;
            }
            attributes += '=' + options[attributeName].split(';')[0];
        }
        this.ctx.res.setHeader('set-cookie', key + '=' + value + attributes);
    }
    get(key) {
        return this._get(key, false);
    }
    getJSON(key) {
        return this._get(key, true);
    }
    remove(key, options = {}) {
        this.set(key, '', Object.assign(options, { expires: -1 }));
    }
}
function default_1(ctx, inject) {
    const _cookies = new Cookies(ctx);
    const cookies = {
        set(key, value, options) {
            if (process.server) {
                _cookies.set(key, value, options);
            }
            else if (process.client) {
                return js_cookie_1.default.set(key, value, options);
            }
        },
        get(key) {
            if (process.server) {
                return _cookies.get(key);
            }
            else if (process.client) {
                return js_cookie_1.default.get(key);
            }
        },
        getJSON(key) {
            if (process.server) {
                return _cookies.getJSON(key);
            }
            else if (process.client) {
                return js_cookie_1.default.getJSON(key);
            }
        },
        remove(key, options) {
            if (process.server) {
                return _cookies.remove(key, options);
            }
            else if (process.client) {
                return js_cookie_1.default.remove(key, options);
            }
        },
    };
    ctx.$cookies = cookies;
    inject('cookies', cookies);
}
exports.default = default_1;
