import { useState, useEffect } from 'react'
import CreditUsageTable from '../components/reports-buy/CreditUsageTable'
import ReportFilters from '../components/reports-buy/ReportFilters'
import useAuthStore from '../store/authStore'
import api from '../utils/api'
import { toast } from 'react-hot-toast'
import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function ReportsBuy() {
	const [filters, setFilters] = useState({
		period: '30d',
		company: [],
		dateRange: {
			startDate: '',
			endDate: ''
		}
	})

	const [transitions, setTransitions] = useState([])
	const { user, token } = useAuthStore()

	useEffect(() => {
		const fetchData = async () => {
			let url;
			switch (user.role) {
				case 'admin':
					url = 'https://api-matriz-mfj.8bitscompany.com/admin/relatoriosCreditos'
					break
				case 'empresa':
					url = 'https://api-matriz-mfj.8bitscompany.com/company/relatoriosCreditos'
					break
				case 'gestor':
					url = 'https://api-matriz-mfj.8bitscompany.com/manager/relatoriosCreditos'
					break
				case 'colaborador':
					url = 'https://api-matriz-mfj.8bitscompany.com/collaborator/relatoriosCreditos'
					break
			}
			try {
				const response = await api.get(url, {
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
		const unique = [...new Map(
			items
				.filter(item => item[key] && item[key].id) // Adicionado filtro para evitar undefined
				.map(item => [item[key].id, item[key]])
		).values()]
		return unique
	}

	const companies = extractUnique(transitions, 'company')

	const handleExportToExcel = () => {
		const exportData = transitions.map(t => ({
			Data: format(new Date(t.timestamp), "dd/MM/yyyy HH:mm", { locale: ptBR }),
			Empresa: t.company?.name,
			Créditos: t.creditos
		}))

		const ws = XLSX.utils.json_to_sheet(exportData)
		const wb = XLSX.utils.book_new()
		XLSX.utils.book_append_sheet(wb, ws, "Relatório")
		XLSX.writeFile(wb, "relatorio-compras-creditos.xlsx")
	}

	return (
		<div className="space-y-8">
			<div className="sm:flex sm:items-center sm:justify-between">
				<h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Relatórios de vendas de crédito</h1>
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
				/>
			</div>

			{/* Credit Usage Table */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
				<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
					Histórico de Consumo de Créditos
				</h3>
				<CreditUsageTable transitions={transitions} filters={filters} />
			</div>

		</div>
	)
}