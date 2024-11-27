import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function CreditUsageTable({ transitions, filters }) {

	const getDateRange = () => {
		const now = new Date()
		const cutoffDate = new Date(now)

		if (filters.period === 'custom' && filters.dateRange.startDate && filters.dateRange.endDate) {
			const start = new Date(filters.dateRange.startDate)
			const end = new Date(filters.dateRange.endDate)
			start.setHours(0, 0, 0, 0)
			end.setHours(23, 59, 59, 999)
			return { start, end }
		}

		// Ajusta as horas do momento atual
		now.setHours(23, 59, 59, 999)

		switch (filters.period) {
			case '7d':
				cutoffDate.setDate(now.getDate() - 7)
				break
			case '30d':
				cutoffDate.setDate(now.getDate() - 30)
				break
			case '90d':
				cutoffDate.setDate(now.getDate() - 90)
				break
			case '365d':
				cutoffDate.setDate(now.getDate() - 365)
				break
			default:
				cutoffDate.setDate(now.getDate() - 30)
		}

		// Ajusta as horas da data inicial
		cutoffDate.setHours(0, 0, 0, 0)

		return {
			start: cutoffDate,
			end: now
		}
	}

	const filteredTransactions = transitions.filter(transaction => {
		const transactionDate = new Date(transaction.date)
		const { start, end } = getDateRange()

		// Verifica se a data da transação está dentro do intervalo
		if (transactionDate < start || transactionDate > end) {
			return false
		}

		// Filtros de empresa
		if (filters.company.length > 0 && !filters.company.includes(transaction.company.id.toString())) {
			return false
		}

		// Filtros de departamento
		if (filters.department.length > 0 && !filters.department.includes(transaction.department.id.toString())) {
			return false
		}

		// Filtros de curso
		if (filters.course.length > 0 && !filters.course.includes(transaction.course.id.toString())) {
			return false
		}

		return true
	})

	// Ordena as transações por data (mais recentes primeiro)
	const sortedTransactions = [...filteredTransactions].sort((a, b) =>
		new Date(b.date) - new Date(a.date)
	)

	if (filteredTransactions.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500 dark:text-gray-400">Nenhum registro encontrado com os filtros aplicados.</p>
			</div>
		)
	}

	return (
		<div className="overflow-x-auto">
			<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
				<thead className="bg-gray-50 dark:bg-gray-700">
					<tr>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
							Data
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
							Empresa
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
							Setor
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
							Colaborador
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
							Curso
						</th>
						<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
							Créditos
						</th>
					</tr>
				</thead>
				<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
					{sortedTransactions.map((transaction) => (
						<tr key={transaction?.id}>
							<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
								{format(new Date(transaction?.date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
							</td>
							<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
								{transaction?.company?.name}
							</td>
							<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
								{transaction?.department?.name}
							</td>
							<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
								{transaction?.employee?.name}
							</td>
							<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
								{transaction?.course?.name}
							</td>
							<td className="text-center px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
								{transaction?.course?.credits}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

export default CreditUsageTable