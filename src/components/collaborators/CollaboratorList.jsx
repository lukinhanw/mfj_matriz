import { useState, useEffect, forwardRef, useImperativeHandle, useMemo } from 'react'
import { toast } from 'react-hot-toast'
import {
	PencilIcon,
	TrashIcon,
	NoSymbolIcon,
	CheckCircleIcon,
	AcademicCapIcon,
	LightBulbIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import ConfirmationModal from '../common/ConfirmationModal'
import CourseAssignmentModal from './CourseAssignmentModal'
import api from '../../utils/api'
import useAuthStore from '../../store/authStore'
import { formatCpfCnpj, formatPhoneNumber } from '../../utils/helpers'
import CollaboratorModal from './CollaboratorModal'
import { usePermissions } from '../../hooks/usePermissions'
import RecommendedCoursesModal from './RecommendedCoursesModal'
import * as XLSX from 'xlsx'

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
	const [recommendedModal, setRecommendedModal] = useState({
		show: false,
		collaborator: null
	})
	const [currentPage, setCurrentPage] = useState(1)
	const [itemsPerPage, setItemsPerPage] = useState(10)

	const fetchCollaborators = async () => {
		let endpoint;
		switch (user.role) {
			case 'admin':
				endpoint = '/admin/listarColaboradores'
				break
			case 'empresa':
				endpoint = '/company/listarColaboradores'
				break
			case 'gestor':
				endpoint = '/manager/listarColaboradores'
				break
			case 'colaborador':
				endpoint = '/collaborator/listarColaboradores'
				break
		}
		try {
			setIsLoading(true)
			const response = await api.get(endpoint, {
				headers: { Authorization: `Bearer ${token}` }
			})
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
			await api.delete('/admin/deletarColaborador', {
				headers: { Authorization: `Bearer ${token}` },
				data: { collaboratorId: confirmModal.collaboratorId }
			})

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
					? '/admin/desativarColaborador'
					: '/admin/ativarColaborador'

			await api.put(endpoint, { collaboratorId: collaboratorId }, {
				headers: { Authorization: `Bearer ${token}` }
			})

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

	const openRecommendedModal = (collaborator) => {
		setRecommendedModal({
			show: true,
			collaborator
		})
	}

	const filteredCollaborators = useMemo(() => {
		return collaborators.filter(collaborator => {
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

			// Position filter
			if (filters.positions?.length > 0 && !filters.positions.includes(collaborator.position?.id?.toString())) {
				return false
			}

			// Evaluated filter (based on recommendedCourses array)
			if (filters.evaluated?.length > 0) {
				const hasRecommendedCourses = Array.isArray(collaborator.recommendedCourses) && 
					collaborator.recommendedCourses.length > 0;
				
				// Se "Sim" está selecionado e o colaborador não tem cursos recomendados, filtrar
				if (filters.evaluated.includes('yes') && !hasRecommendedCourses) {
					return false;
				}
				
				// Se "Não" está selecionado e o colaborador tem cursos recomendados, filtrar
				if (filters.evaluated.includes('no') && hasRecommendedCourses) {
					return false;
				}
				
				// Se ambos estão selecionados, mostra todos (equivalente a sem filtro)
				if (filters.evaluated.includes('yes') && filters.evaluated.includes('no')) {
					// Não filtra nada
				}
			}

			return true
		});
	}, [collaborators, searchTerm, filters]);

	const totalPages = Math.ceil(filteredCollaborators.length / itemsPerPage);

	const paginatedCollaborators = useMemo(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return filteredCollaborators.slice(start, start + itemsPerPage);
	}, [filteredCollaborators, currentPage, itemsPerPage]);

	const handleItemsPerPageChange = (e) => {
		setItemsPerPage(Number(e.target.value));
		setCurrentPage(1);
	};

	const handleExportToExcel = () => {
		try {
			// Preparar os dados para exportação (apenas os colaboradores filtrados)
			const dataToExport = filteredCollaborators.map(collaborator => ({
				'Nome': collaborator.name || '',
				'Email': collaborator.email || '',
				'CPF': formatCpfCnpj(collaborator.cpf) || '',
				'Telefone': formatPhoneNumber(collaborator.phone) || '',
				'Status': collaborator.status === 'active' ? 'Ativo' : 'Inativo',
				'Empresa': collaborator.company?.name || '',
				'Setor': collaborator.department?.name || '',
				'Cargo': collaborator.position?.name || '',
				'Avaliado': Array.isArray(collaborator.recommendedCourses) && collaborator.recommendedCourses.length > 0 ? 'Sim' : 'Não',
				'Data de Criação': collaborator.createdAt ? new Date(collaborator.createdAt).toLocaleDateString('pt-BR') : ''
			}));

			// Criar uma nova planilha
			const worksheet = XLSX.utils.json_to_sheet(dataToExport);
			
			// Ajustar largura das colunas
			const columnWidths = [
				{ wch: 30 }, // Nome
				{ wch: 30 }, // Email
				{ wch: 15 }, // CPF
				{ wch: 15 }, // Telefone
				{ wch: 10 }, // Status
				{ wch: 20 }, // Empresa
				{ wch: 20 }, // Setor
				{ wch: 20 }, // Cargo
				{ wch: 10 }, // Avaliado
				{ wch: 15 }  // Data de Criação
			];
			worksheet['!cols'] = columnWidths;
			
			// Estilizar o cabeçalho
			const range = XLSX.utils.decode_range(worksheet['!ref']);
			for (let C = range.s.c; C <= range.e.c; ++C) {
				const address = XLSX.utils.encode_col(C) + '1';
				if (!worksheet[address]) continue;
				worksheet[address].s = {
					font: { bold: true },
					fill: { fgColor: { rgb: "EFEFEF" } }
				};
			}

			const workbook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(workbook, worksheet, 'Colaboradores');

			// Gerar o arquivo e forçar o download
			const today = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
			XLSX.writeFile(workbook, `Colaboradores_${today}.xlsx`);
			
			toast.success('Exportação concluída com sucesso!');
		} catch (error) {
			console.error('Erro ao exportar para Excel:', error);
			toast.error('Erro ao exportar para Excel');
		}
	};

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

	const renderActionButtons = (collaborator) => (
		<div className="flex items-center justify-end space-x-2">
			<button
				onClick={() => openRecommendedModal(collaborator)}
				className="text-blue-500 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors duration-200"
				title="Cursos Recomendados"
			>
				<LightBulbIcon className="h-5 w-5" />
			</button>
			
			{can('canEditCollaborator') && (
				<button
					onClick={() => handleEdit(collaborator)}
					className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-900 transition-colors duration-200"
					title="Editar"
				>
					<PencilIcon className="h-5 w-5" />
				</button>
			)}
			
			<button
				onClick={() => openCourseModal(collaborator)}
				className="text-yellow-500 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-900 transition-colors duration-200"
				title="Gerenciar cursos"
			>
				<AcademicCapIcon className="h-5 w-5" />
			</button>

			{can('canEditCollaborator') && (
				<button
					onClick={() => openConfirmModal('status', collaborator.id, collaborator.status)}
					className={`${collaborator.status === "active"
						? 'text-red-600 hover:text-red-900'
						: 'text-green-600 hover:text-green-900'
						} transition-colors duration-200`}
					title={collaborator.status === "active" ? 'Desativar' : 'Ativar'}
				>
					{collaborator.status === 'active' ? (
						<NoSymbolIcon className="h-5 w-5" />
					) : (
						<CheckCircleIcon className="h-5 w-5" />
					)}
				</button>
			)}
			
			{can('canDeleteCollaborator') && (
				<button
					onClick={() => openConfirmModal('delete', collaborator.id)}
					className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-900 transition-colors duration-200"
					title="Excluir"
				>
					<TrashIcon className="h-5 w-5" />
				</button>
			)}
		</div>
	);

	const renderStatusIcon = (status) => {
		return status === 'active' ? (
			<span className="inline-flex h-2 w-2 rounded-full bg-green-500 mr-2" title="Ativo" />
		) : (
			<span className="inline-flex h-2 w-2 rounded-full bg-red-500 mr-2" title="Inativo" />
		);
	};

	const renderEvaluatedIndicator = (collaborator) => {
		const isEvaluated = Array.isArray(collaborator.recommendedCourses) && 
			collaborator.recommendedCourses.length > 0;
		
		return isEvaluated ? (
			<span className="inline-flex items-center text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200" title="Avaliado">
				Avaliado
			</span>
		) : (
			<span className="inline-flex items-center text-xs px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200" title="Não avaliado">
				Não avaliado
			</span>
		);
	};

	return (
		<div className="overflow-hidden">
			{isLoading && (
				<div className="p-6 text-center">
					<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
					<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Carregando colaboradores...</p>
				</div>
			)}

			{!isLoading && filteredCollaborators.length === 0 && (
				<div className="p-6 text-center">
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Nenhum colaborador encontrado com os filtros selecionados.
					</p>
				</div>
			)}

			{!isLoading && filteredCollaborators.length > 0 && (
				<>
					<div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
						<div>
							<p className="text-sm text-gray-700 dark:text-gray-300">
								{filteredCollaborators.length} {filteredCollaborators.length === 1 ? 'colaborador encontrado' : 'colaboradores encontrados'}
							</p>
						</div>
						<div>
							<button
								onClick={handleExportToExcel}
								type="button"
								className="inline-flex items-center px-4 py-2 border border-green-300 dark:border-green-600 rounded-md shadow-sm text-sm font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-800 hover:bg-green-100 dark:hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
							>
								<ArrowDownTrayIcon className="h-4 w-4 mr-2" />
								Exportar Excel
							</button>
						</div>
					</div>

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
										Colaborador
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
								{paginatedCollaborators.map((collaborator) => (
									<tr key={collaborator.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700">
										<td className="px-6 py-4">
											<div className="flex items-center">
												{renderStatusIcon(collaborator.status)}
												<div>
													<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
														{collaborator.name}
													</div>
													<div className="text-sm text-gray-500 dark:text-gray-400">
														{collaborator.email}
													</div>
													<div className="mt-1">
														{renderEvaluatedIndicator(collaborator)}
													</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="text-sm text-gray-500 dark:text-gray-400">
												<div>CPF: {formatCpfCnpj(collaborator.cpf)}</div>
												<div>Cargo: {collaborator.position?.name || '-'}</div>
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="text-sm text-gray-500 dark:text-gray-400">
												{collaborator.company?.name || '-'}
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="text-sm text-gray-500 dark:text-gray-400">
												{collaborator.department?.name || '-'}
											</div>
										</td>
										<td className="px-6 py-4">
											{renderActionButtons(collaborator)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Pagination bottom */}
					<div className="flex justify-between items-center mt-4 p-4 border-t border-gray-200 dark:border-gray-700">
						<span className="text-sm text-gray-700 dark:text-gray-300">
							Exibindo {paginatedCollaborators.length} de {filteredCollaborators.length} colaboradores
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

			<CourseAssignmentModal
				isOpen={courseModal.show}
				onClose={() => setCourseModal({ show: false, collaborator: null })}
				collaborator={courseModal.collaborator}
				onSaved={fetchCollaborators}
			/>

			<CollaboratorModal
				open={modalOpen}
				onClose={() => setModalOpen(false)}
				collaborator={selectedCollaborator}
				onCollaboratorSaved={handleCollaboratorSaved}
			/>

			<RecommendedCoursesModal
				isOpen={recommendedModal.show}
				onClose={() => setRecommendedModal({ show: false, collaborator: null })}
				collaborator={recommendedModal.collaborator}
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
		</div>
	)
})

export default CollaboratorList