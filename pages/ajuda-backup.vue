<script setup lang="ts">
import { ref } from 'vue'
import { useStudyStore } from '~/stores/study'
import {
    mdiDownload,
    mdiUpload,
    mdiInformation,
    mdiCheckCircle,
    mdiAlertCircle,
} from '@mdi/js'

const store = useStudyStore()

const fileInput = ref<HTMLInputElement | null>(null)
const importStatus = ref<{ type: 'success' | 'error'; message: string } | null>(null)
const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

function exportData() {
    store.exportData()
    snackbarMessage.value = 'Backup exportado com sucesso!'
    snackbarColor.value = 'success'
    snackbar.value = true
}

function triggerImport() {
    fileInput.value?.click()
}

async function handleFileImport(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return

    try {
        const text = await file.text()
        const result = store.importData(text)

        if (result.success) {
            importStatus.value = { type: 'success', message: 'Dados importados com sucesso!' }
            snackbarMessage.value = 'Dados importados com sucesso!'
            snackbarColor.value = 'success'
        } else {
            importStatus.value = { type: 'error', message: result.error ?? 'Erro ao importar dados.' }
            snackbarMessage.value = result.error ?? 'Erro ao importar dados.'
            snackbarColor.value = 'error'
        }
        snackbar.value = true
    } catch {
        importStatus.value = { type: 'error', message: 'Erro ao ler o arquivo.' }
        snackbarMessage.value = 'Erro ao ler o arquivo.'
        snackbarColor.value = 'error'
        snackbar.value = true
    }

    if (fileInput.value) {
        fileInput.value.value = ''
    }
}
</script>

<template>
    <div>
        <h1 class="text-h5 font-weight-bold mb-4">Ajuda & Backup</h1>

        <!-- Info Card -->
        <v-card color="surface" rounded="lg" class="pa-4 mb-4">
            <div class="d-flex align-center mb-3">
                <v-icon :icon="mdiInformation" color="info" class="mr-2" />
                <span class="font-weight-bold">Sobre seus dados</span>
            </div>
            <p class="text-body-2 text-medium-emphasis">
                Seus dados são armazenados <strong>exclusivamente no seu dispositivo</strong> através do
                <code>localStorage</code> do navegador. Nenhuma informação é enviada para servidores externos.
            </p>
            <p class="text-body-2 text-medium-emphasis mt-2">
                Para não perder seu progresso ao trocar de dispositivo ou navegador, utilize as funcionalidades
                de backup abaixo.
            </p>
        </v-card>

        <!-- Export -->
        <v-card color="surface" rounded="lg" class="pa-6 mb-4">
            <div class="d-flex align-center mb-3">
                <v-icon :icon="mdiDownload" color="primary" class="mr-2" />
                <span class="font-weight-bold text-h6">Exportar Backup</span>
            </div>
            <p class="text-body-2 text-medium-emphasis mb-4">
                Salve uma cópia dos seus dados em um arquivo <code>.json</code>.
                Você pode usar este arquivo para restaurar seus dados em outro dispositivo ou navegador.
            </p>
            <v-btn color="primary" :prepend-icon="mdiDownload" size="large" @click="exportData">
                Exportar Dados ({{ store.totalSessions }} sessões)
            </v-btn>
        </v-card>

        <!-- Import -->
        <v-card color="surface" rounded="lg" class="pa-6 mb-4">
            <div class="d-flex align-center mb-3">
                <v-icon :icon="mdiUpload" color="secondary" class="mr-2" />
                <span class="font-weight-bold text-h6">Importar Backup</span>
            </div>
            <p class="text-body-2 text-medium-emphasis mb-4">
                Restaure seus dados a partir de um arquivo de backup <code>.json</code>.
                <strong class="text-warning">Atenção: isto substituirá todos os dados atuais!</strong>
            </p>

            <input
                ref="fileInput"
                type="file"
                accept=".json"
                style="display: none;"
                @change="handleFileImport"
            />

            <v-btn color="secondary" :prepend-icon="mdiUpload" size="large" @click="triggerImport">
                Selecionar Arquivo de Backup
            </v-btn>

            <v-alert
                v-if="importStatus"
                :type="importStatus.type"
                :icon="importStatus.type === 'success' ? mdiCheckCircle : mdiAlertCircle"
                class="mt-4"
                rounded="lg"
            >
                {{ importStatus.message }}
            </v-alert>
        </v-card>

        <!-- Help -->
        <v-card color="surface" rounded="lg" class="pa-6">
            <div class="font-weight-bold text-h6 mb-3">Perguntas Frequentes</div>

            <v-expansion-panels>
                <v-expansion-panel title="Meus dados são seguros?">
                    <template #text>
                        Sim! Todos os dados ficam armazenados apenas no seu dispositivo.
                        Nenhuma informação é compartilhada com terceiros.
                    </template>
                </v-expansion-panel>
                <v-expansion-panel title="O que acontece se eu limpar o cache do navegador?">
                    <template #text>
                        Seus dados serão perdidos. Por isso, recomendamos exportar um backup regularmente.
                    </template>
                </v-expansion-panel>
                <v-expansion-panel title="Posso usar em múltiplos dispositivos?">
                    <template #text>
                        Sim! Exporte um backup em um dispositivo e importe no outro.
                        Os dados não são sincronizados automaticamente entre dispositivos.
                    </template>
                </v-expansion-panel>
                <v-expansion-panel title="O arquivo de backup é compatível entre versões?">
                    <template #text>
                        Sim! O sistema valida o arquivo com Zod antes de importar,
                        garantindo compatibilidade e integridade dos dados.
                    </template>
                </v-expansion-panel>
            </v-expansion-panels>
        </v-card>

        <!-- Snackbar -->
        <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000">
            {{ snackbarMessage }}
            <template #actions>
                <v-btn variant="text" @click="snackbar = false">Fechar</v-btn>
            </template>
        </v-snackbar>
    </div>
</template>
