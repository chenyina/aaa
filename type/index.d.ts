import { CookieAttributes } from 'js-cookie';

declare type Cookies = {
    set(key: string, value: string, options?: CookieAttributes): string | undefined | void;
    get(key?: string): string | Record<string, any> | undefined;
    getJSON(key?: string): Record<string, any> | undefined;
    remove(key: string, options?: CookieAttributes): void
}

declare module 'vue/types/vue' {
    interface Vue {
        $cookies: Cookies;
    }
}

declare module '@nuxt/types' {
    interface Context {
        $cookies: Cookies;
    }

    interface NuxtAppOptions {
        $cookies: Cookies;
    }
}

declare module 'vuex/types/index' {
    interface Store<S> {
        $cookies: Cookies;
    }
}
