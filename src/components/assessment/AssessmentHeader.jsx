export default function AssessmentHeader({ position, competencia }) {
	return (
		<div className="mb-8">
			<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
				Avaliação
			</h1>
			<div className="mt-2 space-y-1">
				<p className="text-lg text-gray-600 dark:text-gray-400">
					Cargo: <span className="font-medium text-gray-900 dark:text-gray-200">{position}</span>
				</p>
				<p className="text-lg text-gray-600 dark:text-gray-400">
					Competência: <span className="font-medium text-gray-900 dark:text-gray-200">{competencia || 'Não especificada'}</span>
				</p>
			</div>
		</div>
	)
}