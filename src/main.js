import { createApp } from "vue";
import App from "./App.vue";
import i18n from "./i18n";

function mountApp(elementId) {
  const mountElement = document.getElementById(elementId);
  const datasource = mountElement.getAttribute('data-datasource');

  const app = createApp(App);
  app.provide('datasource', datasource);
  app.use(i18n);
  app.mount(`#${elementId}`);
}

mountApp('convo1');
mountApp('convo2');
