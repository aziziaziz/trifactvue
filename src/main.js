/* eslint-disable */

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

const app = createApp(App);

//#region Global component section
import Input from './components/Input.vue';
import Button from './components/Button.vue';

app.component('Input', Input);
app.component('Button', Button);
//#endregion Global component section

app.use(store);
app.use(router);

app.mount('#app');
