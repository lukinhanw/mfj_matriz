import { useState } from 'react'
import { toast } from 'react-hot-toast'
import CourseList from '../components/courses/CourseList'
import CourseModal from '../components/courses/CourseModal'
import { PlusIcon } from '@heroicons/react/24/outline'
import CourseSearch from '../components/courses/CourseSearch'

function Courses() {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [editingCourse, setEditingCourse] = useState(null)
	const [refresh, setRefresh] = useState(false)  // Novo estado
	const [searchTerm, setSearchTerm] = useState('')

	const handleOpenModal = (course = null) => {
		setEditingCourse(course)
		setIsModalOpen(true)
	}

	const handleCloseModal = () => {
		setEditingCourse(null)
		setIsModalOpen(false)
	}

	const refreshCourses = () => {
		setRefresh(!refresh)
	}

	return (
		<div className="space-y-8">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestão de Cursos</h1>
				<button
					onClick={() => handleOpenModal()}
					className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 transition-all hover:scale-105 transform"
				>
					<PlusIcon className="h-5 w-5 mr-2" />
					Novo Curso
				</button>
			</div>

			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6 mb-5">
				<CourseSearch value={searchTerm} onChange={setSearchTerm} />
			</div>

			<CourseList onEdit={handleOpenModal} refresh={refresh} searchTerm={searchTerm} />

			<CourseModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				course={editingCourse}
				refreshCourses={refreshCourses}  // Nova prop
			/>
		</div>
	)
}

export default Courses