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
	const [viewMode, setViewMode] = useState('grid')  // Novo estado

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

	const toggleViewMode = () => {
		setViewMode(prevMode => (prevMode === 'grid' ? 'list' : 'grid'))
	}

	return (
		<div className="space-y-8">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestão de Cursos</h1>
				<div className="flex space-x-2">
					<button
						onClick={toggleViewMode}
						className="inline-flex items-center p-2 dark:text-gray-400 dark:hover:text-gray-300 text-gray-500 hover:text-gray-600 focus:outline-none transition-all"
					>
						{viewMode === 'grid' ? (
							<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
							</svg>
						) : (
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
								<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
							</svg>
						)}
					</button>
					<button
						onClick={() => handleOpenModal()}
						className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 dark:focus:ring-offset-gray-800 transition-all hover:scale-105 transform"
					>
						<PlusIcon className="h-5 w-5 mr-2" />
						Novo Curso
					</button>
				</div>
			</div>

			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6 mb-5">
				<CourseSearch value={searchTerm} onChange={setSearchTerm} />
			</div>

			<CourseList onEdit={handleOpenModal} refresh={refresh} searchTerm={searchTerm} viewMode={viewMode} />

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