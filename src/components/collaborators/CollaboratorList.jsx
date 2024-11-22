import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { toast } from 'react-hot-toast'
import {
	PencilIcon,
	TrashIcon,
	NoSymbolIcon,
	CheckCircleIcon,
	AcademicCapIcon
} from '@heroicons/react/24/outline'
import ConfirmationModal from '../common/ConfirmationModal'
import CourseAssignmentModal from './CourseAssignmentModal'
import axios from 'axios'
import useAuthStore from '../../store/authStore'
import { formatCpfCnpj, formatPhoneNumber } from '../../utils/helpers'
import CollaboratorModal from './CollaboratorModal'
import { usePermissions } from '../../hooks/usePermissions'

const CollaboratorList = forwardRef(({ onEdit, filters, searchTerm }, ref) => {
	const { user, token } = useAuthStore()
	const { can } = usePermissions()
	const [collaborators, setCollaborators] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const [confirmModal, setConfirmModal] = useState({
		show: false,
		type: null,
		collaboratorId: null,
		currentStatus: null
	})
	const [courseModal, setCourseModal] = useState({
		show: false,
		collaborator: null
	})
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedCollaborator, setSelectedCollaborator] = useState(null);

	const fetchCollaborators = async () => {
		let url;
		switch (user.role) {
			case 'admin':
				url = 'https://api-matriz-mfj.8bitscompany.com/admin/listarColaboradores'
				break
			case 'empresa':
				url = 'https://api-matriz-mfj.8bitscompany.com/company/listarColaboradores'
				break
			case 'gestor':
				url = 'https://api-matriz-mfj.8bitscompany.com/manager/listarColaboradores'
				break
			case 'colaborador':
				url = 'https://api-matriz-mfj.8bitscompany.com/collaborator/listarColaboradores'
				break
		}
		try {
			setIsLoading(true)
			const response = await axios.get(
				url,
				{
					headers: { Authorization: `Bearer ${token}` }
				}
			)
			setCollaborators(response.data)
		} catch (error) {
			console.error('Error fetching collaborators:', error.response.data.error)
			toast.error('Erro ao carregar colaboradores')
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		if (token) {
			fetchCollaborators()
		}
	}, [token])

	useImperativeHandle(ref, () => ({
		fetchCollaborators
	}))

	const handleCollaboratorSaved = () => {
		fetchCollaborators();
	}

	const handleDelete = async () => {
		try {
			await axios.delete(
				'https://api-matriz-mfj.8bitscompany.com/admin/deletarColaborador',
				{
					headers: { Authorization: `Bearer ${token}` },
					data: { collaboratorId: confirmModal.collaboratorId }
				}
			)

			setCollaborators((prev) =>
				prev.filter((collab) => collab.id !== confirmModal.collaboratorId)
			)

			toast.success(
				<div>
					<span className="font-medium text-green-600">Sucesso!</span>
					<br />
					<span className="text-sm text-green-950">Colaborador deletado com sucesso</span>
				</div>
			)
			setConfirmModal({
				show: false,
				type: null,
				collaboratorId: null,
				currentStatus: null
			})
		} catch (error) {
			console.error('Error deleting collaborator:', error)
			const errorMessage = error.response?.data?.error || 'Erro ao deletar colaborador: Erro desconhecido'
			const titleMessage = errorMessage.split(":")[0]
			const bodyMessage = errorMessage.split(":")[1]
			toast.error(
				<div>
					<span className="font-medium text-red-600">{titleMessage}</span>
					<br />
					<span className="text-sm text-red-950">{bodyMessage}</span>
				</div>
			)
			setConfirmModal({
				show: false,
				type: null,
				collaboratorId: null,
				currentStatus: null
			})
		}
	}

	const handleToggleStatus = async () => {
		try {
			const { collaboratorId, currentStatus } = confirmModal
			const endpoint = currentStatus === 'active'
				? 'desativarColaborador'
				: 'ativarColaborador'

			await axios.put(
				`https://api-matriz-mfj.8bitscompany.com/admin/${endpoint}`,
				{ collaboratorId: collaboratorId },
				{
					headers: { Authorization: `Bearer ${token}` }
				}
			)

			const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
			setCollaborators((prev) =>
				prev.map((collab) =>
					collab.id === collaboratorId ? { ...collab, status: newStatus } : collab
				)
			)

			toast.success(
				<div>
					<span className="font-medium text-green-600">Sucesso!</span>
					<br />
					<span className="text-sm text-green-950">Colaborador <span className='font-bold'>{newStatus === 'active' ? 'ativado' : 'desativado'}</span> com sucesso</span>
				</div>
			)

			setConfirmModal({
				show: false,
				type: null,
				collaboratorId: null,
				currentStatus: null
			})
		} catch (error) {
			console.error('Error updating collaborator status:', error)
			toast.error('Erro ao alterar status do colaborador')
		}
	}

	const openConfirmModal = (type, id, currentStatus = null) => {
		setConfirmModal({
			show: true,
			type,
			collaboratorId: id,
			currentStatus
		})
	}

	const openCourseModal = (collaborator) => {
		setCourseModal({
			show: true,
			collaborator
		})
	}

	const handleEdit = (collaborator) => {
		setSelectedCollaborator(collaborator);
		setModalOpen(true);
	}

	const filteredCollaborators = collaborators.filter(collaborator => {
		// Search filter
		if (searchTerm) {
			const search = searchTerm.toLowerCase()
			const searchMatch =
				collaborator.name?.toLowerCase().includes(search) ||
				collaborator.email?.toLowerCase().includes(search) ||
				collaborator.phone?.includes(search) ||
				collaborator.cpf?.includes(search)
			if (!searchMatch) return false
		}

		// Status filter
		if (filters.status.length > 0 && !filters.status.includes(collaborator.status)) {
			return false
		}

		// Company filter
		if (filters.companies.length > 0 && !filters.companies.includes(collaborator.company?.id?.toString())) {
			return false
		}

		// Department filter
		if (filters.departments.length > 0 && !filters.departments.includes(collaborator.department?.id?.toString())) {
			return false
		}

		return true
	})

	if (isLoading) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500 dark:text-gray-400">Carregando colaboradores...</p>
			</div>
		)
	}

	if (filteredCollaborators.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500 dark:text-gray-400">Nenhum colaborador encontrado com os filtros aplicados.</p>
			</div>
		)
	}

	return (
		<>
			<div className="overflow-x-auto">
				<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
					<thead className="bg-gray-50 dark:bg-gray-700">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Nome
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Email
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								CPF
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Telefone
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Setor
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Empresa
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Status
							</th>
							<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Ações
							</th>
						</tr>
					</thead>
					<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
						{filteredCollaborators.map((collaborator) => (
							<tr key={collaborator.id}>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
										{collaborator.name}
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm text-gray-500 dark:text-gray-400">{collaborator.email}</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm text-gray-500 dark:text-gray-400">{formatCpfCnpj(collaborator.cpf)}</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm text-gray-500 dark:text-gray-400">{formatPhoneNumber(collaborator.phone)}</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm text-gray-500 dark:text-gray-400">{collaborator.department?.name}</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm text-gray-500 dark:text-gray-400">{collaborator.company?.name}</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span
										className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${collaborator.status === 'active'
											? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-400'
											: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-400'
											}`}
									>
										{collaborator.status === 'active' ? 'Ativo' : 'Inativo'}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
									{can('canEditCollaborator') &&

										<button
											onClick={() => handleEdit(collaborator)}
											className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-600 mr-4"
											title="Editar"
										>
											<PencilIcon className="h-5 w-5" />
										</button>
									}
									<button
										onClick={() => openCourseModal(collaborator)}
										className="text-orange-600 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-600 mr-4"
										title="Gerenciar cursos"
									>
										<AcademicCapIcon className="h-5 w-5" />
									</button>

									{can('canEditCollaborator') &&
										<button
											onClick={() => openConfirmModal('status', collaborator.id, collaborator.status)}
											className={`${collaborator.status === 'active'
												? 'text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-600'
												: 'text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-600'
												} mr-4`}
											title={collaborator.status === 'active' ? 'Desativar' : 'Ativar'}
										>
											{collaborator.status === 'active' ? (
												<NoSymbolIcon className="h-5 w-5" />
											) : (
												<CheckCircleIcon className="h-5 w-5" />
											)}
										</button>
									}
									{can('canDeleteCollaborator') &&
										<button
											onClick={() => openConfirmModal('delete', collaborator.id)}
											className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-600"
											title="Excluir"
										>
											<TrashIcon className="h-5 w-5" />
										</button>
									}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<CourseAssignmentModal
				isOpen={courseModal.show}
				onClose={() => setCourseModal({ show: false, collaborator: null })}
				collaborator={courseModal.collaborator}
			/>

			<CollaboratorModal
				open={modalOpen}
				onClose={() => setModalOpen(false)}
				collaborator={selectedCollaborator}
				onCollaboratorSaved={handleCollaboratorSaved}
			/>

			<ConfirmationModal
				isOpen={confirmModal.show && confirmModal.type === 'delete'}
				onClose={() => setConfirmModal({ show: false, type: null, collaboratorId: null, currentStatus: null })}
				onConfirm={handleDelete}
				title="Excluir Colaborador"
				message="Tem certeza que deseja excluir este colaborador? Esta ação não pode ser desfeita."
				confirmText="Excluir"
				confirmStyle="danger"
			/>

			<ConfirmationModal
				isOpen={confirmModal.show && confirmModal.type === 'status'}
				onClose={() => setConfirmModal({ show: false, type: null, collaboratorId: null, currentStatus: null })}
				onConfirm={handleToggleStatus}
				title={`${confirmModal.currentStatus === 'active' ? 'Desativar' : 'Ativar'} Colaborador`}
				message={`Tem certeza que deseja ${confirmModal.currentStatus === 'active' ? 'desativar' : 'ativar'} este colaborador?`}
				confirmText={confirmModal.currentStatus === 'active' ? 'Desativar' : 'Ativar'}
				confirmStyle={confirmModal.currentStatus === 'active' ? 'danger' : 'success'}
			/>
		</>
	)
})

export default CollaboratorList