export default function QuestionGroup({
	competency,
	questions,
	answers,
	onAnswerChange,
	validationErrors = []
}) {
	return (
		<div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
			<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
				{competency}
			</h3>
			<div className="space-y-6">
				{questions.map((question) => {
					const isError = validationErrors.includes(question.id);
					return (
						<div 
							key={question.id} 
							className={`space-y-4 ${isError ? 'p-3 border border-red-300 dark:border-red-800 rounded-md bg-red-50 dark:bg-red-900/20' : ''}`}
						>
							<p className={`${isError ? 'text-red-800 dark:text-red-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
								{question.text || question.pergunta}
								<span className="text-red-600 ml-1">*</span>
							</p>
							<div className="flex items-center space-x-6">
								<label className="inline-flex items-center">
									<input
										type="radio"
										className={`form-radio h-4 w-4 ${isError ? 'text-red-600 focus:ring-red-500' : 'text-orange-600 focus:ring-orange-500'}`}
										checked={answers[question.id] === true}
										onChange={() => onAnswerChange(question.id, true)}
									/>
									<span className={`ml-2 ${isError ? 'text-red-800 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>Sim</span>
								</label>
								<label className="inline-flex items-center">
									<input
										type="radio"
										className={`form-radio h-4 w-4 ${isError ? 'text-red-600 focus:ring-red-500' : 'text-orange-600 focus:ring-orange-500'}`}
										checked={answers[question.id] === false}
										onChange={() => onAnswerChange(question.id, false)}
									/>
									<span className={`ml-2 ${isError ? 'text-red-800 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>Não</span>
								</label>
							</div>
							{isError && (
								<p className="text-sm text-red-600 dark:text-red-400">Esta questão é obrigatória</p>
							)}
						</div>
					);
				})}
			</div>
		</div>
	)
}