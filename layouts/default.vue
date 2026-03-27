<script setup lang="ts">
import { ref } from 'vue'
import {
    mdiViewDashboard,
    mdiPencilPlus,
    mdiHistory,
    mdiHelpCircle,
    mdiCog,
    mdiSchool,
} from '@mdi/js'
import { useStudyStore } from '~/stores/study'
import { useOnboarding } from '~/composables/useOnboarding'

const drawer = ref(false)
const settingsDialog = ref(false)
const store = useStudyStore()
const onboarding = useOnboarding()

const navItems = [
    { title: 'Dashboard', icon: mdiViewDashboard, to: '/', id: 'nav-dashboard' },
    { title: 'Registrar', icon: mdiPencilPlus, to: '/registrar', id: 'nav-registrar' },
    { title: 'Histórico', icon: mdiHistory, to: '/historico', id: 'nav-historico' },
    { title: 'Ajuda & Backup', icon: mdiHelpCircle, to: '/ajuda-backup', id: 'nav-ajuda' },
]

function restartTour() {
    settingsDialog.value = false
    onboarding.resetOnboarding()
    onboarding.startTour()
}
</script>

<template>
    <v-app theme="enemDark">
        <v-navigation-drawer v-model="drawer" temporary>
            <v-list-item
                title="Equilibra Que Dá!"
                subtitle="IFRN – Campus Nova Cruz"
                :prepend-icon="mdiSchool"
                nav
            />
            <v-divider />
            <v-list density="compact" nav>
                <v-list-item
                    v-for="item in navItems"
                    :key="item.to"
                    :id="item.id"
                    :to="item.to"
                    :prepend-icon="item.icon"
                    :title="item.title"
                    color="primary"
                    @click="drawer = false"
                />
            </v-list>
        </v-navigation-drawer>

        <v-app-bar color="primary" elevation="2">
            <v-app-bar-nav-icon @click="drawer = !drawer" />
            <v-toolbar-title>Equilibra Que Dá!</v-toolbar-title>
            <v-spacer />
            <v-btn :icon="mdiCog" @click="settingsDialog = true" />
        </v-app-bar>

        <v-main>
            <v-container fluid class="pa-4">
                <slot />
            </v-container>
        </v-main>

        <!-- Settings Dialog -->
        <v-dialog v-model="settingsDialog" max-width="400">
            <v-card>
                <v-card-title>Configurações</v-card-title>
                <v-card-text>
                    <v-btn block color="primary" variant="outlined" class="mb-3" @click="restartTour">
                        Reiniciar Tutorial
                    </v-btn>
                    <v-btn block color="error" variant="outlined" @click="store.clearAllData(); settingsDialog = false">
                        Limpar Todos os Dados
                    </v-btn>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn @click="settingsDialog = false">Fechar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-app>
</template>
