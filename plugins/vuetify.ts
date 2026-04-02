import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

export default defineNuxtPlugin((app) => {
    const vuetify = createVuetify({
        components,
        directives,
        icons: {
            defaultSet: 'mdi',
            aliases,
            sets: { mdi },
        },
        theme: {
            defaultTheme: 'enemDark',
            themes: {
                enemDark: {
                    dark: true,
                    colors: {
                        primary: '#006747',
                        secondary: '#FFD700',
                        background: '#1e1e1e',
                        surface: '#2d2d2d',
                        error: '#F44336',
                        warning: '#FF9800',
                        info: '#2196F3',
                        success: '#4CAF50',
                    },
                },
            },
        },
    })
    app.vueApp.use(vuetify)
})
