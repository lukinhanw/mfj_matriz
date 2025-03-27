export default function QuestionItem({
	question,
	answer,
	onAnswerChange
}) {
	return (
		<div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
			<div className="mb-4">
				<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
					{question.competencia}
				</span>
			</div>
			
			<div className="space-y-4">
				<p className="text-gray-700 dark:text-gray-300">{question.pergunta}</p>
				<div className="flex items-center space-x-6">
					<label className="inline-flex items-center">
						<input
							type="radio"
							className="form-radio text-orange-600 focus:ring-orange-500 h-4 w-4"
							checked={answer === true}
							onChange={() => onAnswerChange(question.id, true)}
						/>
						<span className="ml-2 text-gray-700 dark:text-gray-300">Sim</span>
					</label>
					<label className="inline-flex items-center">
						<input
							type="radio"
							className="form-radio text-orange-600 focus:ring-orange-500 h-4 w-4"
							checked={answer === false}
							onChange={() => onAnswerChange(question.id, false)}
						/>
						<span className="ml-2 text-gray-700 dark:text-gray-300">Não</span>
					</label>
				</div>
			</div>
		</div>
	)
} 