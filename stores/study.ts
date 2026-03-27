import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import { LocalStorageSchema, SessionSchema } from '~/types'
import type { Session, Goal } from '~/types'

export const useStudyStore = defineStore('study', {
    state: () => ({
        sessions: [] as Session[],
        goal: { dailyTarget: 30, weeklyTarget: 150 } as Goal,
    }),

    getters: {
        sortedSessions: (state) => {
            return [...state.sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        },
        totalSessions: (state) => state.sessions.length,
        totalQuestions: (state) => state.sessions.reduce((sum, s) => sum + s.totalQuestions, 0),
        totalCorrect: (state) => state.sessions.reduce((sum, s) => sum + s.correctQuestions, 0),
        totalWrong: (state) => state.sessions.reduce((sum, s) => sum + s.wrongQuestions, 0),
        overallAccuracy: (state) => {
            const total = state.sessions.reduce((sum, s) => sum + s.totalQuestions, 0)
            const correct = state.sessions.reduce((sum, s) => sum + s.correctQuestions, 0)
            return total > 0 ? Math.round((correct / total) * 100) : 0
        },
        todayQuestions: (state) => {
            const today = new Date().toISOString().split('T')[0]
            return state.sessions
                .filter(s => s.date === today)
                .reduce((sum, s) => sum + s.totalQuestions, 0)
        },
        weekQuestions: (state) => {
            const now = new Date()
            const weekStart = new Date(now)
            weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7))
            weekStart.setHours(0, 0, 0, 0)
            return state.sessions
                .filter(s => new Date(s.date) >= weekStart)
                .reduce((sum, s) => sum + s.totalQuestions, 0)
        },
    },

    actions: {
        addSession(sessionData: Omit<Session, 'id'>) {
            const session: Session = {
                id: uuidv4(),
                ...sessionData,
            }
            const result = SessionSchema.safeParse(session)
            if (result.success) {
                this.sessions.push(result.data)
            }
            return result
        },

        updateSession(id: string, sessionData: Omit<Session, 'id'>) {
            const session = { id, ...sessionData }
            const result = SessionSchema.safeParse(session)
            if (result.success) {
                const index = this.sessions.findIndex(s => s.id === id)
                if (index !== -1) {
                    this.sessions[index] = result.data
                }
            }
            return result
        },

        deleteSession(id: string) {
            this.sessions = this.sessions.filter(s => s.id !== id)
        },

        duplicateSession(id: string) {
            const original = this.sessions.find(s => s.id === id)
            if (original) {
                const duplicate: Session = {
                    ...original,
                    id: uuidv4(),
                    date: new Date().toISOString().split('T')[0],
                }
                this.sessions.push(duplicate)
            }
        },

        updateGoal(goal: Goal) {
            this.goal = goal
        },

        exportData() {
            const data = {
                sessions: this.sessions,
                goal: this.goal,
                exportedAt: new Date().toISOString(),
            }
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `equilibra-backup-${new Date().toISOString().split('T')[0]}.json`
            a.click()
            URL.revokeObjectURL(url)
        },

        importData(jsonString: string): { success: boolean; error?: string } {
            try {
                const parsed = JSON.parse(jsonString)
                const result = LocalStorageSchema.safeParse(parsed)
                if (result.success) {
                    this.sessions = result.data.sessions
                    this.goal = result.data.goal
                    return { success: true }
                } else {
                    return { success: false, error: 'Arquivo inválido ou corrompido.' }
                }
            } catch {
                return { success: false, error: 'Erro ao processar o arquivo JSON.' }
            }
        },

        clearAllData() {
            this.sessions = []
            this.goal = { dailyTarget: 30, weeklyTarget: 150 }
        },
    },

    persist: {
        key: 'enem-tracker-data',
        serializer: {
            serialize: JSON.stringify,
            deserialize: (raw: string) => {
                try {
                    const result = LocalStorageSchema.safeParse(JSON.parse(raw))
                    if (result.success) return result.data
                    return LocalStorageSchema.parse({})
                } catch {
                    return LocalStorageSchema.parse({})
                }
            },
        },
    },
})
