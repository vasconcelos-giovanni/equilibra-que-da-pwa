<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useStudyStore } from '~/stores/study'
import { Materia, MateriaLabels, MotivoErro, MotivoErroLabels, SessionSchema } from '~/types'
import type { Session } from '~/types'

const props = defineProps<{
    session?: Session | null
    isEditing?: boolean
}>()

const emit = defineEmits<{
    saved: [session: Session]
    cancelled: []
}>()

const store = useStudyStore()

const today = new Date().toISOString().split('T')[0]

const form = ref({
    date: today,
    subject: '' as string,
    totalQuestions: 10,
    wrongQuestions: 0,
    correctQuestions: 10,
    primaryErrorReason: null as string | null,
})

const errors = ref<Record<string, string>>({})
const loading = ref(false)

const subjectOptions = Object.entries(MateriaLabels).map(([value, title]) => ({ value, title }))
const errorReasonOptions = Object.entries(MotivoErroLabels).map(([value, title]) => ({ value, title }))

const hasErrors = computed(() => form.value.wrongQuestions > 0)

watch(() => form.value.totalQuestions, (val) => {
    if (form.value.wrongQuestions > val) {
        form.value.wrongQuestions = val
    }
    form.value.correctQuestions = val - form.value.wrongQuestions
})

watch(() => form.value.wrongQuestions, (val) => {
    form.value.correctQuestions = form.value.totalQuestions - val
    if (val === 0) {
        form.value.primaryErrorReason = null
    }
})

watch(() => props.session, (session) => {
    if (session) {
        form.value = {
            date: session.date,
            subject: session.subject,
            totalQuestions: session.totalQuestions,
            wrongQuestions: session.wrongQuestions,
            correctQuestions: session.correctQuestions,
            primaryErrorReason: session.primaryErrorReason,
        }
    }
}, { immediate: true })

async function handleSubmit() {
    errors.value = {}
    loading.value = true

    try {
        const data = {
            id: props.session?.id ?? crypto.randomUUID(),
            date: form.value.date,
            subject: form.value.subject as Materia,
            totalQuestions: Number(form.value.totalQuestions),
            wrongQuestions: Number(form.value.wrongQuestions),
            correctQuestions: Number(form.value.correctQuestions),
            primaryErrorReason: form.value.primaryErrorReason as MotivoErro | null,
        }

        const result = SessionSchema.safeParse(data)

        if (!result.success) {
            for (const issue of result.error.issues) {
                const path = issue.path[0] as string
                errors.value[path] = issue.message
            }
            return
        }

        if (props.isEditing && props.session?.id) {
            store.updateSession(props.session.id, result.data)
        } else {
            store.addSession(result.data)
        }

        emit('saved', result.data)
    } finally {
        loading.value = false
    }
}

function handleCancel() {
    emit('cancelled')
}

function resetForm() {
    form.value = {
        date: today,
        subject: '',
        totalQuestions: 10,
        wrongQuestions: 0,
        correctQuestions: 10,
        primaryErrorReason: null,
    }
    errors.value = {}
}

defineExpose({ resetForm })
</script>

<template>
    <v-form @submit.prevent="handleSubmit">
        <v-row>
            <v-col cols="12" md="6">
                <v-text-field
                    v-model="form.date"
                    label="Data"
                    type="date"
                    :error-messages="errors.date"
                    required
                />
            </v-col>
            <v-col cols="12" md="6">
                <v-select
                    v-model="form.subject"
                    label="Matéria"
                    :items="subjectOptions"
                    item-title="title"
                    item-value="value"
                    :error-messages="errors.subject"
                    required
                />
            </v-col>
            <v-col cols="12" md="4">
                <v-text-field
                    v-model.number="form.totalQuestions"
                    label="Total de Questões"
                    type="number"
                    min="1"
                    :error-messages="errors.totalQuestions"
                    required
                />
            </v-col>
            <v-col cols="12" md="4">
                <v-text-field
                    v-model.number="form.wrongQuestions"
                    label="Questões Erradas"
                    type="number"
                    min="0"
                    :max="form.totalQuestions"
                    :error-messages="errors.wrongQuestions"
                />
            </v-col>
            <v-col cols="12" md="4">
                <v-text-field
                    v-model.number="form.correctQuestions"
                    label="Questões Corretas"
                    type="number"
                    readonly
                    :error-messages="errors.correctQuestions"
                />
            </v-col>
            <v-col v-if="hasErrors" cols="12">
                <v-select
                    v-model="form.primaryErrorReason"
                    label="Principal Motivo de Erro"
                    :items="errorReasonOptions"
                    item-title="title"
                    item-value="value"
                    :error-messages="errors.primaryErrorReason"
                    clearable
                    required
                />
            </v-col>
        </v-row>

        <v-row class="mt-2">
            <v-col cols="12" class="d-flex gap-2 justify-end">
                <v-btn variant="text" @click="handleCancel">Cancelar</v-btn>
                <v-btn
                    color="primary"
                    type="submit"
                    :loading="loading"
                >
                    {{ isEditing ? 'Salvar Alterações' : 'Registrar Sessão' }}
                </v-btn>
            </v-col>
        </v-row>
    </v-form>
</template>
