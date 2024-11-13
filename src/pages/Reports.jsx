import { useState } from 'react'
import CreditUsageTable from '../components/reports/CreditUsageTable'
import CreditAllocationChart from '../components/reports/CreditAllocationChart'
import ReportFilters from '../components/reports/ReportFilters'

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

	return (
		<div className="space-y-8">
			<div className="sm:flex sm:items-center sm:justify-between">
				<h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Relatórios do uso de créditos</h1>
			</div>

			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
				<ReportFilters filters={filters} onChange={setFilters} />
			</div>

			{/* Credit Usage Table */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
				<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
					Histórico de Consumo de Créditos
				</h3>
				<CreditUsageTable filters={filters} />
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