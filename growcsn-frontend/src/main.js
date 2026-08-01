import Vue from 'vue';
import VueMeta from 'vue-meta';
import axios from 'axios';

import App from './App.vue';
import router from './router';
import store from './store';

import '@/assets/css/global.css';

Vue.use(VueMeta);

Vue.config.productionTip = false;

console.log('VUE_APP_BACKEND_URL=', process.env.VUE_APP_BACKEND_URL);
console.log('VUE_APP_SOCKET_URL=', process.env.VUE_APP_SOCKET_URL);
axios.defaults.baseURL = process.env.VUE_APP_BACKEND_URL;

const token = localStorage.getItem('token');
if (token !== undefined && token !== null) {
    axios.defaults.headers.common['x-auth-token'] = token;
}

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app');
