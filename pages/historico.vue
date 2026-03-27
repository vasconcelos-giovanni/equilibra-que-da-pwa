<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStudyStore } from '~/stores/study'
import { MateriaLabels, MotivoErroLabels } from '~/types'
import type { Session } from '~/types'
import SessionForm from '~/components/SessionForm.vue'
import {
    mdiPencil,
    mdiDelete,
    mdiContentCopy,
    mdiFilter,
} from '@mdi/js'

const store = useStudyStore()

const page = ref(1)
const itemsPerPage = 10
const filterSubject = ref<string | null>(null)
const deleteDialog = ref(false)
const editDialog = ref(false)
const sessionToDelete = ref<Session | null>(null)
const sessionToEdit = ref<Session | null>(null)
const snackbar = ref(false)
const snackbarMessage = ref('')

const subjectOptions = [
    { value: null, title: 'Todas as Matérias' },
    ...Object.entries(MateriaLabels).map(([value, title]) => ({ value, title })),
]

const filteredSessions = computed(() => {
    let sessions = store.sortedSessions
    if (filterSubject.value) {
        sessions = sessions.filter(s => s.subject === filterSubject.value)
    }
    return sessions
})

const paginatedSessions = computed(() => {
    const start = (page.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredSessions.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredSessions.value.length / itemsPerPage))

function confirmDelete(session: Session) {
    sessionToDelete.value = session
    deleteDialog.value = true
}

function executeDelete() {
    if (sessionToDelete.value) {
        store.deleteSession(sessionToDelete.value.id)
        snackbarMessage.value = 'Sessão excluída!'
        snackbar.value = true
    }
    deleteDialog.value = false
    sessionToDelete.value = null
}

function editSession(session: Session) {
    sessionToEdit.value = session
    editDialog.value = true
}

function onEditSaved(_session: Session) {
    editDialog.value = false
    sessionToEdit.value = null
    snackbarMessage.value = 'Sessão atualizada!'
    snackbar.value = true
}

function duplicateSession(session: Session) {
    store.duplicateSession(session.id)
    snackbarMessage.value = 'Sessão duplicada!'
    snackbar.value = true
}

function getSubjectLabel(subject: string): string {
    return MateriaLabels[subject as keyof typeof MateriaLabels] ?? subject
}

function getErrorReasonLabel(reason: string | null): string {
    if (!reason) return '—'
    return MotivoErroLabels[reason as keyof typeof MotivoErroLabels] ?? reason
}

function formatDate(date: string): string {
    const [year, month, day] = date.split('-').map(Number)
    return new Date(year, month - 1, day).toLocaleDateString('pt-BR')
}
</script>

<template>
    <div>
        <div class="d-flex align-center justify-space-between mb-4">
            <h1 class="text-h5 font-weight-bold">Histórico</h1>
            <v-chip>{{ filteredSessions.length }} sessões</v-chip>
        </div>

        <!-- Filter -->
        <v-card color="surface" rounded="lg" class="pa-4 mb-4">
            <v-select
                v-model="filterSubject"
                label="Filtrar por Matéria"
                :items="subjectOptions"
                item-title="title"
                item-value="value"
                :prepend-inner-icon="mdiFilter"
                clearable
                variant="outlined"
                density="compact"
            />
        </v-card>

        <!-- Sessions List -->
        <v-card v-if="filteredSessions.length === 0" color="surface" rounded="lg" class="pa-8 text-center">
            <div class="text-h6 mb-2">Nenhuma sessão encontrada</div>
            <div class="text-body-2 text-medium-emphasis">
                Tente mudar o filtro ou registre uma nova sessão.
            </div>
        </v-card>

        <template v-else>
            <v-card
                v-for="session in paginatedSessions"
                :key="session.id"
                color="surface"
                rounded="lg"
                class="mb-3 pa-4"
            >
                <div class="d-flex align-start justify-space-between">
                    <div class="flex-grow-1">
                        <div class="font-weight-bold text-primary">{{ getSubjectLabel(session.subject) }}</div>
                        <div class="text-caption text-medium-emphasis">{{ formatDate(session.date) }}</div>
                        <div class="d-flex gap-4 mt-2 flex-wrap">
                            <span class="text-body-2">
                                <strong>Total:</strong> {{ session.totalQuestions }}
                            </span>
                            <span class="text-body-2 text-success">
                                <strong>✓</strong> {{ session.correctQuestions }}
                            </span>
                            <span class="text-body-2 text-error">
                                <strong>✗</strong> {{ session.wrongQuestions }}
                            </span>
                            <span class="text-body-2">
                                <strong>Taxa:</strong>
                                {{ session.totalQuestions > 0 ? Math.round((session.correctQuestions / session.totalQuestions) * 100) : 0 }}%
                            </span>
                        </div>
                        <div v-if="session.primaryErrorReason" class="text-caption text-warning mt-1">
                            Motivo: {{ getErrorReasonLabel(session.primaryErrorReason) }}
                        </div>
                    </div>
                    <div class="d-flex gap-1 ml-2">
                        <v-btn :icon="mdiPencil" size="small" variant="text" color="primary" @click="editSession(session)" />
                        <v-btn :icon="mdiContentCopy" size="small" variant="text" color="info" @click="duplicateSession(session)" />
                        <v-btn :icon="mdiDelete" size="small" variant="text" color="error" @click="confirmDelete(session)" />
                    </div>
                </div>
            </v-card>

            <!-- Pagination -->
            <div class="d-flex justify-center mt-4">
                <v-pagination
                    v-model="page"
                    :length="totalPages"
                    :total-visible="5"
                    color="primary"
                />
            </div>
        </template>

        <!-- Delete Confirmation Dialog -->
        <v-dialog v-model="deleteDialog" max-width="400">
            <v-card>
                <v-card-title>Confirmar Exclusão</v-card-title>
                <v-card-text>
                    Tem certeza que deseja excluir esta sessão? Esta ação não pode ser desfeita.
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn @click="deleteDialog = false">Cancelar</v-btn>
                    <v-btn color="error" @click="executeDelete">Excluir</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Edit Dialog -->
        <v-dialog v-model="editDialog" max-width="600">
            <v-card>
                <v-card-title>Editar Sessão</v-card-title>
                <v-card-text>
                    <SessionForm
                        :session="sessionToEdit"
                        :is-editing="true"
                        @saved="onEditSaved"
                        @cancelled="editDialog = false"
                    />
                </v-card-text>
            </v-card>
        </v-dialog>

        <!-- Snackbar -->
        <v-snackbar v-model="snackbar" :timeout="2000">
            {{ snackbarMessage }}
        </v-snackbar>
    </div>
</template>
