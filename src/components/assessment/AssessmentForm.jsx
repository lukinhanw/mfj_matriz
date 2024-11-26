import { useMemo } from 'react'
import QuestionGroup from './QuestionGroup'

export default function AssessmentForm({
	questions,
	answers,
	onAnswerChange,
	onSubmit,
	isSubmitting
}) {
	// Group questions by competency
	const groupedQuestions = useMemo(() => {
		const groups = {}
		questions.forEach(question => {
			if (!groups[question.competencia]) {
				groups[question.competencia] = []
			}
			groups[question.competencia].push(question)
		})
		return groups
	}, [questions])

	// Calculate progress
	const progress = useMemo(() => {
		const answered = Object.values(answers).filter(answer => answer !== null).length
		return Math.round((answered / questions.length) * 100)
	}, [answers, questions])

	return (
		<div className="space-y-8">
			{/* Progress bar */}
			<div className="relative pt-1">
				<div className="flex mb-2 items-center justify-between">
					<div>
						<span className="text-xs font-semibold inline-block text-gray-600 dark:text-gray-400">
							Progresso
						</span>
					</div>
					<div className="text-right">
						<span className="text-xs font-semibold inline-block text-gray-600 dark:text-gray-400">
							{progress}%
						</span>
					</div>
				</div>
				<div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
					<div
						style={{ width: `${progress}%` }}
						className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-orange-500 dark:bg-orange-600 transition-all duration-500"
					/>
				</div>
			</div>

			{/* Questions grouped by competency */}
			<div className="space-y-6">
				{Object.entries(groupedQuestions).map(([competency, questions]) => (
					<QuestionGroup
						key={competency}
						competency={competency}
						questions={questions}
						answers={answers}
						onAnswerChange={onAnswerChange}
					/>
				))}
			</div>

			{/* Submit button */}
			<div className="mt-8 flex justify-end">
				<button
					type="button"
					onClick={onSubmit}
					disabled={isSubmitting}
					className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
				>
					{isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
				</button>
			</div>
		</div>
	)
}