import { useState, useEffect } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import useAuthStore from '../store/authStore'
// Importando dados mockados ao invés de usar a API
import { mockPositions, mockCourses } from '../utils/mockData'
import AssessmentModal from '../components/assessments/AssessmentModal'
import AssessmentList from '../components/assessments/AssessmentList'

function Assessments() {
	const { token } = useAuthStore()
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedAssessment, setSelectedAssessment] = useState(null)
	const [positions, setPositions] = useState([])
	const [courses, setCourses] = useState([])
	const [refreshKey, setRefreshKey] = useState(0)

	useEffect(() => {
		// Usando dados mockados ao invés de chamar a API
		setPositions(mockPositions)
		setCourses(mockCourses)
		
		// Deixando comentado para referência futura
		/* const fetchData = async () => {
			try {
				const [positionsRes, coursesRes] = await Promise.all([
					api.get('/admin/listarCargos', { headers: { Authorization: `Bearer ${token}` } }),
					api.get('/admin/listarCursos', { headers: { Authorization: `Bearer ${token}` } })
				])
				setPositions(positionsRes.data)
				setCourses(coursesRes.data)
			} catch (error) {
				console.error('Error fetching data:', error)
				toast.error('Erro ao carregar dados')
			}
		}

		if (token) {
			fetchData()
		} */
	}, [token])

	const handleEdit = (assessment) => {
		setSelectedAssessment(assessment)
		setIsModalOpen(true)
	}

	const handleClose = () => {
		setSelectedAssessment(null)
		setIsModalOpen(false)
	}

	const handleNew = () => {
		setSelectedAssessment(null)
		setIsModalOpen(true)
	}

	const handleSave = () => {
		setIsModalOpen(false)
		setRefreshKey(prev => prev + 1)
	}

	return (
		<div className="space-y-8">
			<div className="sm:flex sm:items-center sm:justify-between">
				<h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Avaliações</h1>
				<button
					type="button"
					onClick={handleNew}
					className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all hover:scale-105 transform"
				>
					<PlusIcon className="h-5 w-5 mr-2" />
					Nova Avaliação
				</button>
			</div>

			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
				<div className="p-6 border-b border-gray-200 dark:border-gray-700">
					<h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
						Lista de Avaliações
					</h2>
					<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
						Gerencie as avaliações disponíveis no sistema
					</p>
				</div>
				<AssessmentList
					onEdit={handleEdit}
					refreshKey={refreshKey}
				/>
			</div>

			<AssessmentModal
				isOpen={isModalOpen}
				onClose={handleClose}
				assessment={selectedAssessment}
				onSave={handleSave}
				positions={positions}
				courses={courses}
			/>
		</div>
	)
}

export default Assessments