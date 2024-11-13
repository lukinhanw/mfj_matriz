import { useState } from 'react'
import CreditUsageTable from '../components/reports_buy/CreditUsageTable'
import ReportFilters from '../components/reports_buy/ReportFilters'

export default function ReportsBuy() {
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

	return (
		<div className="space-y-8">
			<div className="sm:flex sm:items-center sm:justify-between">
				<h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Relatórios das compras de crédito</h1>
			</div>

			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
				<ReportFilters filters={filters} onChange={setFilters} />
			</div>

			{/* Credit Usage Table */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
				<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
					Histórico de Compra de Créditos
				</h3>
				<CreditUsageTable filters={filters} />
			</div>

		</div>
	)
}