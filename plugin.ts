import _Cookies, { CookieAttributes } from 'js-cookie';
import { Context } from '@nuxt/types';
import { Inject } from '@nuxt/types/app';

const defaultOptions = { path: '/' };

class Cookies {
    private readonly ctx: Context;

    constructor(ctx: Context) {
        this.ctx = ctx;
    }

    private converter = {
        read: function (value: string): string {
            return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
        },
        write<T extends object>(value: string | T): string {
            return encodeURIComponent(String(value)).replace(
                /%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,
                decodeURIComponent);
        },
    };

    private _get(key?: string, json: boolean = false): string | Record<string, any> | undefined {
        let jar: Record<string, any> = {};

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
                    } catch (e) {
                    }
                }

                jar[foundKey] = cookie;

                if (key === foundKey) {
                    break;
                }
            } catch (e) {
            }
        }

        return key ? jar[key] : jar;
    }

    public set(key: string, value: string, options?: CookieAttributes): void {

        options = Object.assign(defaultOptions, options);

        if (typeof options.expires === 'number') {
            options.expires = new Date(Date.now() + options.expires * 864e5);
        }
        if (options.expires) {
            options.expires = options.expires.toUTCString() as any;
        }

        try {
            let result = JSON.stringify(value);
            if (/^[\{\[]/.test(result)) {
                value = result;
            }
        } catch (e) {
        }

        key = encodeURIComponent(String(key))
            .replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
            .replace(/[\(\)]/g, escape);

        value = this.converter.write(value);

        let attributes: string = '';
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

    public get(key?: string): string | Record<string, any> | undefined {
        return this._get(key, false);
    }

    public getJSON(key?: string): Record<string, any> | undefined {
        return this._get(key, true) as Record<string, any> | undefined;
    }

    public remove(key: string, options: CookieAttributes = {}): void {
        this.set(key, '', Object.assign(options, { expires: -1 }));
    }
}

export default function (ctx: Context, inject: Inject) {
    const _cookies = new Cookies(ctx);
    const cookies = {
        set(key: string, value: string, options?: CookieAttributes): string | undefined | void {
            if (process.server) {
                _cookies.set(key, value, options);
            } else if (process.client) {
                return _Cookies.set(key, value, options);
            }
        },

        get(key?: string): string | Record<string, any> | undefined {
            if (process.server) {
                return _cookies.get(key);
            } else if (process.client) {
                return _Cookies.get(key as any);
            }
        },

        getJSON(key: string): Record<string, any> | undefined {
            if (process.server) {
                return _cookies.getJSON(key);
            } else if (process.client) {
                return _Cookies.getJSON(key as any);
            }
        },

        remove(key: string, options?: CookieAttributes): void {
            if (process.server) {
                return _cookies.remove(key, options);
            } else if (process.client) {
                return _Cookies.remove(key, options);
            }
        },
    };

    (ctx as any).$cookies = cookies;
    inject('cookies', cookies);
}
