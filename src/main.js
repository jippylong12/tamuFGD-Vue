import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { VCol, VRow, VContainer, VSpacer } from 'vuetify/components/VGrid'
import {VApp} from 'vuetify/components/VApp'
import {VSelect} from 'vuetify/components/VSelect'
import {VBtn} from 'vuetify/components/VBtn'
import {VChip} from 'vuetify/components/VChip'
import {VTextField} from 'vuetify/components/VTextField'
import {VCombobox} from 'vuetify/components/VCombobox'
import {VDivider} from 'vuetify/components/VDivider'
import {VSwitch} from 'vuetify/components/VSwitch'
import {VSheet} from 'vuetify/components/VSheet'
import PrimeVue from 'primevue/config';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Paginator from "primevue/paginator";
import InputText from "primevue/inputtext";
import "primevue/resources/themes/lara-light-teal/theme.css";
import "toastify-js/src/toastify.css"
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
    components: {VCol, VRow, VApp, VContainer, VTextField, VSelect, VBtn, VChip, VCombobox, VDivider, VSpacer, VSwitch, VSheet},
    directives,
    theme: {
        defaultTheme: 'tamu',
        themes: {
            tamu: {
                dark: false,
                colors: {
                    primary: '#500000',
                    secondary: '#7a1f2b',
                    info: '#7a1f2b',
                    success: '#2f7d5b',
                    warning: '#a56b1f',
                    error: '#9b1c1c',
                },
            },
        },
    },
})

const app = createApp(App).use(vuetify).use(PrimeVue)
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('Paginator', Paginator);
app.component('InputText', InputText);
app.mount('#app')
