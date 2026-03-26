<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Bar, Doughnut, Line, Radar } from 'vue-chartjs'
import { useStudyStore } from '~/stores/study'
import { useStatistics } from '~/composables/useStatistics'
import { useOnboarding } from '~/composables/useOnboarding'
import {
    mdiCheckCircle,
    mdiCloseCircle,
    mdiBookOpen,
    mdiTrendingUp,
    mdiCalendarCheck,
    mdiCalendarWeek,
} from '@mdi/js'

const store = useStudyStore()
const stats = useStatistics()
const onboarding = useOnboarding()

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: { color: '#ffffff' },
        },
    },
    scales: {
        x: {
            ticks: { color: '#ffffff' },
            grid: { color: 'rgba(255,255,255,0.1)' },
        },
        y: {
            ticks: { color: '#ffffff' },
            grid: { color: 'rgba(255,255,255,0.1)' },
        },
    },
}

const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { labels: { color: '#ffffff' } },
    },
    scales: {
        r: {
            ticks: { color: '#ffffff', backdropColor: 'transparent' },
            grid: { color: 'rgba(255,255,255,0.2)' },
            pointLabels: { color: '#ffffff' },
            min: 0,
            max: 100,
        },
    },
}

const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { labels: { color: '#ffffff' }, position: 'bottom' as const },
    },
}

const dailyProgress = computed(() => {
    return Math.min(100, Math.round((store.todayQuestions / store.goal.dailyTarget) * 100))
})

const weeklyProgress = computed(() => {
    return Math.min(100, Math.round((store.weekQuestions / store.goal.weeklyTarget) * 100))
})

onMounted(() => {
    onboarding.checkStatus()
    if (!onboarding.isCompleted.value) {
        setTimeout(() => {
            onboarding.startTour()
        }, 500)
    }
})
</script>

<template>
    <div>
        <h1 class="text-h5 font-weight-bold mb-4">Dashboard</h1>

        <!-- KPIs -->
        <v-row class="mb-4">
            <v-col cols="6" md="3">
                <v-card color="surface" class="text-center pa-4" rounded="lg">
                    <v-icon :icon="mdiBookOpen" color="primary" size="32" class="mb-2" />
                    <div class="text-h4 font-weight-bold">{{ store.totalQuestions }}</div>
                    <div class="text-caption text-medium-emphasis">Total de Questões</div>
                </v-card>
            </v-col>
            <v-col cols="6" md="3">
                <v-card color="surface" class="text-center pa-4" rounded="lg">
                    <v-icon :icon="mdiCheckCircle" color="success" size="32" class="mb-2" />
                    <div class="text-h4 font-weight-bold">{{ store.totalCorrect }}</div>
                    <div class="text-caption text-medium-emphasis">Acertos</div>
                </v-card>
            </v-col>
            <v-col cols="6" md="3">
                <v-card color="surface" class="text-center pa-4" rounded="lg">
                    <v-icon :icon="mdiCloseCircle" color="error" size="32" class="mb-2" />
                    <div class="text-h4 font-weight-bold">{{ store.totalWrong }}</div>
                    <div class="text-caption text-medium-emphasis">Erros</div>
                </v-card>
            </v-col>
            <v-col cols="6" md="3">
                <v-card color="surface" class="text-center pa-4" rounded="lg">
                    <v-icon :icon="mdiTrendingUp" color="info" size="32" class="mb-2" />
                    <div class="text-h4 font-weight-bold">{{ store.overallAccuracy }}%</div>
                    <div class="text-caption text-medium-emphasis">Taxa de Acerto</div>
                </v-card>
            </v-col>
        </v-row>

        <!-- Goals -->
        <v-row class="mb-4">
            <v-col cols="12" md="6">
                <v-card color="surface" rounded="lg" class="pa-4">
                    <div class="d-flex align-center mb-2">
                        <v-icon :icon="mdiCalendarCheck" color="primary" class="mr-2" />
                        <span class="font-weight-bold">Meta Diária</span>
                        <v-spacer />
                        <span class="text-caption">{{ store.todayQuestions }} / {{ store.goal.dailyTarget }} questões</span>
                    </div>
                    <v-progress-linear
                        :model-value="dailyProgress"
                        color="primary"
                        height="12"
                        rounded
                        bg-color="surface-variant"
                    />
                    <div class="text-right text-caption mt-1">{{ dailyProgress }}%</div>
                </v-card>
            </v-col>
            <v-col cols="12" md="6">
                <v-card color="surface" rounded="lg" class="pa-4">
                    <div class="d-flex align-center mb-2">
                        <v-icon :icon="mdiCalendarWeek" color="secondary" class="mr-2" />
                        <span class="font-weight-bold">Meta Semanal</span>
                        <v-spacer />
                        <span class="text-caption">{{ store.weekQuestions }} / {{ store.goal.weeklyTarget }} questões</span>
                    </div>
                    <v-progress-linear
                        :model-value="weeklyProgress"
                        color="secondary"
                        height="12"
                        rounded
                    />
                    <div class="text-right text-caption mt-1">{{ weeklyProgress }}%</div>
                </v-card>
            </v-col>
        </v-row>

        <!-- Charts -->
        <template v-if="store.totalSessions > 0">
            <v-row class="mb-4">
                <v-col cols="12" md="8">
                    <v-card color="surface" rounded="lg" class="pa-4">
                        <div class="font-weight-bold mb-3">Questões por Matéria</div>
                        <div style="height: 300px;">
                            <Bar :data="stats.barChartData.value" :options="chartOptions" />
                        </div>
                    </v-card>
                </v-col>
                <v-col cols="12" md="4">
                    <v-card color="surface" rounded="lg" class="pa-4">
                        <div class="font-weight-bold mb-3">Motivos de Erro</div>
                        <div style="height: 300px;">
                            <Doughnut :data="stats.doughnutChartData.value" :options="doughnutOptions" />
                        </div>
                    </v-card>
                </v-col>
            </v-row>

            <v-row>
                <v-col cols="12" md="8">
                    <v-card color="surface" rounded="lg" class="pa-4">
                        <div class="font-weight-bold mb-3">Evolução Diária</div>
                        <div style="height: 250px;">
                            <Line :data="stats.lineChartData.value" :options="chartOptions" />
                        </div>
                    </v-card>
                </v-col>
                <v-col cols="12" md="4">
                    <v-card color="surface" rounded="lg" class="pa-4">
                        <div class="font-weight-bold mb-3">Desempenho por Área</div>
                        <div style="height: 250px;">
                            <Radar :data="stats.radarChartData.value" :options="radarOptions" />
                        </div>
                    </v-card>
                </v-col>
            </v-row>
        </template>

        <v-card v-else color="surface" rounded="lg" class="pa-8 text-center">
            <v-icon :icon="mdiBookOpen" size="64" color="primary" class="mb-4" />
            <div class="text-h6 mb-2">Nenhuma sessão registrada ainda</div>
            <div class="text-body-2 text-medium-emphasis mb-4">
                Registre sua primeira sessão de estudos para ver as estatísticas aqui.
            </div>
            <v-btn color="primary" to="/registrar">Registrar Agora</v-btn>
        </v-card>
    </div>
</template>
