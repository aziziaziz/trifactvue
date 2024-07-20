/* eslint-disable */

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

const app = createApp(App);

//#region Global component section
import Input from './components/Input.vue';
import Button from './components/Button.vue';
import CollapsibleMenu from './components/CollapsibleMenu.vue';
import Dropdown from './components/Dropdown.vue';
import FormInput from './components/FormInput.vue';

app.component('Input', Input);
app.component('Button', Button);
app.component('CollapsibleMenu', CollapsibleMenu);
app.component('Dropdown', Dropdown);
app.component('FormInput', FormInput);
//#endregion Global component section

app.use(store);
app.use(router);

app.mount('#app');
