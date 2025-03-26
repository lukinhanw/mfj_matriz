export default function QuestionGroup({
	competency,
	questions,
	answers,
	onAnswerChange
}) {
	return (
		<div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
			<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
				{competency}
			</h3>
			<div className="space-y-6">
				{questions.map((question) => (
					<div key={question.id} className="space-y-4">
						<p className="text-gray-700 dark:text-gray-300">{question.pergunta}</p>
						<div className="flex items-center space-x-6">
							<label className="inline-flex items-center">
								<input
									type="radio"
									className="form-radio text-orange-600 focus:ring-orange-500 h-4 w-4"
									checked={answers[question.id] === true}
									onChange={() => onAnswerChange(question.id, true)}
								/>
								<span className="ml-2 text-gray-700 dark:text-gray-300">Sim</span>
							</label>
							<label className="inline-flex items-center">
								<input
									type="radio"
									className="form-radio text-orange-600 focus:ring-orange-500 h-4 w-4"
									checked={answers[question.id] === false}
									onChange={() => onAnswerChange(question.id, false)}
								/>
								<span className="ml-2 text-gray-700 dark:text-gray-300">Não</span>
							</label>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}