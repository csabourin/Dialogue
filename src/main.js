import { createApp } from "vue";
import App from "./App.vue";
createApp(App).provide("datasource", "conversation_1.json").mount("#convo1");
createApp(App).provide("datasource", "conversation_2.json").mount("#convo2");

