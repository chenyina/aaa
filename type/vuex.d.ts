import { Cookies } from '.';


declare module 'vuex/types/index' {
    interface Store<S> {
        $cookies: Cookies;
    }
}
