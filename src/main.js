import { createApp } from "vue";
import App from "./App.vue";
import i18n from "./i18n"; // Import the i18n instance

// Create the first app instance and provide datasource
const app1 = createApp(App);
app1.provide("datasource", "conversation_1.json");
app1.use(i18n); // Add the i18n instance to the first app
app1.mount("#convo1");

// Create the second app instance and provide datasource
const app2 = createApp(App);
app2.provide("datasource", "conversation_2.json");
app2.use(i18n); // Add the i18n instance to the second app
app2.mount("#convo2");
