import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import api from '../../utils/api'
import useAuthStore from '../../store/authStore'

function DepartmentModal({ isOpen, onClose, department, refreshDepartments }) {
	const { token } = useAuthStore()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm()

	useEffect(() => {
		if (department) {
			reset({
				name: department.name,
			})
		} else {
			reset({
				name: '',
			})
		}
	}, [department, reset])

	const onSubmit = async (data) => {
		try {
			setIsSubmitting(true)
			const payload = {
				name: data.name,
			}

			const headers = {
				Authorization: `Bearer ${token}`
			}

			if (department) {
				// Atualizar setor existente
				payload.id = department.id
				await api.put('/admin/editarSetor', payload, { headers })
				toast.success(
					<div>
						<span className="font-medium text-green-600">Sucesso!</span>
						<br />
						<span className="text-sm text-green-950">Setor atualizado com sucesso</span>
					</div>
				)
			} else {
				// Criar novo setor
				await api.post('/admin/cadastrarSetor', payload, { headers })
				toast.success(
					<div>
						<span className="font-medium text-green-600">Sucesso!</span>
						<br />
						<span className="text-sm text-green-950">Setor cadastrado com sucesso</span>
					</div>
				)
			}
			refreshDepartments()
			onClose()
		} catch (error) {
			console.error('Error saving department:', error)
			const errorMessage =
				error.response?.data?.message || 'Erro ao salvar setor'
			toast.error(
				<div>
					<span className="font-medium text-red-600">Erro!</span>
					<br />
					<span className="text-sm text-red-950">{errorMessage}</span>
				</div>
			)
		} finally {
			setIsSubmitting(false)
		}
	}

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
					<div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
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
										className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
										onClick={onClose}
										disabled={isSubmitting}
									>
										<XMarkIcon className="h-6 w-6" />
									</button>
								</div>
								<div className="sm:flex sm:items-start">
									<div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
										<Dialog.Title
											as="h3"
											className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100"
										>
											{department ? 'Editar Setor' : 'Novo Setor'}
										</Dialog.Title>
										<form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
											<div>
												<label
													htmlFor="name"
													className="block text-sm font-medium text-gray-700 dark:text-gray-300"
												>
													Nome
												</label>
												<input
													type="text"
													{...register('name', { required: 'Nome é obrigatório' })}
													className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100"
													disabled={isSubmitting}
												/>
												{errors.name && (
													<p className="mt-1 text-sm text-red-600 dark:text-red-400">
														{errors.name.message}
													</p>
												)}
											</div>

											<div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
												<button
													type="submit"
													className="inline-flex w-full justify-center rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 disabled:bg-orange-300 sm:ml-3 sm:w-auto"
													disabled={isSubmitting}
												>
													{isSubmitting ? 'Salvando...' : department ? 'Atualizar' : 'Cadastrar'}
												</button>
												<button
													type="button"
													onClick={onClose}
													className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-900 sm:mt-0 sm:w-auto"
													disabled={isSubmitting}
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

export default DepartmentModal
