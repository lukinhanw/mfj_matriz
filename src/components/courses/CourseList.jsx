import { useState, useEffect, useMemo } from 'react'
import { toast } from 'react-hot-toast'
import {
	PencilIcon,
	TrashIcon,
} from '@heroicons/react/24/outline'
import ConfirmationModal from '../common/ConfirmationModal'
import axios from 'axios'
import useAuthStore from '../../store/authStore'
import api from '../../utils/api'

function CourseList({ onEdit, refresh, searchTerm, viewMode }) {  // Adicionar viewMode nas props
	const { token } = useAuthStore()
	const [courses, setCourses] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const [confirmModal, setConfirmModal] = useState({
		show: false,
		courseId: null,
		courseTitle: ''
	})
	const [currentPage, setCurrentPage] = useState(1)  // Novo estado
	const [itemsPerPage, setItemsPerPage] = useState(10)  // Novo estado

	useEffect(() => {
		const fetchCourses = async () => {
			try {
				setIsLoading(true)
				const response = await api.get('/admin/listarCursos', {
					headers: {
						Authorization: `Bearer ${token}`
					}
				})
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

	const filteredCourses = useMemo(() => {
		if (!searchTerm) return courses;

		return courses.filter(course =>
			course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			course.category.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [courses, searchTerm]);

	const totalPages = Math.ceil(filteredCourses.length / itemsPerPage)  // Novo cálculo

	const paginatedCourses = useMemo(() => {
		const start = (currentPage - 1) * itemsPerPage
		return filteredCourses.slice(start, start + itemsPerPage)
	}, [filteredCourses, currentPage, itemsPerPage])

	const handleItemsPerPageChange = (e) => {
		setItemsPerPage(Number(e.target.value))
		setCurrentPage(1)
	}

	const handleDelete = async () => {
		try {
			await api.delete('/admin/excluirCurso', {
				data: { courseId: confirmModal.courseId }
			})
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

	if (filteredCourses.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500">Nenhum curso encontrado.</p>
			</div>
		)
	}

	return (
		<>
			<div className="flex justify-between mb-4">
				<div>
					<label htmlFor="itemsPerPage" className="mr-2 text-sm text-gray-700 dark:text-gray-300">Itens por página:</label>
					<select
						id="itemsPerPage"
						value={itemsPerPage}
						onChange={handleItemsPerPageChange}
						className="mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-gray-100"
					>
						<option value={5}>5</option>
						<option value={10}>10</option>
						<option value={20}>20</option>
						<option value={50}>50</option>
					</select>
				</div>
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
			</div>

			{viewMode === 'grid' ? (
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{paginatedCourses.map((course) => (
						<div
							key={course.id}
							className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:scale-105 transition duration-500"
						>
							<img
								src={course.thumbnail ? `https://api-matriz-mfj.8bitscompany.com/imagem/${course.thumbnail}?token=${token}` : `https://api-matriz-mfj.8bitscompany.com/imagem/sem-foto.jpg`}
								alt={course.title}
								className="w-full h-48 object-cover"
							/>
							<div className="p-4">
								<div className="flex items-start justify-between">
									<div>
										<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 me-1">
											{course.title}
										</h3>
										<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{course.category}</p>
									</div>
									<div className="flex space-x-2">
										<button
											onClick={() => onEdit(course)}
											className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
											title="Editar"
										>
											<PencilIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
										</button>
										<button
											onClick={() => openConfirmModal(course)}
											className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
											title="Excluir"
										>
											<TrashIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
										</button>
									</div>
								</div>
								<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{course.description}</p>
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="space-y-4">
					{paginatedCourses.map((course) => (
						<div
							key={course.id}
							className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-500"
						>
							<img
								src={course.thumbnail ? `https://api-matriz-mfj.8bitscompany.com/imagem/${course.thumbnail}?token=${token}` : `https://api-matriz-mfj.8bitscompany.com/imagem/sem-foto.jpg`}
								alt={course.title}
								className="w-24 h-24 object-cover rounded-lg mr-4"
							/>
							<div className="flex-1">
								<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{course.title}</h3>
								<p className="text-sm text-gray-500 dark:text-gray-400">{course.category}</p>
								<p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{course.description}</p>
							</div>
							<div className="flex space-x-2">
								<button
									onClick={() => onEdit(course)}
									className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
									title="Editar"
								>
									<PencilIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
								</button>
								<button
									onClick={() => openConfirmModal(course)}
									className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
									title="Excluir"
								>
									<TrashIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
								</button>
							</div>
						</div>
					))}
				</div>
			)}

			<div className="flex justify-between mt-4">
				<span className="text-sm text-gray-700 dark:text-gray-300">
					Exibindo {paginatedCourses.length} de {filteredCourses.length} cursos
				</span>
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
