/* eslint-disable */

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

const app = createApp(App);

//#region Global component section
import Input from './components/Input.vue';

app.component('Input', Input);
//#endregion Global component section

app.use(store);
app.use(router);

app.mount('#app');
