import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import {
	PencilIcon,
	TrashIcon,
} from '@heroicons/react/24/outline'
import ConfirmationModal from '../common/ConfirmationModal'
import axios from 'axios'
import useAuthStore from '../../store/authStore'

function CourseList({ onEdit, refresh }) {
	const { token } = useAuthStore()
	const [courses, setCourses] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const [confirmModal, setConfirmModal] = useState({
		show: false,
		courseId: null,
		courseTitle: ''
	})

	useEffect(() => {
		const fetchCourses = async () => {
			try {
				setIsLoading(true)
				const response = await axios.get(
					'https://api-matriz-mfj.8bitscompany.com/admin/listarCursos',
					{
						headers: { Authorization: `Bearer ${token}` }
					}
				)
				setCourses(response.data)
			} catch (error) {
				console.error('Erro ao buscar cursos:', error)
				const errorMessage = error.response?.data?.error || 'Erro desconhecido'
				toast.error(
					<div>
						<span className="font-medium text-red-600">Erro ao carregar curso</span>
						<br />
						<span className="text-sm text-red-950">{errorMessage}</span>
					</div>
				)
			} finally {
				setIsLoading(false)
			}
		}

		if (token) {
			fetchCourses()
		}
	}, [token, refresh])

	const handleDelete = async () => {
		try {
			await axios.delete(
				'https://api-matriz-mfj.8bitscompany.com/admin/excluirCurso',
				{
					data: { courseId: confirmModal.courseId },
					headers: { Authorization: `Bearer ${token}` }
				}
			)
			toast.success(
				<div>
					<span className="font-medium text-green-600">Sucesso!</span>
					<br />
					<span className="text-sm text-green-950">Curso deletado com sucesso</span>
				</div>
			)
			setCourses(prevCourses => prevCourses.filter(course => course.id !== confirmModal.courseId))
			setConfirmModal({ show: false, courseId: null, courseTitle: '' })
		} catch (error) {
			console.error('Erro ao excluir curso:', error)
			const errorMessage = error.response?.data?.error || 'Erro ao excluir curso'
			toast.error(
				<div>
					<span className="font-medium text-red-600">Erro ao excluir curso</span>
					<br />
					<span className="text-sm text-red-950">{errorMessage}</span>
				</div>
			)
			setConfirmModal({ show: false, courseId: null, courseTitle: '' })
		}
	}

	const openConfirmModal = (course) => {
		setConfirmModal({
			show: true,
			courseId: course.id,
			courseTitle: course.titulo
		})
	}

	if (isLoading) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500">Carregando cursos...</p>
			</div>
		)
	}

	if (courses.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500">Nenhum curso encontrado.</p>
			</div>
		)
	}

	return (
		<>
			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{courses.map((course) => (
					<div
						key={course.id}
						className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:scale-105 transition duration-500"
					>
						<img
							src={course.thumbnail ? `https://api-matriz-mfj.8bitscompany.com/imagem/${course.thumbnail}` : `https://api-matriz-mfj.8bitscompany.com/imagem/sem-foto.jpg`}
							alt={course.title}
							className="w-full h-48 object-cover"
						/>
						<div className="p-4">
							<div className="flex items-start justify-between">
								<div>
									<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
										{course.title}
									</h3>
									<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{course.category}</p>
								</div>
								<div className="flex space-x-2">
									<button
										onClick={() => onEdit(course)}
										className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-600"
										title="Editar"
									>
										<PencilIcon className="h-5 w-5" />
									</button>
									<button
										onClick={() => openConfirmModal(course)}
										className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-600"
										title="Excluir"
									>
										<TrashIcon className="h-5 w-5" />
									</button>
								</div>
							</div>
							<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{course.description}</p>
						</div>
					</div>
				))}
			</div>

			<ConfirmationModal
				isOpen={confirmModal.show}
				onClose={() => setConfirmModal({ show: false, courseId: null, courseTitle: '' })}
				onConfirm={handleDelete}
				title="Excluir Curso"
				message={`Tem certeza que deseja excluir o curso "${confirmModal.courseTitle}"? Esta ação não pode ser desfeita.`}
				confirmText="Excluir"
				confirmStyle="danger"
			/>
		</>
	)
}

export default CourseList
