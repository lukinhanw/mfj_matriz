import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import {
	PencilIcon,
	TrashIcon,
} from '@heroicons/react/24/outline'
import ConfirmationModal from '../common/ConfirmationModal'
import api from '../../utils/api'
import useAuthStore from '../../store/authStore'

function DepartmentList({ onEdit, filters, searchTerm, refresh }) {
	const { token } = useAuthStore()
	const [departments, setDepartments] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const [confirmModal, setConfirmModal] = useState({
		show: false,
		departmentId: null,
	})

	useEffect(() => {
		const fetchDepartments = async () => {
			try {
				setIsLoading(true)
				const response = await api.get('/admin/listarSetores', {
					headers: { Authorization: `Bearer ${token}` }
				})
				setDepartments(response.data)
			} catch (error) {
				console.error('Erro ao buscar setores:', error)
				toast.error('Erro ao carregar setores')
			} finally {
				setIsLoading(false)
			}
		}

		if (token) {
			fetchDepartments()
		}
	}, [token, refresh])

	const handleDelete = async () => {
		try {
			await api.delete('/admin/deletarSetor', {
				headers: { Authorization: `Bearer ${token}` },
				data: { id: confirmModal.departmentId }
			})
			toast.success(
				<div>
					<span className="font-medium text-green-600">Sucesso!</span>
					<br />
					<span className="text-sm text-green-950">Setor removido com sucesso</span>
				</div>
			)
			// Remove o setor deletado da lista
			setDepartments((prevDepartments) =>
				prevDepartments.filter((dept) => dept.id !== confirmModal.departmentId)
			)
			setConfirmModal({ show: false, departmentId: null })
		} catch (error) {
			console.error('Erro ao deletar setor:', error)
			const errorMessage = error.response?.data?.error || 'Erro ao deletar setor: Erro desconhecido'
			const titleMessage = errorMessage.split(":")[0]
			const bodyMessage = errorMessage.split(":")[1]
			toast.error(
				<div>
					<span className="font-medium text-red-600">{titleMessage}</span>
					<br />
					<span className="text-sm text-red-950">{bodyMessage}</span>
				</div>
			)
			setConfirmModal({ show: false, departmentId: null })
		}
	}

	const openConfirmModal = (id) => {
		setConfirmModal({
			show: true,
			departmentId: id,
		})
	}

	const filteredDepartments = departments.filter(department => {
		// Filtro de busca
		if (searchTerm) {
			const search = searchTerm.toLowerCase()
			const searchMatch =
				department.name.toLowerCase().includes(search) ||
				department.company?.name.toLowerCase().includes(search) // Uso do operador ?.
			if (!searchMatch) return false
		}

		// Filtro de empresa
		if (
			filters.company.length > 0 &&
			!filters.company.includes(department.company?.id?.toString())
		) {
			return false
		}

		return true
	})

	if (isLoading) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500 dark:text-gray-400">Carregando setores...</p>
			</div>
		)
	}

	if (filteredDepartments.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500 dark:text-gray-400">Nenhum setor encontrado com os filtros aplicados.</p>
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
						{filteredDepartments.map((department) => (
							<tr key={department.id}>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
										{department.name}
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
									<button
										onClick={() => onEdit(department)}
										className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-900 mr-4 transition-colors duration-200"
										title="Editar"
									>
										<PencilIcon className="h-5 w-5" />
									</button>
									<button
										onClick={() => openConfirmModal(department.id)}
										className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-900 transition-colors duration-200"
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

			<ConfirmationModal
				isOpen={confirmModal.show}
				onClose={() => setConfirmModal({ show: false, departmentId: null })}
				onConfirm={handleDelete}
				title="Excluir Setor"
				message="Tem certeza que deseja excluir este setor? Esta ação não pode ser desfeita."
				confirmText="Excluir"
				confirmStyle="danger"
			/>
		</>
	)
}

export default DepartmentList
