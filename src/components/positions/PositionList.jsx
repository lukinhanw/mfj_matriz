import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import {
	PencilIcon,
	TrashIcon,
} from '@heroicons/react/24/outline'
import ConfirmationModal from '../common/ConfirmationModal'
import useAuthStore from '../../store/authStore'
import api from '../../utils/api'
import { usePermissions } from '../../hooks/usePermissions'

function PositionList({ onEdit, filters, searchTerm, refresh, itemsPerPage }) {
	const [positions, setPositions] = useState([])
	const [loading, setLoading] = useState(true)
	const [currentPage, setCurrentPage] = useState(1)
	const { token } = useAuthStore()
	const { can } = usePermissions()

	useEffect(() => {
		const fetchPositions = async () => {
			try {
				const response = await api.get('/admin/listarCargos', {
					headers: { Authorization: `Bearer ${token}` }
				})
				setPositions(response.data)
			} catch (error) {
				console.error('Erro ao carregar cargos:', error)
				toast.error('Erro ao carregar lista de cargos')
			} finally {
				setLoading(false)
			}
		}

		fetchPositions()
	}, [refresh])

	const [confirmModal, setConfirmModal] = useState({
		show: false,
		positionId: null,
	})

	const handleDelete = async () => {
		try {
			// Mock API call
			await new Promise(resolve => setTimeout(resolve, 500))

			toast.success(
				<div>
					<span className="font-medium text-green-600">Sucesso!</span>
					<br />
					<span className="text-sm text-green-950">Cargo removido com sucesso</span>
				</div>
			)
			setConfirmModal({ show: false, positionId: null })
		} catch (error) {
			console.error('Error deleting position:', error)
			toast.error('Erro ao deletar cargo')
			setConfirmModal({ show: false, positionId: null })
		}
	}

	const openConfirmModal = (id) => {
		setConfirmModal({
			show: true,
			positionId: id,
		})
	}

	const filteredPositions = positions.filter(position => {
		if (searchTerm) {
			const search = searchTerm.toLowerCase()
			if (!position.name.toLowerCase().includes(search)) {
				return false
			}
		}
		return true
	})

	const totalPages = Math.ceil(filteredPositions.length / itemsPerPage)
	const startIndex = (currentPage - 1) * itemsPerPage
	const endIndex = startIndex + itemsPerPage
	const currentPositions = filteredPositions.slice(startIndex, endIndex)

	if (loading) {
		return (
			<div className="flex justify-center items-center py-12">
				<div className="loader"></div>
			</div>
		)
	}

	if (filteredPositions.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500 dark:text-gray-400">Nenhum cargo encontrado com os filtros aplicados.</p>
			</div>
		)
	}

	return (
		<>
			<div className="overflow-x-auto">
				<table className="min-w-full divide-y divide-gray-700">
					<thead className="bg-gray-50 dark:bg-gray-700">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Nome
							</th>
							<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Ações
							</th>
						</tr>
					</thead>
					<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
						{currentPositions.map((position) => (
							<tr key={position.id}>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
										{position.name}
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
									{can('canEditPosition') && (
										<button
											onClick={() => onEdit(position)}
											className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-900 mr-4 transition-colors duration-200"
											title="Editar"
										>
											<PencilIcon className="h-5 w-5" />
										</button>
									)}
									{can('canDeletePosition') && (
										<button
											onClick={() => openConfirmModal(position.id)}
											className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-900 transition-colors duration-200"
											title="Excluir"
										>
											<TrashIcon className="h-5 w-5" />
										</button>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{filteredPositions.length > itemsPerPage && (
				<div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 sm:px-6">
					<div className="flex flex-1 justify-between sm:hidden">
						<button
							onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
							disabled={currentPage === 1}
							className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
						>
							Anterior
						</button>
						<button
							onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
							disabled={currentPage === totalPages}
							className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
						>
							Próximo
						</button>
					</div>
					<div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
						<div>
							<p className="text-sm text-gray-700 dark:text-gray-300">
								Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
								<span className="font-medium">{Math.min(endIndex, filteredPositions.length)}</span> de{' '}
								<span className="font-medium">{filteredPositions.length}</span> resultados
							</p>
						</div>
						<div>
							<nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
								<button
									onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
									disabled={currentPage === 1}
									className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0"
								>
									<span className="sr-only">Anterior</span>
									<svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
										<path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
									</svg>
								</button>
								<button
									onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
									disabled={currentPage === totalPages}
									className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0"
								>
									<span className="sr-only">Próximo</span>
									<svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
										<path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
									</svg>
								</button>
							</nav>
						</div>
					</div>
				</div>
			)}

			<ConfirmationModal
				isOpen={confirmModal.show}
				onClose={() => setConfirmModal({ show: false, positionId: null })}
				onConfirm={handleDelete}
				title="Excluir Cargo"
				message="Tem certeza que deseja excluir este cargo? Esta ação não pode ser desfeita."
				confirmText="Excluir"
				confirmStyle="danger"
			/>
		</>
	)
}

export default PositionList