import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import AssessmentHeader from '../components/assessment/AssessmentHeader'
import AssessmentForm from '../components/assessment/AssessmentForm'
import ConfirmationModal from '../components/common/ConfirmationModal'
import LoadingState from '../components/assessment/LoadingState'
import CompletedState from '../components/assessment/CompletedState'
import useAuthStore from '../store/authStore'
// import api from '../utils/api'
import { mockUserAssessment } from '../utils/mockData'

export default function Assessment() {
	const [assessment, setAssessment] = useState(null)
	const [isLoading, setIsLoading] = useState(true)
	const [showConfirmModal, setShowConfirmModal] = useState(false)
	const [answers, setAnswers] = useState({})
	const [submitting, setSubmitting] = useState(false)
	const [isCompleted, setIsCompleted] = useState(false)
	const [showSuccess, setShowSuccess] = useState(false)
	const [validationErrors, setValidationErrors] = useState([])
	const { token } = useAuthStore()
	const navigate = useNavigate()

	useEffect(() => {
		fetchAssessment()
	}, [])

	const fetchAssessment = async () => {
		try {
			// Simulando carregamento de dados
			setTimeout(() => {
				setAssessment(mockUserAssessment)
				
				// Inicializa objeto de respostas
				const initialAnswers = {}
				mockUserAssessment.avaliacao.forEach(question => {
					initialAnswers[question.id] = null
				})
				setAnswers(initialAnswers)
				
				setIsLoading(false)
			}, 800);
			
			// Código original comentado para referência
			/* const response = await api.get('/collaborator/trazerAvaliacao', {
				headers: { Authorization: `Bearer ${token}` }
			})
			setAssessment(response.data)
			// Initialize answers object
			const initialAnswers = {}
			response.data.avaliacao.forEach(question => {
				initialAnswers[question.id] = null
			})
			setAnswers(initialAnswers) */
		} catch (error) {
			if (error.response?.data.error === 'Error: Usuário já realizou a avaliação') {			
				setIsCompleted(true)
			} else {
				toast.error('Erro ao carregar avaliação')
				console.error('Error fetching assessment:', error)
			}
		} finally {
			// setIsLoading(false) // Movido para dentro do setTimeout
		}
	}

	const handleAnswerChange = (questionId, value) => {
		setAnswers(prev => ({
			...prev,
			[questionId]: value
		}))
		
		// Atualiza erros de validação
		if (value !== null) {
			setValidationErrors(prev => prev.filter(id => id !== questionId))
		}
	}

	const validateAnswers = () => {
		const unansweredQuestions = [];
		
		// Verifica se todas as questões foram respondidas
		Object.entries(answers).forEach(([id, answer]) => {
			if (answer === null) {
				unansweredQuestions.push(parseInt(id));
			}
		});
		
		// Atualiza o estado de erros
		setValidationErrors(unansweredQuestions);
		
		// Retorna verdadeiro se todas foram respondidas
		return unansweredQuestions.length === 0;
	}

	const handleSubmit = async () => {
		if (!validateAnswers()) {
			toast.error('Por favor, responda todas as perguntas destacadas')
			return
		}
		setShowConfirmModal(true)
	}

	const submitAssessment = async () => {
		setSubmitting(true)
		try {
			// Filter questions answered with "NO"
			const noAnswers = Object.entries(answers)
				.filter(([_, value]) => value === false)
				.map(([id]) => parseInt(id))

			// Log para desenvolvedores do backend
			console.log('POST request para /collaborator/obterResultados:');
			console.log('Payload:', { ids: noAnswers });
			
			// Código original comentado para referência
			/* await api.post('/collaborator/obterResultados', {
				ids: noAnswers
			}, {
				headers: { Authorization: `Bearer ${token}` }
			}) */

			// Simula sucesso após um pequeno delay
			setTimeout(() => {
				setShowSuccess(true)
				setTimeout(() => {
					navigate('/')
				}, 2000)
			}, 800);

		} catch (error) {
			const errorMessage = error.response?.data?.error || 'Erro ao enviar avaliação: Erro desconhecido'
			const titleMessage = errorMessage.split(":")[0]
			const bodyMessage = errorMessage.split(":")[1]
			toast.error(
				<div>
					<span className="font-medium text-red-600">{titleMessage}</span>
					<br />
					<span className="text-sm text-red-950">{bodyMessage}</span>
				</div>
			)
			console.error('Error submitting assessment:', error)
		} finally {
			setSubmitting(false)
			setShowConfirmModal(false)
		}
	}

	if (isLoading) {
		return <LoadingState />
	}

	if (isCompleted) {
		return <CompletedState />
	}

	if (!assessment) {
		return (
			<div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
				<p className="text-center text-lg text-gray-600">Nenhuma avaliação disponível</p>
			</div>
		)
	}

	return (
		<div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
			{showSuccess && (
				<div className="fixed inset-0 flex items-center justify-center bg-gray-900/50 z-50">
					<div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl transform animate-success">
						<div className="flex flex-col items-center">
							<div className="rounded-full bg-green-100 p-3 mb-4">
								<svg
									className="w-8 h-8 text-green-600 animate-check"
									fill="none"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path d="M5 13l4 4L19 7" />
								</svg>
							</div>
							<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
								Avaliação Concluída!
							</h3>
							<p className="text-gray-500 dark:text-gray-400">
								Redirecionando para o dashboard...
							</p>
						</div>
					</div>
				</div>
			)}

			{!isLoading && !isCompleted && assessment && (
				<>
					<AssessmentHeader 
						position={assessment?.cargo} 
						competencia={assessment?.competencia} 
					/>
					
					{validationErrors.length > 0 && (
						<div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
							<p className="text-red-700 dark:text-red-400 font-medium">
								Por favor, responda todas as perguntas para continuar.
							</p>
						</div>
					)}

					<AssessmentForm
						questions={assessment?.avaliacao || []}
						answers={answers}
						onAnswerChange={handleAnswerChange}
						onSubmit={handleSubmit}
						isSubmitting={submitting}
						validationErrors={validationErrors}
					/>
				</>
			)}

			<ConfirmationModal
				isOpen={showConfirmModal}
				onClose={() => setShowConfirmModal(false)}
				onConfirm={submitAssessment}
				title="Confirmar Envio"
				message="Tem certeza que deseja enviar esta avaliação? Esta ação não pode ser desfeita."
				confirmText="Enviar Avaliação"
				confirmStyle="primary"
			/>
		</div>
	)
}