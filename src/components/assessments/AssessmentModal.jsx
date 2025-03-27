import { Fragment, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useForm, Controller } from 'react-hook-form'
import Select from 'react-select'
import { toast } from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import api from '../../utils/api'
import { customSelectStyles } from '../../styles/selectStyles'

function AssessmentModal({ isOpen, onClose, assessment, onSave, positions, courses }) {
	const { token } = useAuthStore()
	const {
		register,
		handleSubmit,
		control,
		reset,
		formState: { errors }
	} = useForm()

	useEffect(() => {
		if (assessment) {
			reset({
				positionId: assessment.positionId,
				mandatoryCourses: assessment.mandatoryCourses.map(id => ({
					value: id,
					label: courses.find(c => c.id === id)?.title || `Curso ${id}`
				})),
				questions: assessment.questions.map(q => ({
					text: q.text,
					competencia: q.competencia || '',
					courses: q.courses.map(id => ({
						value: id,
						label: courses.find(c => c.id === id)?.title || `Curso ${id}`
					}))
				}))
			})
		} else {
			reset({
				positionId: '',
				mandatoryCourses: [],
				questions: Array(10).fill({ text: '', competencia: '', courses: [] })
			})
		}
	}, [assessment, reset, courses])

	const onSubmit = async (data) => {
		try {
			const payload = {
				positionId: data.positionId,
				mandatoryCourses: data.mandatoryCourses.map(c => c.value),
				questions: data.questions
					.filter(q => q.text.trim() !== '') // Remove questões vazias
					.map(q => ({
						text: q.text,
						competencia: q.competencia,
						courses: q.courses.map(c => c.value)
					}))
			}

			// Verificar se há pelo menos uma questão
			if (payload.questions.length === 0) {
				toast.error('É necessário adicionar pelo menos uma questão')
				return
			}

			if (assessment) {
				// Ao editar, usamos o positionId que já está no payload
				await api.put('/admin/editarAvaliacao', payload, {
					headers: { Authorization: `Bearer ${token}` }
				})

				toast.success('Avaliação atualizada com sucesso')
			} else {
				await api.post('/admin/cadastrarAvaliacao', payload, {
					headers: { Authorization: `Bearer ${token}` }
				})

				toast.success('Avaliação criada com sucesso')
			}

			onSave()
		} catch (error) {
			console.error('Error saving assessment:', error)
			toast.error(`Erro ao salvar avaliação: ${error.response?.data?.error || 'Erro desconhecido'}`)
		}
	}

	const courseOptions = courses.map(course => ({
		value: course.id,
		label: course.title
	}))

	return (
		<Transition.Root show={isOpen} as={Fragment}>
			<Dialog as="div" className="relative z-50" onClose={onClose}>
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
							<Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
								<div className="absolute right-0 top-0 pr-4 pt-4">
									<button
										type="button"
										className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
										onClick={onClose}
									>
										<XMarkIcon className="h-6 w-6" />
									</button>
								</div>

								<div className="sm:flex sm:items-start">
									<div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
										<Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100">
											{assessment ? 'Editar Avaliação' : 'Nova Avaliação'}
										</Dialog.Title>

										<form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
											{/* Cargo */}
											<div>
												<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
													Cargo
												</label>
												<select
													{...register('positionId', { required: 'Cargo é obrigatório' })}
													className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
												>
													<option value="">Selecione um cargo</option>
													{positions.map(position => (
														<option key={position.id} value={position.id}>
															{position.name}
														</option>
													))}
												</select>
												{errors.positionId && (
													<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.positionId.message}</p>
												)}
											</div>

											{/* Cursos Obrigatórios */}
											<div>
												<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
													Cursos Obrigatórios
												</label>
												<Controller
													name="mandatoryCourses"
													control={control}
													rules={{ required: 'Selecione pelo menos um curso obrigatório' }}
													render={({ field }) => (
														<Select
															{...field}
															isMulti
															options={courseOptions}
															styles={customSelectStyles}
															placeholder="Selecione os cursos obrigatórios"
															noOptionsMessage={() => 'Nenhum curso encontrado'}
														/>
													)}
												/>
												{errors.mandatoryCourses && (
													<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.mandatoryCourses.message}</p>
												)}
											</div>

											{/* Questões */}
											<div className="space-y-6">
												<h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Questões</h4>
												{[...Array(10)].map((_, index) => (
													<div key={index} className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
														<h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
															Questão {index + 1}
														</h5>

														<div>
															<textarea
																{...register(`questions.${index}.text`, index < 5 ? {
																	required: 'Questão é obrigatória'
																} : {})}
																rows={3}
																className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
																placeholder={`Digite a questão ${index + 1} ${index < 5 ? '(obrigatória)' : '(opcional)'}`}
															/>
															{errors.questions?.[index]?.text && (
																<p className="mt-1 text-sm text-red-600 dark:text-red-400">
																	{errors.questions[index].text.message}
																</p>
															)}
														</div>

														<div>
															<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
																Competência
															</label>
															<input
																type="text"
																{...register(`questions.${index}.competencia`, index < 5 ? {
																	required: 'Competência é obrigatória'
																} : {})}
																className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
																placeholder="Digite a competência desta questão"
															/>
															{errors.questions?.[index]?.competencia && (
																<p className="mt-1 text-sm text-red-600 dark:text-red-400">
																	{errors.questions[index].competencia.message}
																</p>
															)}
														</div>

														<div>
															<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
																Cursos Relacionados
															</label>
															<Controller
																name={`questions.${index}.courses`}
																control={control}
																defaultValue={[]}
																rules={index < 5 ? {
																	required: 'Selecione pelo menos um curso relacionado'
																} : {}}
																render={({ field }) => (
																	<Select
																		{...field}
																		isMulti
																		options={courseOptions}
																		styles={customSelectStyles}
																		placeholder="Selecione os cursos relacionados"
																		noOptionsMessage={() => 'Nenhum curso encontrado'}
																	/>
																)}
															/>
															{errors.questions?.[index]?.courses && (
																<p className="mt-1 text-sm text-red-600 dark:text-red-400">
																	{errors.questions[index].courses.message}
																</p>
															)}
														</div>
													</div>
												))}
											</div>

											<div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
												<button
													type="submit"
													className="inline-flex w-full justify-center rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 sm:ml-3 sm:w-auto"
												>
													{assessment ? 'Atualizar' : 'Criar'}
												</button>
												<button
													type="button"
													onClick={onClose}
													className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 sm:mt-0 sm:w-auto"
												>
													Cancelar
												</button>
											</div>
										</form>
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

export default AssessmentModal