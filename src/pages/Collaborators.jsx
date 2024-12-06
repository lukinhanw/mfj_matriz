import { useState, useEffect, useRef } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import CollaboratorList from '../components/collaborators/CollaboratorList'
import CollaboratorModal from '../components/collaborators/CollaboratorModal'
import CollaboratorFilters from '../components/collaborators/CollaboratorFilters'
import CollaboratorSearch from '../components/collaborators/CollaboratorSearch'
import api from '../utils/api'
import useAuthStore from '../store/authStore'
import { usePermissions } from '../hooks/usePermissions'
import { toast } from 'react-hot-toast'

function Collaborators() {
	const { user, token } = useAuthStore()
	const { can } = usePermissions()
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedCollaborator, setSelectedCollaborator] = useState(null)
	const [filters, setFilters] = useState({
		status: [],
		companies: [],
		departments: [],
		positions: [] // Adicionar positions ao estado inicial
	})
	const [searchTerm, setSearchTerm] = useState('')
	const [companies, setCompanies] = useState([])
	const [departments, setDepartments] = useState([])
	const [positions, setPositions] = useState([]) // Adicionar estado para positions

	const collaboratorListRef = useRef()

	const handleCollaboratorSaved = () => {
		if (collaboratorListRef.current) {
			collaboratorListRef.current.fetchCollaborators()
		}
	}

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [companiesRes, departmentsRes, positionsRes] = await Promise.all([
					api.get('/admin/listarEmpresas', {
						headers: { Authorization: `Bearer ${token}` }
					}),
					api.get('/admin/listarSetores', {
						headers: { Authorization: `Bearer ${token}` }
					}),
					api.get('/admin/listarCargos', {
						headers: { Authorization: `Bearer ${token}` }
					})
				])

				setCompanies(companiesRes.data || [])
				setDepartments(departmentsRes.data || [])
				setPositions(positionsRes.data || []) // Salvar positions no estado
			} catch (error) {
				console.error('Error fetching data:', error)
				toast.error('Erro ao carregar dados')
			}
		}

		if (token) {
			if (token && user.role === 'admin') {
				fetchData()
			}
		}
	}, [token])

	const handleEdit = (collaborator) => {
		setSelectedCollaborator(collaborator)
		setIsModalOpen(true)
	}

	const handleClose = () => {
		setSelectedCollaborator(null)
		setIsModalOpen(false)
	}

	const handleNew = () => {
		setSelectedCollaborator(null)
		setIsModalOpen(true)
	}

	return (
		<div className="space-y-8">
			<div className="sm:flex sm:items-center sm:justify-between">
				<h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Colaboradores</h1>
				{can('canCreateCollaborator') && (
					<button
						type="button"
						onClick={handleNew}
						className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all hover:scale-105 transform"
					>
						<PlusIcon className="h-5 w-5 mr-2" />
						Novo Colaborador
					</button>
				)}
			</div>

			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6">
				<CollaboratorSearch value={searchTerm} onChange={setSearchTerm} />
				<div className="border-t border-gray-200 dark:border-gray-700 pt-6">
					<CollaboratorFilters
						filters={filters}
						onChange={setFilters}
						companies={companies}
						departments={departments}
						positions={positions} // Passar positions como prop
					/>
				</div>
			</div>

			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
				<div className="p-6 border-b border-gray-200 dark:border-gray-700">
					<h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
						Resultados
					</h2>
					<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
						Lista de colaboradores com os filtros aplicados
					</p>
				</div>
				<CollaboratorList
					ref={collaboratorListRef}
					onEdit={handleEdit}
					filters={filters}
					searchTerm={searchTerm}
					companies={companies}
					departments={departments}
				/>
			</div>

			<CollaboratorModal
				open={isModalOpen}
				onClose={handleClose}
				collaborator={selectedCollaborator}
				onCollaboratorSaved={handleCollaboratorSaved}
			/>
		</div>
	)
}

export default Collaborators