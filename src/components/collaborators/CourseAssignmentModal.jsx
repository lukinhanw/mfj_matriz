import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import api from '../../utils/api'
import useAuthStore from '../../store/authStore'
import { usePermissions } from '../../hooks/usePermissions'

function CourseAssignmentModal({ isOpen, onClose, collaborator, onSaved }) { // Adicione onSaved nas props
	const { user, token } = useAuthStore()
	const [courses, setCourses] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const [selectedCourses, setSelectedCourses] = useState([])
	const [searchTerm, setSearchTerm] = useState('')
	const [companyInfo, setCompanyInfo] = useState({})
	const { can } = usePermissions()

	useEffect(() => {
		const fetchCourses = async () => {
			let endpoint;
			switch (user.role) {
				case 'admin':
					endpoint = '/admin/listarCursos'
					break
				case 'empresa':
					endpoint = '/company/listarCursos'
					break
				case 'gestor':
					endpoint = '/manager/listarCursos'
					break
				case 'colaborador':
					endpoint = '/collaborator/listarCursos'
					break
			}
			try {
				setIsLoading(true)
				const response = await api.get(endpoint, {
					headers: { Authorization: `Bearer ${token}` }
				})
				setCourses(response.data)
			} catch (error) {
				console.error('Error fetching courses:', error)
				toast.error('Erro ao carregar cursos')
			} finally {
				setIsLoading(false)
			}
		}

		if (isOpen && token) {
			fetchCourses()
		}
	}, [isOpen, token])


	useEffect(() => {
		if (collaborator) {
			// Definir os cursos selecionados inicialmente
			setSelectedCourses(collaborator.courses.map(course => course.id))

			const fetchEmpresa = async () => {
				try {
					const response = await api.get('/admin/listarEmpresa/' + collaborator.company.id, {
						headers: { Authorization: `Bearer ${token}` }
					})
					setCompanyInfo(response.data)
				} catch (error) {
					console.error('Error fetching company info:', error)
					toast.error('Erro ao carregar informações da empresa')
				}
			}

			user.role === 'admin' && fetchEmpresa()
		}
	}, [collaborator])

	const handleCourseToggle = (courseId) => {
		setSelectedCourses(prev => {
			const newSelection = prev.includes(courseId)
				? prev.filter(id => id !== courseId)
				: [...prev, courseId]

			return newSelection
		})
	}

	const calculateRequiredCredits = (courseIds) => {
		const initialSelectedCourses = collaborator?.courses.map(course => course.id) || []
		const newSelectedCourses = courseIds.filter(id => !initialSelectedCourses.includes(id))
		const total = newSelectedCourses.reduce((total, courseId) => {
			const course = courses.find(c => c.id === courseId)
			return total + (course?.credits || 0)
		}, 0)

		return total
	}

	const headers = {
		Authorization: `Bearer ${token}`,
		'Content-Type': 'multipart/form-data'
	}

	const handleSave = async () => {
		try {
			const requiredCredits = calculateRequiredCredits(selectedCourses)

			if (requiredCredits > companyInfo?.credits) {
				console.error('Insufficient credits:', {
					required: requiredCredits,
					available: companyInfo?.credits
				})
				toast.error(
					<div>
						<span className="font-medium text-red-600">Ops!</span>
						<br />
						<span className="text-sm text-red-950">Créditos insuficientes para atribuir os cursos selecionados</span>
					</div>
				)
				return
			}

			// Payload para a API
			const payload = {
				collaboratorId: collaborator.id,
				selectedCourses: selectedCourses
			}

			// Chamada à API para atribuir os cursos
			await api.post('/admin/atribuirCursoColaborador', payload, { headers })

			toast.success(
				<div>
					<span className="font-medium text-green-600">Sucesso!</span>
					<br />
					<span className="text-sm text-green-950">Curso atualizado com sucesso</span>
				</div>
			)
			onSaved?.() // Chama a função de callback se existir
			onClose()
		} catch (error) {
			console.error('Error saving course assignments:', error)
			toast.error('Erro ao atualizar cursos')
		}
	}

	const handleClose = () => {
		setSearchTerm('')
		onClose()
	}

	if (!collaborator) return null

	const requiredCredits = calculateRequiredCredits(selectedCourses)

	const filteredCourses = courses
		.filter(course =>
			course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			course.description.toLowerCase().includes(searchTerm.toLowerCase())
		)
		.sort((a, b) => {
			// Primeiro ordenar por seleção (selecionados aparecem primeiro)
			const aSelected = selectedCourses.includes(a.id);
			const bSelected = selectedCourses.includes(b.id);
			if (aSelected && !bSelected) return -1;
			if (!aSelected && bSelected) return 1;
			// Se ambos estiverem selecionados ou não selecionados, ordenar por título
			return a.title.localeCompare(b.title);
		})
		.map(course => ({
			...course,
			thumbnail: course.thumbnail ? `${import.meta.env.VITE_API_BASE_URL}/imagem/${course.thumbnail}?token=${token}` : `https://api-matriz-mfj.8bitscompany.com/imagem/sem-foto.jpg`
		}));

	return (
		<Transition.Root show={isOpen} as={Fragment}>
			<Dialog as="div" className="relative z-50" onClose={handleClose}>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity dark:bg-gray-900 dark:bg-opacity-75" />
				</Transition.Child>

				<div className="fixed inset-0 z-10 overflow-y-auto">
					<div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
							enterTo="opacity-100 translate-y-0 sm:scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 translate-y-0 sm:scale-100"
							leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
						>
							<Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
								<div className="absolute right-0 top-0 pr-4 pt-4">
									<button
										type="button"
										className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-400"
										onClick={handleClose}
									>
										<span className="sr-only">Fechar</span>
										<XMarkIcon className="h-6 w-6" />
									</button>
								</div>

								<div className="sm:flex sm:items-start">
									<div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
										<Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100">
											Gerenciar Cursos - {collaborator.name}
										</Dialog.Title>

										<div className="mt-4">
											{can('canViewCreditsAssign') &&
												<div className="flex items-center justify-between mb-4">
													<div className="text-sm text-gray-500 dark:text-gray-400">
														Créditos necessários: {requiredCredits}
													</div>
													<div className="text-sm text-gray-500 dark:text-gray-400">
														Créditos disponíveis: {companyInfo?.credits}
													</div>
												</div>
											}

											{/* Campo de busca */}
											<div className="mb-4">
												<div className="relative rounded-md shadow-sm">
													<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
														<MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-300" aria-hidden="true" />
													</div>
													<input
														type="text"
														value={searchTerm}
														onChange={(e) => setSearchTerm(e.target.value)}
														className="block w-full rounded-md border-gray-300 dark:border-gray-600 pl-10 focus:border-orange-500 focus:ring-orange-500 sm:text-sm dark:bg-gray-700 dark:text-gray-100"
														placeholder="Buscar cursos..."
													/>
												</div>
											</div>

											{isLoading ? (
												<div className="text-center py-4">
													<p className="text-gray-500 dark:text-gray-400">Carregando cursos...</p>
												</div>
											) : (
												<div className="space-y-3 max-h-96 overflow-y-auto">
													{filteredCourses.length === 0 ? (
														<p className="text-center text-gray-500 py-4 dark:text-gray-400">
															Nenhum curso encontrado
														</p>
													) : (
														filteredCourses.map((course) => (
															<label
																key={course.id}
																className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer dark:border-gray-600 dark:hover:bg-gray-700"
															>
																<div className="flex items-center flex-1">
																	<input
																		type="checkbox"
																		checked={selectedCourses.includes(course.id)}
																		onChange={() => handleCourseToggle(course.id)}
																		disabled={!can('canAssignCourses')}
																		className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-orange-500"
																	/>
																	<div className="ml-3">
																		<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
																			{course.title}
																		</p>
																		<p className="text-sm text-gray-500 dark:text-gray-400">
																			{course.description}
																		</p>
																	</div>
																</div>
																<span className="ml-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
																	{course.credits} crédito{course.credits > 1 ? 's' : ''}
																</span>
															</label>
														))
													)}
												</div>
											)}
										</div>
										{can('canAssignCourses') &&
											<div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
												<button
													type="button"
													onClick={handleSave}
													className="inline-flex w-full justify-center rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 sm:ml-3 sm:w-auto"
												>
													Salvar
												</button>
												<button
													type="button"
													onClick={handleClose}
													className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 sm:mt-0 sm:w-auto"
												>
													Cancelar
												</button>
											</div>
										}

									</div>
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition.Root>
	)
}

export default CourseAssignmentModal
