import { useState, useEffect } from 'react'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import api from '../../utils/api'
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
		const fetchAssessments = async () => {
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
		}
	}, [token, refreshKey])

	const handleDelete = async () => {
		try {
			await api.delete('/admin/deletarAvaliacao', {
				data: { id: confirmModal.assessmentId },
				headers: { Authorization: `Bearer ${token}` }
			})
			
			// Remover do estado local
			setAssessments(prev => prev.filter(a => a.positionId !== confirmModal.assessmentId))
			toast.success('Avaliação excluída com sucesso')
			setConfirmModal({ show: false, assessmentId: null })
		} catch (error) {
			console.error('Error deleting assessment:', error)
			toast.error(`Erro ao excluir avaliação: ${error.response?.data?.error || 'Erro desconhecido'}`)
		}
	}

	// Função para contar as competências únicas em um assessment
	const countUniqueCompetencias = (assessment) => {
		if (!assessment || !assessment.questions) return 0;
		const competencias = new Set(assessment.questions.map(q => q.competencia));
		return competencias.size;
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
								Competências
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
										{countUniqueCompetencias(assessment)} competências distintas
									</div>
								</td>
								<td className="px-6 py-4">
									<div className="text-sm text-gray-500 dark:text-gray-400">
										{assessment.questions.length}
									</div>
								</td>
								<td className="px-6 py-4">
									<div className="text-sm text-gray-500 dark:text-gray-400">
										{assessment.mandatoryCourses.length}
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
										onClick={() => setConfirmModal({ show: true, assessmentId: assessment.positionId })}
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