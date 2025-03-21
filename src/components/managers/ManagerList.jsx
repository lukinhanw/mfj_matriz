import { useState, useEffect, forwardRef, useImperativeHandle, useMemo } from 'react'
import { toast } from 'react-hot-toast'
import {
	PencilIcon,
	TrashIcon,
	NoSymbolIcon,
	CheckCircleIcon
} from '@heroicons/react/24/outline'
import ConfirmationModal from '../common/ConfirmationModal'
import api from '../../utils/api'  // Adicionar esta importação
import useAuthStore from '../../store/authStore'
import { formatCpfCnpj, formatPhoneNumber } from '../../utils/helpers'
import { usePermissions } from '../../hooks/usePermissions'

const ManagerList = forwardRef(({ onEdit, filters, searchTerm }, ref) => {

	const { user, token } = useAuthStore()
	const { can } = usePermissions()
	const [managers, setManagers] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const [confirmModal, setConfirmModal] = useState({
		show: false,
		type: null, // 'delete' or 'status'
		managerId: null,
		currentStatus: null
	})
	const [currentPage, setCurrentPage] = useState(1)
	const [itemsPerPage, setItemsPerPage] = useState(10)

	const fetchManagers = async () => {
		try {
			setIsLoading(true)
			let url;
			switch (user.role) {
				case 'admin':
					url = '/admin/listarGestores'
					break
				case 'empresa':
					url = '/company/listarGestores'
					break
				case 'gestor':
					url = '/manager/listarGestores'
					break
				case 'colaborador':
					url = '/collaborator/listarGestores'
					break
			}
			const response = await api.get(url, {
				headers: { Authorization: `Bearer ${token}` }
			})
			setManagers(response.data)
		} catch (error) {
			console.error('Error fetching managers:', error)
			toast.error(
				<div>
					<span className="font-medium text-red-600">Erro ao carregar gestores</span>
					<br />
					<span className="text-sm text-red-950">Tente novamente mais tarde</span>
				</div>
			)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		if (token) {
			fetchManagers()
		}
	}, [token])

	useImperativeHandle(ref, () => ({
		fetchManagers
	}))

	const handleDelete = async () => {
		try {
			await api.delete(
				'/admin/deletarGestor',
				{
					headers: { Authorization: `Bearer ${token}` },
					data: { managerId: confirmModal.managerId }
				}
			)
			toast.success(
				<div>
					<span className="font-medium text-green-600">Sucesso!</span>
					<br />
					<span className="text-sm text-green-950">Gestor removido com sucesso</span>
				</div>
			)
			// Atualiza a lista após deletar
			fetchManagers()
			setConfirmModal({ show: false, type: null, managerId: null, currentStatus: null })
		} catch (error) {
			console.error('Error remover gestor:', error)
			const errorMessage = error.response?.data?.error || 'Erro ao deletar gestor: Erro desconhecido'
			const titleMessage = errorMessage.split(":")[0]
			const bodyMessage = errorMessage.split(":")[1]
			toast.error(
				<div>
					<span className="font-medium text-red-600">{titleMessage}</span>
					<br />
					<span className="text-sm text-red-950">{bodyMessage}</span>
				</div>
			)
		}
	}

	const handleToggleStatus = async () => {
		try {
			const { managerId, currentStatus } = confirmModal
			const newStatus = currentStatus === "active" ? "inactive" : "active"
			const endpoint =
				newStatus === "active"
					? 'ativarGestor'
					: 'desativarGestor'

			await api.put(
				`/admin/${endpoint}`,
				{ managerId: managerId },
				{ headers: { Authorization: `Bearer ${token}` } }
			)

			toast.success(
				<div>
					<span className="font-medium text-green-600">Sucesso!</span>
					<br />
					<span className="text-sm text-green-950">Status alterado com sucesso</span>
				</div>
			)
			// Atualiza a lista após alterar o status
			fetchManagers()
			setConfirmModal({ show: false, type: null, managerId: null, currentStatus: null })
		} catch (error) {
			console.error('Error toggling manager status:', error)
			toast.error('Erro ao alterar status')
		}
	}

	const openConfirmModal = (type, id, currentStatus = null) => {
		setConfirmModal({
			show: true,
			type,
			managerId: id,
			currentStatus
		})
	}

	const filteredManagers = useMemo(() => {
		return managers.filter(manager => {
			// Search filter
			if (searchTerm) {
				const search = searchTerm.toLowerCase()
				const searchMatch =
					manager.name?.toLowerCase().includes(search) ||
					manager.phone?.toLowerCase().includes(search) ||
					manager.email?.toLowerCase().includes(search)
				if (!searchMatch) return false
			}

			// Status filter
			if (filters.status.length > 0 && !filters.status.includes(manager.status)) {
				return false
			}

			// Company filter
			if (filters.companies.length > 0 && !filters.companies.includes(manager.company?.id?.toString())) {
				return false
			}

			// Department filter
			if (filters.departments.length > 0 && !filters.departments.includes(manager.department?.id?.toString())) {
				return false
			}

			return true
		});
	}, [managers, searchTerm, filters]);

	const totalPages = Math.ceil(filteredManagers.length / itemsPerPage);

	const paginatedManagers = useMemo(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return filteredManagers.slice(start, start + itemsPerPage);
	}, [filteredManagers, currentPage, itemsPerPage]);

	const handleItemsPerPageChange = (e) => {
		setItemsPerPage(Number(e.target.value));
		setCurrentPage(1);
	};

	const renderStatusIcon = (status) => {
		return status === 'active' ? (
			<span className="inline-flex h-2 w-2 rounded-full bg-green-500 mr-2" title="Ativo" />
		) : (
			<span className="inline-flex h-2 w-2 rounded-full bg-red-500 mr-2" title="Inativo" />
		);
	};

	const renderActionButtons = (manager) => (
		<div className="flex items-center justify-end space-x-2">
			{can('canEditManager') && (
				<>
					<button
						onClick={() => onEdit(manager)}
						className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-900 transition-colors duration-200"
						title="Editar"
					>
						<PencilIcon className="h-5 w-5" />
					</button>

					<button
						onClick={() => openConfirmModal('status', manager.id, manager.status)}
						className={`${manager.status === "active"
							? 'text-red-600 hover:text-red-900'
							: 'text-green-600 hover:text-green-900'
							} transition-colors duration-200`}
						title={manager.status === "active" ? 'Desativar' : 'Ativar'}
					>
						{manager.status === "active" ? (
							<NoSymbolIcon className="h-5 w-5" />
						) : (
							<CheckCircleIcon className="h-5 w-5" />
						)}
					</button>
				</>
			)}
			{can('canDeleteManager') && (
				<button
					onClick={() => openConfirmModal('delete', manager.id)}
					className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-900 transition-colors duration-200"
					title="Excluir"
				>
					<TrashIcon className="h-5 w-5" />
				</button>
			)}
		</div>
	);

	return (
		<div className="overflow-hidden">
			{isLoading && (
				<div className="p-6 text-center">
					<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
					<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Carregando gestores...</p>
				</div>
			)}

			{!isLoading && filteredManagers.length === 0 && (
				<div className="p-6 text-center">
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Nenhum gestor encontrado com os filtros selecionados.
					</p>
				</div>
			)}

			{!isLoading && filteredManagers.length > 0 && (
				<>
					<div className="flex justify-between mb-4 px-6 py-2">
						<div>
							<label htmlFor="itemsPerPage" className="mr-2 text-sm text-gray-700 dark:text-gray-300">
								Itens por página:
							</label>
							<select
								id="itemsPerPage"
								value={itemsPerPage}
								onChange={handleItemsPerPageChange}
								className="mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-gray-100"
							>
								<option value={5}>5</option>
								<option value={10}>10</option>
								<option value={20}>20</option>
								<option value={50}>50</option>
							</select>
						</div>
						{totalPages > 1 && (
							<div className="flex items-center space-x-3">
								<button
									onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
									disabled={currentPage === 1}
									className={`px-2 py-1 text-sm border rounded-md transition-colors
										${currentPage === 1
											? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
											: 'bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
										}`}
								>
									Anterior
								</button>
								<span className="text-xs text-gray-600 dark:text-gray-400">
									Página {currentPage} de {totalPages}
								</span>
								<button
									onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
									disabled={currentPage === totalPages}
									className={`px-2 py-1 text-sm border rounded-md transition-colors
										${currentPage === totalPages
											? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
											: 'bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
										}`}
								>
									Próxima
								</button>
							</div>
						)}
					</div>

					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
							<thead className="bg-gray-50 dark:bg-gray-700">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-4/12">
										Gestor
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-3/12">
										Informações
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-2/12">
										Empresa
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-2/12">
										Setor
									</th>
									<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/12 sticky right-0 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
										Ações
									</th>
								</tr>
							</thead>
							<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
								{paginatedManagers.map((manager) => (
									<tr key={manager.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700">
										<td className="px-6 py-4">
											<div className="flex items-center">
												{renderStatusIcon(manager.status)}
												<div>
													<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
														{manager.name}
													</div>
													<div className="text-sm text-gray-500 dark:text-gray-400">
														{manager.email}
													</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="text-sm text-gray-500 dark:text-gray-400">
												<div>CPF: {formatCpfCnpj(manager.cpf)}</div>
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="text-sm text-gray-500 dark:text-gray-400">
												{manager.company?.name || '-'}
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="text-sm text-gray-500 dark:text-gray-400">
												{manager.department?.name || '-'}
											</div>
										</td>
										<td className="px-6 py-4">
											{renderActionButtons(manager)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Pagination bottom */}
					<div className="flex justify-between items-center mt-4 p-4 border-t border-gray-200 dark:border-gray-700">
						<span className="text-sm text-gray-700 dark:text-gray-300">
							Exibindo {paginatedManagers.length} de {filteredManagers.length} gestores
						</span>
						{totalPages > 1 && (
							<div className="flex items-center space-x-3">
								<button
									onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
									disabled={currentPage === 1}
									className={`px-2 py-1 text-sm border rounded-md transition-colors
										${currentPage === 1
											? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
											: 'bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
										}`}
								>
									Anterior
								</button>
								<span className="text-xs text-gray-600 dark:text-gray-400">
									Página {currentPage} de {totalPages}
								</span>
								<button
									onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
									disabled={currentPage === totalPages}
									className={`px-2 py-1 text-sm border rounded-md transition-colors
										${currentPage === totalPages
											? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
											: 'bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
										}`}
								>
									Próxima
								</button>
							</div>
						)}
					</div>
				</>
			)}

			{/* Modal de confirmação de exclusão */}
			<ConfirmationModal
				isOpen={confirmModal.show && confirmModal.type === 'delete'}
				onClose={() => setConfirmModal({ show: false, type: null, managerId: null, currentStatus: null })}
				onConfirm={handleDelete}
				title="Excluir Gestor"
				message="Tem certeza que deseja excluir este gestor? Esta ação não pode ser desfeita."
				confirmText="Excluir"
				confirmStyle="danger"
			/>

			{/* Modal de confirmação de alteração de status */}
			<ConfirmationModal
				isOpen={confirmModal.show && confirmModal.type === 'status'}
				onClose={() => setConfirmModal({ show: false, type: null, managerId: null, currentStatus: null })}
				onConfirm={handleToggleStatus}
				title={`${confirmModal.currentStatus === "active" ? 'Desativar' : 'Ativar'} Gestor`}
				message={`Tem certeza que deseja ${confirmModal.currentStatus === "active" ? 'desativar' : 'ativar'} este gestor?`}
				confirmText={confirmModal.currentStatus === "active" ? 'Desativar' : 'Ativar'}
				confirmStyle={confirmModal.currentStatus === "active" ? 'danger' : 'success'}
			/>
		</div>
	)
})

export default ManagerList
