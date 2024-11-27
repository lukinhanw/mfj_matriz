import { useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import DepartmentList from '../components/departments/DepartmentList'
import DepartmentModal from '../components/departments/DepartmentModal'
import DepartmentFilters from '../components/departments/DepartmentFilters'
import DepartmentSearch from '../components/departments/DepartmentSearch'

function Departments() {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedDepartment, setSelectedDepartment] = useState(null)
	const [filters, setFilters] = useState({
		status: [],
		company: []
	})
	const [searchTerm, setSearchTerm] = useState('')
	const [refresh, setRefresh] = useState(false)

	const handleEdit = (department) => {
		setSelectedDepartment(department)
		setIsModalOpen(true)
	}

	const handleClose = () => {
		setSelectedDepartment(null)
		setIsModalOpen(false)
	}

	const handleNew = () => {
		setSelectedDepartment(null)
		setIsModalOpen(true)
	}

	const refreshDepartments = () => {
		setRefresh(!refresh)
	}

	return (
		<div className="space-y-8">
			<div className="sm:flex sm:items-center sm:justify-between">
				<h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Setores</h1>
				<button
					type="button"
					onClick={handleNew}
					className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all hover:scale-105 transform"
				>
					<PlusIcon className="h-5 w-5 mr-2" />
					Novo Setor
				</button>
			</div>

			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6">
				<DepartmentSearch value={searchTerm} onChange={setSearchTerm} />
			</div>

			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
				<div className="p-6 border-b border-gray-200 dark:border-gray-700">
					<h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
						Resultados
					</h2>
					<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
						Lista de setores com os filtros aplicados
					</p>
				</div>
				<DepartmentList
					onEdit={handleEdit}
					filters={filters}
					searchTerm={searchTerm}
					refresh={refresh}
				/>
			</div>

			<DepartmentModal
				isOpen={isModalOpen}
				onClose={handleClose}
				department={selectedDepartment}
				refreshDepartments={refreshDepartments}
			/>
		</div>
	)
}

export default Departments