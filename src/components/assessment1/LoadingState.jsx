export default function LoadingState() {
	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="text-center">
				<div className="loader"></div>
				<p className="mt-4 text-gray-600 dark:text-gray-400">
					Carregando avaliação...
				</p>
			</div>
		</div>
	)
}