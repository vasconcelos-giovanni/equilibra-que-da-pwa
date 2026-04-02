import { computed } from 'vue'
import { useStudyStore } from '~/stores/study'
import { MateriaLabels, MotivoErroLabels } from '~/types'

export function useStatistics() {
    const store = useStudyStore()

    const questionsBySubject = computed(() => {
        const map = new Map<string, { total: number; correct: number; wrong: number }>()
        for (const session of store.sessions) {
            const label = MateriaLabels[session.subject] ?? session.subject
            const existing = map.get(label) ?? { total: 0, correct: 0, wrong: 0 }
            map.set(label, {
                total: existing.total + session.totalQuestions,
                correct: existing.correct + session.correctQuestions,
                wrong: existing.wrong + session.wrongQuestions,
            })
        }
        return map
    })

    const barChartData = computed(() => {
        const labels: string[] = []
        const correctData: number[] = []
        const wrongData: number[] = []

        questionsBySubject.value.forEach((v, k) => {
            labels.push(k)
            correctData.push(v.correct)
            wrongData.push(v.wrong)
        })

        return {
            labels,
            datasets: [
                {
                    label: 'Acertos',
                    data: correctData,
                    backgroundColor: '#4CAF50',
                },
                {
                    label: 'Erros',
                    data: wrongData,
                    backgroundColor: '#F44336',
                },
            ],
        }
    })

    const doughnutChartData = computed(() => {
        const map = new Map<string, number>()
        for (const session of store.sessions) {
            if (session.primaryErrorReason === null) continue
            const label = MotivoErroLabels[session.primaryErrorReason] ?? session.primaryErrorReason
            map.set(label, (map.get(label) ?? 0) + session.wrongQuestions)
        }

        const labels: string[] = []
        const data: number[] = []
        map.forEach((v, k) => {
            labels.push(k)
            data.push(v)
        })

        return {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
                    ],
                },
            ],
        }
    })

    const lineChartData = computed(() => {
        const dateMap = new Map<string, number>()
        const sorted = [...store.sessions].sort((a, b) => a.date.localeCompare(b.date))

        for (const session of sorted) {
            dateMap.set(session.date, (dateMap.get(session.date) ?? 0) + session.totalQuestions)
        }

        const labels = [...dateMap.keys()]
        const data = [...dateMap.values()]

        return {
            labels,
            datasets: [
                {
                    label: 'Questões por dia',
                    data,
                    borderColor: '#006747',
                    backgroundColor: 'rgba(0,103,71,0.1)',
                    fill: true,
                    tension: 0.4,
                },
            ],
        }
    })

    const radarChartData = computed(() => {
        const subjectMap = new Map<string, { total: number; correct: number }>()
        for (const session of store.sessions) {
            const label = MateriaLabels[session.subject] ?? session.subject
            const existing = subjectMap.get(label) ?? { total: 0, correct: 0 }
            subjectMap.set(label, {
                total: existing.total + session.totalQuestions,
                correct: existing.correct + session.correctQuestions,
            })
        }

        const labels: string[] = []
        const data: number[] = []

        subjectMap.forEach((v, k) => {
            labels.push(k)
            data.push(v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0)
        })

        return {
            labels,
            datasets: [
                {
                    label: 'Taxa de Acerto (%)',
                    data,
                    backgroundColor: 'rgba(0,103,71,0.2)',
                    borderColor: '#006747',
                    pointBackgroundColor: '#006747',
                },
            ],
        }
    })

    const topSubjects = computed(() => {
        const arr: Array<{ subject: string; total: number; accuracy: number }> = []
        questionsBySubject.value.forEach((v, k) => {
            arr.push({
                subject: k,
                total: v.total,
                accuracy: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0,
            })
        })
        return arr.sort((a, b) => b.total - a.total).slice(0, 5)
    })

    return {
        questionsBySubject,
        barChartData,
        doughnutChartData,
        lineChartData,
        radarChartData,
        topSubjects,
    }
}
