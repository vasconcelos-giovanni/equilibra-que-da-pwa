import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
    ssr: false,
    compatibilityDate: '2024-04-03',
    devtools: { enabled: true },

    build: {
        transpile: ['vuetify'],
    },

    modules: [
        '@pinia/nuxt',
        '@vite-pwa/nuxt',
        (_options, nuxt) => {
            nuxt.hooks.hook('vite:extendConfig', (config) => {
                // @ts-expect-error
                config.plugins.push(vuetify({ autoImport: true }))
            })
        },
    ],

    vite: {
        vue: {
            template: {
                transformAssetUrls,
            },
        },
    },

    nitro: {
        preset: 'static',
        compressPublicAssets: { brotli: true, gzip: true },
    },

    pwa: {
        registerType: 'autoUpdate',
        manifest: {
            name: 'Equilibra Que Dá!',
            short_name: 'Equilibra',
            description: 'Rastreador de questões do ENEM para alunos do IFRN – Campus Nova Cruz.',
            theme_color: '#006747',
            background_color: '#1e1e1e',
            display: 'standalone',
            orientation: 'portrait',
            icons: [
                {
                    src: '/assets/images/icon-192.png',
                    sizes: '192x192',
                    type: 'image/png',
                },
                {
                    src: '/assets/images/icon-512.png',
                    sizes: '512x512',
                    type: 'image/png',
                },
            ],
        },
        workbox: {
            navigateFallback: '/',
        },
        devOptions: {
            enabled: true,
            suppressWarnings: true,
            navigateFallbackAllowlist: [/^\/$/],
            type: 'module',
        },
    },
})
