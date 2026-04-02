<script setup lang="ts">
import { ref } from 'vue'
import SessionForm from '~/components/SessionForm.vue'
import type { Session } from '~/types'

const formRef = ref<InstanceType<typeof SessionForm> | null>(null)
const snackbar = ref(false)
const snackbarMessage = ref('')

function onSaved(_session: Session) {
    snackbarMessage.value = 'Sessão registrada com sucesso!'
    snackbar.value = true
    formRef.value?.resetForm()
}

function onCancelled() {
    formRef.value?.resetForm()
}
</script>

<template>
    <div>
        <h1 class="text-h5 font-weight-bold mb-4">Registrar Sessão</h1>
        <v-card color="surface" rounded="lg" class="pa-6">
            <SessionForm
                ref="formRef"
                :is-editing="false"
                @saved="onSaved"
                @cancelled="onCancelled"
            />
        </v-card>

        <v-snackbar v-model="snackbar" color="success" :timeout="3000">
            {{ snackbarMessage }}
            <template #actions>
                <v-btn variant="text" @click="snackbar = false">Fechar</v-btn>
            </template>
        </v-snackbar>
    </div>
</template>
