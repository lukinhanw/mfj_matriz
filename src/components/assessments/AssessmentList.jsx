import { useState, useEffect } from 'react'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
// import api from '../../utils/api'
import { mockAssessments } from '../../utils/mockData'
import ConfirmationModal from '../common/ConfirmationModal'

function AssessmentList({ onEdit, refreshKey }) {
	const { token } = useAuthStore()
	const [assessments, setAssessments] = useState([])
	const [isLoading, setIsLoading] = useState(true)
	const [confirmModal, setConfirmModal] = useState({
		show: false,
		assessmentId: null
	})

	useEffect(() => {
		// Simulando carregamento de dados
		const fetchAssessments = () => {
			setIsLoading(true)
			// Pequeno atraso para simular chamada de API
			setTimeout(() => {
				setAssessments(mockAssessments)
				setIsLoading(false)
			}, 500)
		}

		fetchAssessments()

		// Deixando código original como referência
		/* const fetchAssessments = async () => {
			try {
				setIsLoading(true)
				const response = await api.get('/admin/listarAvaliacoes', {
					headers: { Authorization: `Bearer ${token}` }
				})
				setAssessments(response.data)
			} catch (error) {
				console.error('Error fetching assessments:', error)
				toast.error('Erro ao carregar avaliações')
			} finally {
				setIsLoading(false)
			}
		}

		if (token) {
			fetchAssessments()
		} */
	}, [token, refreshKey])

	const handleDelete = async () => {
		try {
			// Remover do estado local (sem chamada de API)
			setAssessments(prev => prev.filter(a => a.id !== confirmModal.assessmentId))
			toast.success('Avaliação excluída com sucesso')
			setConfirmModal({ show: false, assessmentId: null })
			
			// Log para desenvolvimento do backend
			console.log('DELETE request payload:', { id: confirmModal.assessmentId });
			
			// Código original para referência
			/* await api.delete('/admin/deletarAvaliacao', {
				data: { id: confirmModal.assessmentId },
				headers: { Authorization: `Bearer ${token}` }
			}) */
		} catch (error) {
			console.error('Error deleting assessment:', error)
			toast.error('Erro ao excluir avaliação')
		}
	}

	if (isLoading) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500 dark:text-gray-400">Carregando avaliações...</p>
			</div>
		)
	}

	if (assessments.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500 dark:text-gray-400">Nenhuma avaliação encontrada.</p>
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
								Cargo
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Competência
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Questões
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Cursos Obrigatórios
							</th>
							<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Ações
							</th>
						</tr>
					</thead>
					<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
						{assessments.map((assessment) => (
							<tr key={assessment.id}>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
										{assessment.position.name}
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm text-gray-700 dark:text-gray-300">
										{assessment.competencia || 'Não especificada'}
									</div>
								</td>
								<td className="px-6 py-4">
									<div className="text-sm text-gray-500 dark:text-gray-400">
										{assessment.questions.length} questões
									</div>
								</td>
								<td className="px-6 py-4">
									<div className="text-sm text-gray-500 dark:text-gray-400">
										{assessment.mandatoryCourses.length} cursos
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
									<button
										onClick={() => onEdit(assessment)}
										className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-900 mr-4 transition-colors duration-200"
										title="Editar"
									>
										<PencilIcon className="h-5 w-5" />
									</button>
									<button
										onClick={() => setConfirmModal({ show: true, assessmentId: assessment.id })}
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
				onClose={() => setConfirmModal({ show: false, assessmentId: null })}
				onConfirm={handleDelete}
				title="Excluir Avaliação"
				message="Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita."
				confirmText="Excluir"
				confirmStyle="danger"
			/>
		</>
	)
}

export default AssessmentList