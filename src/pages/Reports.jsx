import { useState, useEffect } from 'react'
import CreditUsageTable from '../components/reports/CreditUsageTable'
import CreditAllocationChart from '../components/reports/CreditAllocationChart'
import ReportFilters from '../components/reports/ReportFilters'
import useAuthStore from '../store/authStore'
import api from '../utils/api'
import { toast } from 'react-hot-toast'
import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Reports() {
	const [filters, setFilters] = useState({
		period: '30d',
		company: [],
		department: [],
		course: [],
		dateRange: {
			startDate: '',
			endDate: ''
		}
	})

	const [transitions, setTransitions] = useState([])
	const { user, token } = useAuthStore()

	useEffect(() => {
		const fetchData = async () => {
			let endpoint;
			switch (user.role) {
				case 'admin':
					endpoint = '/admin/relatorios'
					break
				case 'empresa':
					endpoint = '/company/relatorios'
					break
				case 'gestor':
					endpoint = '/manager/relatorios'
					break
				case 'colaborador':
					endpoint = '/collaborator/relatorios'
					break
			}
			try {
				const response = await api.get(endpoint, {
					headers: { Authorization: `Bearer ${token}` }
				})
				setTransitions(response.data)
			} catch (error) {
				console.error('Erro ao buscar dados do relatórios:', error)
				toast.error('Erro ao carregar dados do relatórios')
			}
		}

		if (token) {
			fetchData()
		}
	}, [token])

	const extractUnique = (items, key) => {
		const unique = [...new Map(items.map(item => [item[key].id, item[key]])).values()]
		return unique
	}

	const departments = extractUnique(transitions, 'department')
	const courses = extractUnique(transitions, 'course')
	const companies = extractUnique(transitions, 'company')

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

		cutoffDate.setHours(0, 0, 0, 0)
		return { start: cutoffDate, end: now }
	}

	const getFilteredTransactions = () => {
		return transitions.filter(transaction => {
			const transactionDate = new Date(transaction.date)
			const { start, end } = getDateRange()

			if (transactionDate < start || transactionDate > end) {
				return false
			}

			if (filters.company.length > 0 && !filters.company.includes(transaction.company.id.toString())) {
				return false
			}

			if (filters.department.length > 0 && !filters.department.includes(transaction.department.id.toString())) {
				return false
			}

			if (filters.course.length > 0 && !filters.course.includes(transaction.course.id.toString())) {
				return false
			}

			return true
		})
	}

	const handleExportToExcel = () => {
		const filteredTransactions = getFilteredTransactions()
		const exportData = filteredTransactions.map(t => ({
			Data: format(new Date(t.date), "dd/MM/yyyy HH:mm", { locale: ptBR }),
			Empresa: t.company?.name,
			Setor: t.department?.name,
			Colaborador: t.employee?.name,
			Curso: t.course?.name,
			Créditos: t.course?.credits
		}))

		const ws = XLSX.utils.json_to_sheet(exportData)
		const wb = XLSX.utils.book_new()
		XLSX.utils.book_append_sheet(wb, ws, "Relatório")
		XLSX.writeFile(wb, "relatorio-creditos.xlsx")
	}

	return (
		<div className="space-y-8">
			<div className="sm:flex sm:items-center sm:justify-between">
				<h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Relatórios do uso de créditos</h1>
				<button
					onClick={handleExportToExcel}
					className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
				>
					Exportar para Excel
				</button>
			</div>

			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
				<ReportFilters
					filters={filters}
					onChange={setFilters}
					companies={companies}
					departments={departments}
					courses={courses}
				/>
			</div>

			{/* Credit Usage Table */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
				<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
					Histórico de Consumo de Créditos
				</h3>
				<CreditUsageTable transitions={transitions} filters={filters} />
			</div>

			{/* Credit Allocation Chart */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
				<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
					Alocação de Créditos por Curso
				</h3>
				<div className="h-80">
					<CreditAllocationChart filters={filters} />
				</div>
			</div>
		</div>
	)
}