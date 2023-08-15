import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import {VCol, VRow, VApp, VContainer, VTextField, VSelect, VBtn} from 'vuetify/components'
import * as directives from 'vuetify/directives'
import PrimeVue from 'primevue/config';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Paginator from "primevue/paginator";
import "primevue/resources/themes/lara-light-indigo/theme.css";


const vuetify = createVuetify({
    components: {VCol, VRow, VApp, VContainer, VTextField, VSelect, VBtn},
    directives,
})

const app = createApp(App).use(vuetify).use(PrimeVue)
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('Paginator', Paginator);
app.mount('#app')
