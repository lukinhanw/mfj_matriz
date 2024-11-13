import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import {
	PencilIcon,
	TrashIcon,
	NoSymbolIcon,
	CheckCircleIcon
} from '@heroicons/react/24/outline'
import ConfirmationModal from '../common/ConfirmationModal'
import axios from 'axios'
import useAuthStore from '../../store/authStore'
import { formatCpfCnpj, formatPhoneNumber } from '../../utils/helpers'

export default function ManagerList({ onEdit, filters, searchTerm, refresh }) {
	
	const { token } = useAuthStore()
	const [managers, setManagers] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const [confirmModal, setConfirmModal] = useState({
		show: false,
		type: null, // 'delete' or 'status'
		managerId: null,
		currentStatus: null
	})

	useEffect(() => {
		const fetchManagers = async () => {
			try {
				setIsLoading(true)
				const response = await axios.get(
					'https://api-matriz-mfj.8bitscompany.com/admin/listarGestores',
					{
						headers: { Authorization: `Bearer ${token}` }
					}
				)
				setManagers(response.data)
			} catch (error) {
				console.error('Error fetching managers:', error)
				toast.error('Erro ao carregar gestores')
			} finally {
				setIsLoading(false)
			}
		}

		if (token) {
			fetchManagers()
		}
	}, [token, refresh]) // Incluímos 'refresh' para recarregar a lista após uma alteração

	const handleDelete = async () => {
		try {
			await axios.delete(
				'https://api-matriz-mfj.8bitscompany.com/admin/deletarGestor',
				{
					data: { managerId: confirmModal.managerId },
					headers: { Authorization: `Bearer ${token}` }
				}
			)
			toast.success('Gestor removido com sucesso!')
			// Remove o gestor deletado da lista
			setManagers(prev => prev.filter(manager => manager.id !== confirmModal.managerId))
			setConfirmModal({ show: false, type: null, managerId: null, currentStatus: null })
		} catch (error) {
			console.error('Error deleting manager:', error)
			toast.error('Erro ao remover gestor')
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

			await axios.put(
				`https://api-matriz-mfj.8bitscompany.com/admin/${endpoint}`,
				{ managerId: managerId },
				{
					headers: { Authorization: `Bearer ${token}` }
				}
			)

			toast.success(`Status alterado com sucesso!`)
			// Atualiza o status na lista
			setManagers(prevManagers =>
				prevManagers.map(manager =>
					manager.id === managerId ? { ...manager, status: newStatus } : manager
				)
			)
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

	const filteredManagers = managers.filter(manager => {

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
	})

	if (isLoading) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500">Carregando gestores...</p>
			</div>
		)
	}

	if (filteredManagers.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500">Nenhum gestor encontrado com os filtros aplicados.</p>
			</div>
		)
	}

	return (
		<>
			<div className="overflow-x-auto">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							{/* Cabeçalhos da tabela */}
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Nome
							</th>
							{/* Outros cabeçalhos */}
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Email
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								CPF
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Telefone
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Setor
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Empresa
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Status
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Ações
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{filteredManagers.map((manager) => (
							<tr key={manager.id}>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm font-medium text-gray-900">
										{manager.name}
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm text-gray-500">{manager.email}</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm text-gray-500">{formatCpfCnpj(manager.cpf)}</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm text-gray-500">{formatPhoneNumber(manager.phone)}</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm text-gray-500">{manager.department.name || 'N/A'}</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm text-gray-500">{manager.company.name || 'N/A'}</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span
										className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${manager.status === "active"
												? 'bg-green-100 text-green-800'
												: 'bg-red-100 text-red-800'
											}`}
									>
										{manager.status === "active" ? 'Ativo' : 'Inativo'}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
									<button
										onClick={() => onEdit(manager)}
										className="text-primary-600 hover:text-primary-900 mr-4"
										title="Editar"
									>
										<PencilIcon className="h-5 w-5" />
									</button>
									<button
										onClick={() => openConfirmModal('status', manager.id, manager.status)}
										className={`${manager.status === "active"
												? 'text-red-600 hover:text-red-900'
												: 'text-green-600 hover:text-green-900'
											} mr-4`}
										title={manager.status === "active" ? 'Desativar' : 'Ativar'}
									>
										{manager.status === "active" ? (
											<NoSymbolIcon className="h-5 w-5" />
										) : (
											<CheckCircleIcon className="h-5 w-5" />
										)}
									</button>
									<button
										onClick={() => openConfirmModal('delete', manager.id)}
										className="text-red-600 hover:text-red-900"
										title="Excluir"
									>
										<TrashIcon className="h-5 w-5" />
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

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
		</>
	)
}
