import { useState, useEffect } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import ManagerList from '../components/managers/ManagerList'
import ManagerModal from '../components/managers/ManagerModal'
import ManagerFilters from '../components/managers/ManagerFilters'
import ManagerSearch from '../components/managers/ManagerSearch'
import axios from 'axios'
import useAuthStore from '../store/authStore'
import { toast } from 'react-hot-toast'

function Managers() {
	const { token } = useAuthStore()
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedManager, setSelectedManager] = useState(null)
	const [filters, setFilters] = useState({
		status: [],
		companies: [],
		departments: []
	})
	const [searchTerm, setSearchTerm] = useState('')
	const [refresh, setRefresh] = useState(false)
	const [companies, setCompanies] = useState([])
	const [departments, setDepartments] = useState([])

	useEffect(() => {
		const fetchFiltersData = async () => {
			try {
				const [companiesResponse, departmentsResponse] = await Promise.all([
					axios.get('https://api-matriz-mfj.8bitscompany.com/admin/listarEmpresas', {
						headers: { Authorization: `Bearer ${token}` }
					}),
					axios.get('https://api-matriz-mfj.8bitscompany.com/admin/listarSetores', {
						headers: { Authorization: `Bearer ${token}` }
					})
				])

				setCompanies(companiesResponse.data)
				setDepartments(departmentsResponse.data)
			} catch (error) {
				console.error('Error fetching filter data:', error)
				toast.error('Erro ao carregar dados dos filtros')
			}
		}

		if (token) {
			fetchFiltersData()
		}
	}, [token])

	const handleEdit = (manager) => {
		setSelectedManager(manager)
		setIsModalOpen(true)
	}

	const handleClose = () => {
		setSelectedManager(null)
		setIsModalOpen(false)
	}

	const handleNew = () => {
		setSelectedManager(null)
		setIsModalOpen(true)
	}

	const handleSave = () => {
		setIsModalOpen(false);
		setRefresh(!refresh); // Trigger refresh
	}

	return (
		<div className="space-y-8">
			<div className="sm:flex sm:items-center sm:justify-between">
				<h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Gestores</h1>
				<button
					type="button"
					onClick={handleNew}
					className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all hover:scale-105 transform"
				>
					<PlusIcon className="h-5 w-5 mr-2" />
					Novo Gestor
				</button>
			</div>

			{/* Seção de Pesquisa e Filtros */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6">
				<ManagerSearch value={searchTerm} onChange={setSearchTerm} />
				<div className="border-t border-gray-200 dark:border-gray-700 pt-6">
					<ManagerFilters
						filters={filters}
						onChange={setFilters}
						companies={companies}
						departments={departments}
					/>
				</div>
			</div>

			{/* Seção de Resultados */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
				<div className="p-6 border-b border-gray-200 dark:border-gray-700">
					<h2 className="text-lg font-medium text-gray-900 dark:text-white">
						Resultados
					</h2>
					<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
						Lista de gestores com os filtros aplicados
					</p>
				</div>
				<ManagerList
					onEdit={handleEdit}
					filters={filters}
					searchTerm={searchTerm}
					refresh={refresh} // Passamos 'refresh' para o componente ManagerList
				/>
			</div>

			<ManagerModal
				isOpen={isModalOpen}
				onClose={handleClose}
				manager={selectedManager}
				onSave={handleSave} // Chamado após salvar o gestor
			/>
		</div>
	)
}

export default Managers
