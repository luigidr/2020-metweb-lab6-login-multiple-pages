'use strict';

import App from './app.js';

// getting the containers
const appContainer = document.querySelector('#app');
const userContainer = document.querySelector('#login-area');

const app = new App(appContainer, userContainer);