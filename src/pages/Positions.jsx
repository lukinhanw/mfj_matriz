import { useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import PositionList from '../components/positions/PositionList'
import PositionModal from '../components/positions/PositionModal'
import PositionFilters from '../components/positions/PositionFilters'
import PositionSearch from '../components/positions/PositionSearch'
import { usePermissions } from '../hooks/usePermissions'

function Positions() {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedPosition, setSelectedPosition] = useState(null)
	const [filters, setFilters] = useState({
		status: []
	})
	const [searchTerm, setSearchTerm] = useState('')
	const [refresh, setRefresh] = useState(false)
	const [itemsPerPage, setItemsPerPage] = useState(10)

	const { can } = usePermissions()

	const handleEdit = (position) => {
		setSelectedPosition(position)
		setIsModalOpen(true)
	}

	const handleClose = () => {
		setSelectedPosition(null)
		setIsModalOpen(false)
	}

	const handleNew = () => {
		setSelectedPosition(null)
		setIsModalOpen(true)
	}

	const refreshPositions = () => {
		setRefresh(!refresh)
	}

	return (
		<div className="space-y-8">
			<div className="sm:flex sm:items-center sm:justify-between">
				<h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Cargos</h1>
				{can('canCreatePosition') && (
					<button
						type="button"
						onClick={handleNew}
						className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all hover:scale-105 transform"
					>
						<PlusIcon className="h-5 w-5 mr-2" />
						Novo Cargo
					</button>
				)}
			</div>

			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6">
				<PositionSearch value={searchTerm} onChange={setSearchTerm} />
				<div className="border-t border-gray-200 dark:border-gray-700 pt-6">
					<PositionFilters filters={filters} onChange={setFilters} />
				</div>
			</div>

			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
				<div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
					<div>
						<h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
							Resultados
						</h2>
						<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
							Lista de cargos com os filtros aplicados
						</p>
					</div>
					<select
						value={itemsPerPage}
						onChange={(e) => setItemsPerPage(e.target.value === 'all' ? 10000 : Number(e.target.value))}
						className="w-32 rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600"
					>
						<option value="10">10 itens</option>
						<option value="50">50 itens</option>
						<option value="100">100 itens</option>
						<option value="500">500 itens</option>
						<option value="1000">1000 itens</option>
						<option value="all">Todos</option>
					</select>
				</div>
				<PositionList
					onEdit={handleEdit}
					filters={filters}
					searchTerm={searchTerm}
					refresh={refresh}
					itemsPerPage={itemsPerPage}
				/>
			</div>

			<PositionModal
				isOpen={isModalOpen}
				onClose={handleClose}
				position={selectedPosition}
				refreshPositions={refreshPositions}
			/>
		</div>
	)
}

export default Positions