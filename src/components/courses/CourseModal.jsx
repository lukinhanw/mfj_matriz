import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import useAuthStore from '../../store/authStore'

function CourseModal({ isOpen, onClose, course, refreshCourses }) {  // Adicionar refreshCourses nas props
	const { token } = useAuthStore()
	const [formData, setFormData] = useState({
		title: '',
		category: '',
		description: '',
		thumbnail: null
	})
	const [previewUrl, setPreviewUrl] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	useEffect(() => {
		if (course) {
			setFormData({
				title: course.title || '',
				category: course.category || '',
				description: course.description || '',
				thumbnail: null
			})
			setPreviewUrl(course.thumbnail ? `https://api-matriz-mfj.8bitscompany.com/imagem/${course.thumbnail}` : '')
		} else {
			setFormData({
				title: '',
				category: '',
				description: '',
				thumbnail: null
			})
			setPreviewUrl('')
		}
	}, [course])

	const handleSubmit = async (e) => {
		e.preventDefault()
		setIsSubmitting(true)

		try {
			const formPayload = new FormData()
			formPayload.append('title', formData.title)
			formPayload.append('category', formData.category)
			formPayload.append('description', formData.description)

			if (formData.thumbnail) {
				formPayload.append('thumbnail', formData.thumbnail)
			}

			let response

			if (course?.id) {
				formPayload.append('id', course.id)
				response = await axios.put(
					'https://api-matriz-mfj.8bitscompany.com/admin/editarCurso',
					formPayload,
					{
						headers: {
							Authorization: `Bearer ${token}`,
							'Content-Type': 'multipart/form-data'
						}
					}
				)
				toast.success(
					<div>
						<span className="font-medium text-green-600">Sucesso!</span>
						<br />
						<span className="text-sm text-green-950">Curso atualizado com sucesso</span>
					</div>
				)
			} else {
				response = await axios.post(
					'https://api-matriz-mfj.8bitscompany.com/admin/cadastrarCurso',
					formPayload,
					{
						headers: {
							Authorization: `Bearer ${token}`,
							'Content-Type': 'multipart/form-data'
						}
					}
				)
				toast.success('Curso criado com sucesso!')
			}

			refreshCourses()  // Adicionar chamada para atualizar lista
			onClose()
		} catch (error) {
			console.error('Erro ao salvar curso:', error)
			const errorMessage = error.response?.data?.message || 'Erro ao salvar curso'
			toast.error(
				<div>
					<span className="font-medium text-red-600">Erro ao salvar curso</span>
					<br />
					<span className="text-sm text-red-950">{errorMessage}</span>
				</div>
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleImageChange = (e) => {
		const file = e.target.files[0]
		if (file) {
			setFormData(prev => ({ ...prev, thumbnail: file }))
			setPreviewUrl(URL.createObjectURL(file))
		}
	}

	const handleChange = (e) => {
		const { name, value } = e.target
		setFormData(prev => ({
			...prev,
			[name]: value
		}))
	}

	return (
		<Transition.Root show={isOpen} as={Fragment}>
			<Dialog as="div" className="relative z-10" onClose={onClose}>
				{/* Fundo escurecido */}
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
				</Transition.Child>

				{/* Conteúdo do modal */}
				<div className="fixed inset-0 z-10 overflow-y-auto">
					<div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
						{/* Transições do conteúdo */}
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
							enterTo="opacity-100 translate-y-0 sm:scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 translate-y-0 sm:scale-100"
							leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
						>
							{/* Painel do modal */}
							<Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
								{/* Botão de fechar */}
								<div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
									<button
										type="button"
										className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
										onClick={onClose}
										disabled={isSubmitting}
									>
										<span className="sr-only">Fechar</span>
										<XMarkIcon className="h-6 w-6" aria-hidden="true" />
									</button>
								</div>

								{/* Conteúdo do modal */}
								<div className="sm:flex sm:items-start">
									<div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
										{/* Título */}
										<Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100">
											{course ? 'Editar Curso' : 'Novo Curso'}
										</Dialog.Title>

										{/* Formulário */}
										<form onSubmit={handleSubmit} className="mt-6 space-y-4">
											{/* Campo Título */}
											<div>
												<label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
													Título
												</label>
												<input
													type="text"
													name="title"
													id="title"
													value={formData.title}
													onChange={handleChange}
													disabled={isSubmitting}
													className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
													required
												/>
											</div>

											{/* Campo Categoria */}
											<div>
												<label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
													Categoria
												</label>
												<input
													type="text"
													name="category"
													id="category"
													value={formData.category}
													onChange={handleChange}
													disabled={isSubmitting}
													className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
												/>
											</div>

											{/* Campo Descrição */}
											<div>
												<label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
													Descrição
												</label>
												<textarea
													name="description"
													id="description"
													rows={3}
													value={formData.description}
													onChange={handleChange}
													disabled={isSubmitting}
													className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
												/>
											</div>

											{/* Campo Thumbnail */}
											<div>
												<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
													Thumbnail
												</label>
												<div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6 dark:border-gray-600">
													<div className="space-y-1 text-center">
														{previewUrl ? (
															<img
																src={previewUrl}
																alt="Preview"
																className="mx-auto h-32 w-32 object-cover rounded-lg"
															/>
														) : (
															<PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
														)}
														<div className="flex text-sm text-gray-600 dark:text-gray-300">
															<label
																htmlFor="thumbnail"
																className="relative cursor-pointer rounded-md bg-white dark:bg-gray-700 font-medium text-primary-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-800 hover:text-primary-500"
															>
																<span>Upload uma imagem</span>
																<input
																	id="thumbnail"
																	name="thumbnail"
																	type="file"
																	accept="image/*"
																	className="sr-only"
																	onChange={handleImageChange}
																	disabled={isSubmitting}
																/>
															</label>
														</div>
														<p className="text-xs text-gray-500 dark:text-gray-400">
															PNG, JPG, GIF até 10MB
														</p>
													</div>
												</div>
											</div>

											{/* Botões de ação */}
											<div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
												<button
													type="submit"
													disabled={isSubmitting}
													className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
												>
													{isSubmitting ? 'Salvando...' : course ? 'Atualizar' : 'Criar'}
												</button>
												<button
													type="button"
													className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 sm:mt-0 sm:w-auto"
													onClick={onClose}
													disabled={isSubmitting}
												>
													Cancelar
												</button>
											</div>
										</form>
									</div>
								</div>
								{/* Fim do conteúdo do modal */}
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition.Root>
	)
}

export default CourseModal
