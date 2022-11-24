import {createStore} from 'vuex'

declare let SessionStorage: any;
const USER ="USER";

const store = createStore({
    state: {
        user: SessionStorage.get(USER) || {}//并一个空对象，避免空指针异常
    },
    mutations: {//同步
        setUser(state, user) {
            state.user = user;
            SessionStorage.set(USER, user);//放到缓存里面来
        }
    },
    actions: {//支持异步
    },
    modules: {}
})

export default store;