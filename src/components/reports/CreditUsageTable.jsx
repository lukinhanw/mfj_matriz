import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useEffect, useState } from 'react'
import useAuthStore from '../../store/authStore'
import axios from 'axios'

// Mock data - substituir por dados da API
const mockTransactions = [
	{
		id: 1,
		date: '2024-11-15T10:30:00',
		manager: {
			id: 1,
			name: 'João Silva Sauro'
		},
		employee: {
			id: 1,
			name: 'Ana Santos'
		},
		course: {
			id: 1,
			name: 'React Básico',
			credits: 2
		},
		company: {
			id: 1,
			name: 'Empresa A'
		},
		department: {
			id: 1,
			name: 'TI'
		}
	},
	{
		id: 2,
		date: '2024-10-04T15:45:00',
		manager: {
			id: 2,
			name: 'Maria Oliveira'
		},
		employee: {
			id: 2,
			name: 'Pedro Costa'
		},
		course: {
			id: 2,
			name: 'JavaScript Avançado',
			credits: 3
		},
		company: {
			id: 1,
			name: 'Empresa A'
		},
		department: {
			id: 2,
			name: 'RH'
		}
	},
	{
		id: 3,
		date: '2024-10-02T09:15:00',
		manager: {
			id: 1,
			name: 'João Silva'
		},
		employee: {
			id: 3,
			name: 'Carlos Mendes'
		},
		course: {
			id: 3,
			name: 'Node.js Básico',
			credits: 2
		},
		company: {
			id: 2,
			name: 'Empresa B'
		},
		department: {
			id: 3,
			name: 'Desenvolvimento'
		}
	},
	{
		id: 4,
		date: '2024-11-06T14:20:00',
		manager: {
			id: 3,
			name: 'Roberto Alves'
		},
		employee: {
			id: 4,
			name: 'Mariana Costa'
		},
		course: {
			id: 4,
			name: 'Python para Análise de Dados',
			credits: 4
		},
		company: {
			id: 2,
			name: 'Empresa B'
		},
		department: {
			id: 4,
			name: 'Dados'
		}
	},
	{
		id: 5,
		date: '2024-11-06T11:30:00',
		manager: {
			id: 2,
			name: 'Maria Oliveira'
		},
		employee: {
			id: 5,
			name: 'Lucas Silva'
		},
		course: {
			id: 5,
			name: 'UX/UI Design',
			credits: 3
		},
		company: {
			id: 1,
			name: 'Empresa A'
		},
		department: {
			id: 5,
			name: 'Design'
		}
	}
]

function CreditUsageTable({ filters }) {

	const { token } = useAuthStore()
	const [transitions, setTransitions] = useState([])
	const [isLoading, setIsLoading] = useState(false)

	useEffect (() => {
		const fetchData = async () => {
			try {
				setIsLoading(true)
				const response = await axios.get(
					'https://api-matriz-mfj.8bitscompany.com/admin/relatorios',
					{
						headers: { Authorization: `Bearer ${token}` }
					}
				)
				setTransitions(response.data)
			} catch (error) {
				console.error('Error fetching collaborators:', error)
				toast.error('Erro ao carregar colaboradores')
			} finally {
				setIsLoading(false)
			}
		}

		if (token) {
			fetchData()
		}
	}, [token])

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

	if (isLoading) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500 dark:text-gray-400">Carregando transições...</p>
			</div>
		)
	}

	if (sortedTransactions.length === 0) {
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
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
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
							<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
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