import { Cookies } from '.';

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
