export default function AssessmentHeader({ position }) {
	return (
		<div className="mb-8">
			<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
				Avaliação
			</h1>
			<p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
				Cargo: <span className="font-medium text-gray-900 dark:text-gray-200">{position}</span>
			</p>
		</div>
	)
}