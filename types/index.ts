import { z } from 'zod'

export const Materia = z.enum([
    'Matematica',
    'Linguagens',
    'CienciasNatureza',
    'CienciasHumanas',
    'Redacao',
    'Fisica',
    'Quimica',
    'Biologia',
    'Historia',
    'Geografia',
    'Filosofia',
    'Sociologia',
    'LiteraturaPortuguesa',
    'LinguaEstrangeira',
    'Artes',
    'EducacaoFisica',
    'LinguaPortuguesa',
])

export type Materia = z.infer<typeof Materia>

export const MateriaLabels: Record<Materia, string> = {
    Matematica: 'Matemática',
    Linguagens: 'Linguagens e Códigos',
    CienciasNatureza: 'Ciências da Natureza',
    CienciasHumanas: 'Ciências Humanas',
    Redacao: 'Redação',
    Fisica: 'Física',
    Quimica: 'Química',
    Biologia: 'Biologia',
    Historia: 'História',
    Geografia: 'Geografia',
    Filosofia: 'Filosofia',
    Sociologia: 'Sociologia',
    LiteraturaPortuguesa: 'Literatura Portuguesa',
    LinguaEstrangeira: 'Língua Estrangeira',
    Artes: 'Artes',
    EducacaoFisica: 'Educação Física',
    LinguaPortuguesa: 'Língua Portuguesa',
}

export const MotivoErro = z.enum([
    'FaltaDeConhecimento',
    'ErroDeCalculo',
    'InterpretacaoTexto',
    'DescuidoDistracaoPressa',
    'ConteudoNaoVisto',
    'DificuldadeComInterpretacao',
])

export type MotivoErro = z.infer<typeof MotivoErro>

export const MotivoErroLabels: Record<MotivoErro, string> = {
    FaltaDeConhecimento: 'Falta de Conhecimento',
    ErroDeCalculo: 'Erro de Cálculo',
    InterpretacaoTexto: 'Interpretação de Texto',
    DescuidoDistracaoPressa: 'Descuido / Distração / Pressa',
    ConteudoNaoVisto: 'Conteúdo Não Visto',
    DificuldadeComInterpretacao: 'Dificuldade com Interpretação',
}

export const SessionSchema = z.object({
    id: z.string().uuid(),
    date: z.string().min(1),
    subject: Materia,
    totalQuestions: z.number().int().min(1),
    wrongQuestions: z.number().int().min(0),
    correctQuestions: z.number().int().min(0),
    primaryErrorReason: MotivoErro.nullable(),
}).superRefine((data, ctx) => {
    if (data.correctQuestions + data.wrongQuestions !== data.totalQuestions) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Acertos + Erros deve ser igual ao Total.',
            path: ['correctQuestions'],
        })
    }
    if (data.wrongQuestions > 0 && data.primaryErrorReason === null) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Se houver erros, selecione o motivo.',
            path: ['primaryErrorReason'],
        })
    }
    if (data.wrongQuestions === 0 && data.primaryErrorReason !== null) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Sessões sem erros não devem ter motivo.',
            path: ['primaryErrorReason'],
        })
    }
})

export type Session = z.infer<typeof SessionSchema>

export const GoalSchema = z.object({
    dailyTarget: z.number().int().min(1).default(30),
    weeklyTarget: z.number().int().min(1).default(150),
})

export type Goal = z.infer<typeof GoalSchema>

export const LocalStorageSchema = z.object({
    sessions: z.array(SessionSchema).default([]),
    goal: GoalSchema.default({ dailyTarget: 30, weeklyTarget: 150 }),
})

export type LocalStorage = z.infer<typeof LocalStorageSchema>
