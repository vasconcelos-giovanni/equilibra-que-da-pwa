import { ref } from 'vue'
import type { DriveStep } from 'driver.js'

const ONBOARDING_KEY = 'equilibra-onboarding-completo'

export function useOnboarding() {
    const isCompleted = ref(false)

    const checkStatus = () => {
        if (process.client) {
            isCompleted.value = localStorage.getItem(ONBOARDING_KEY) === 'true'
        }
    }

    const markCompleted = () => {
        if (process.client) {
            localStorage.setItem(ONBOARDING_KEY, 'true')
            isCompleted.value = true
        }
    }

    const resetOnboarding = () => {
        if (process.client) {
            localStorage.removeItem(ONBOARDING_KEY)
            isCompleted.value = false
        }
    }

    const startTour = async () => {
        const { driver } = await import('driver.js')

        const steps: DriveStep[] = [
            {
                element: '#nav-dashboard',
                popover: {
                    title: 'Dashboard 📊',
                    description: 'Visualize seus KPIs, gráficos e metas de estudo aqui.',
                    side: 'right',
                },
            },
            {
                element: '#nav-registrar',
                popover: {
                    title: 'Registrar ✍️',
                    description: 'Registre aqui suas sessões de estudo com matéria, total de questões e acertos.',
                    side: 'right',
                },
            },
            {
                element: '#nav-historico',
                popover: {
                    title: 'Histórico 📋',
                    description: 'Veja, edite, duplique ou exclua seus registros anteriores.',
                    side: 'right',
                },
            },
            {
                element: '#nav-ajuda',
                popover: {
                    title: 'Ajuda & Backup 💾',
                    description: 'Exporte ou importe seus dados para não perder seu progresso.',
                    side: 'right',
                },
            },
        ]

        const driverObj = driver({
            showProgress: true,
            animate: true,
            overlayOpacity: 0.7,
            popoverClass: 'equilibra-popover',
            steps,
            onDestroyed: () => markCompleted(),
        })

        driverObj.drive()
    }

    return {
        isCompleted,
        checkStatus,
        markCompleted,
        resetOnboarding,
        startTour,
    }
}
