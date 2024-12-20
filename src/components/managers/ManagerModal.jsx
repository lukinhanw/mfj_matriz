import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import useAuthStore from '../../store/authStore'
import MaskedInput from '../common/MaskedInput'
import { formatCpfCnpj, formatPhoneNumber } from '../../utils/helpers'
import api from '../../utils/api'

function ManagerModal({ isOpen, onClose, manager = null, onSave }) {
	const { token } = useAuthStore()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [departments, setDepartments] = useState([])
	const [companies, setCompanies] = useState([])

	const {
		register,
		handleSubmit,
		control,
		watch,
		formState: { errors },
		reset
	} = useForm({
		defaultValues: {
			name: '',
			email: '',
			cpf: '',
			departmentId: '',
			companyId: '',
		}
	})

	const selectedCompanyId = watch('companyId')

	useEffect(() => {
		const fetchDataAndSetForm = async () => {
			if (!isOpen || !token) return;

			try {
				const [companiesResponse, departmentsResponse] = await Promise.all([
					api.get('/admin/listarEmpresas', {
						headers: { Authorization: `Bearer ${token}` }
					}),
					api.get('/admin/listarSetores', {
						headers: { Authorization: `Bearer ${token}` }
					})
				]);

				setCompanies(companiesResponse.data || []);
				setDepartments(departmentsResponse.data || []);

				// Aguarda a atualização do state antes de fazer o reset
				setTimeout(() => {
					if (manager) {
						reset({
							name: manager.name || '',
							email: manager.email || '',
							cpf: formatCpfCnpj(manager.cpf) || '',
							departmentId: manager.department?.id?.toString() || '',
							companyId: manager.company?.id?.toString() || ''
						});
					} else {
						reset({
							name: '',
							email: '',
							cpf: '',
							departmentId: '',
							companyId: ''
						});
					}
				}, 0);
			} catch (error) {
				console.error('Error fetching data:', error);
				toast.error('Erro ao carregar dados');
			}
		};

		fetchDataAndSetForm();
	}, [isOpen, token, manager, reset]);

	const validateCPF = (cpf) => {
		const numbers = cpf.replace(/\D/g, '')
		if (numbers.length !== 11) {
			return 'CPF deve ter 11 dígitos'
		}
		return true
	}

	const onSubmit = async (data) => {
		try {
			setIsSubmitting(true)

			const payload = {
				name: data.name,
				email: data.email,
				cpf: data.cpf.replace(/\D/g, ''),
				departmentId: parseInt(data.departmentId),
				companyId: parseInt(data.companyId)
			}

			if (manager) {
				// Update existing manager
				payload.id = manager.id
				await api.put('/admin/editarGestor', payload, {
					headers: { Authorization: `Bearer ${token}` }
				})
				toast.success(
					<div>
						<span className="font-medium text-green-600">Sucesso!</span>
						<br />
						<span className="text-sm text-green-950">Gestor atualizado com sucesso</span>
					</div>
				)
			} else {
				// Create new manager
				await api.post('/admin/novoGestor', payload, {
					headers: { Authorization: `Bearer ${token}` }
				})
				toast.success(
					<div>
						<span className="font-medium text-green-600">Sucesso!</span>
						<br />
						<span className="text-sm text-green-950">Gestor criado com sucesso</span>
					</div>
				)
			}

			await onSave();
			onClose();
		} catch (error) {
			console.error('Error saving manager:', error)
			const errorMessage = error.response?.data?.error || 'Erro ao excluir setor: Erro desconhecido'
			const titleMessage = errorMessage.split(":")[0]
			const bodyMessage = errorMessage.split(":")[1]
			toast.error(
				<div>
					<span className="font-medium text-red-600">{titleMessage}</span>
					<br />
					<span className="text-sm text-red-950">{bodyMessage}</span>
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
					<div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity" />
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
										className="rounded-md bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-200"
										onClick={onClose}
										disabled={isSubmitting}
									>
										<span className="sr-only">Fechar</span>
										<XMarkIcon className="h-6 w-6" />
									</button>
								</div>

								<div className="sm:flex sm:items-start">
									<div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
										<Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100">
											{manager ? 'Editar Gestor' : 'Novo Gestor'}
										</Dialog.Title>

										<form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
											<div>
												<label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
													Nome
												</label>
												<input
													type="text"
													{...register('name', { required: 'Nome é obrigatório' })}
													className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:bg-gray-700 dark:text-gray-100 sm:text-sm"
													disabled={isSubmitting}
												/>
												{errors.name && (
													<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
												)}
											</div>

											<div>
												<label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
													Email
												</label>
												<input
													type="email"
													{...register('email', {
														required: 'Email é obrigatório',
														pattern: {
															value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
															message: 'Email inválido'
														}
													})}
													className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:bg-gray-700 dark:text-gray-100 sm:text-sm"
													disabled={isSubmitting}
												/>
												{errors.email && (
													<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
												)}
											</div>

											<div>
												<label htmlFor="cpf" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
													CPF
												</label>
												<Controller
													name="cpf"
													control={control}
													rules={{
														required: 'CPF é obrigatório',
														validate: validateCPF
													}}
													render={({ field }) => (
														<MaskedInput
															{...field}
															mask="cpf"
															placeholder="999.999.999-99"
															className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:bg-gray-700 dark:text-gray-100 sm:text-sm"
															disabled={isSubmitting}
														/>
													)}
												/>
												{errors.cpf && (
													<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cpf.message}</p>
												)}
											</div>

											<div>
												<label htmlFor="companyId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
													Empresa
												</label>
												<select
													{...register('companyId', { required: 'Empresa é obrigatória' })}
													className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:bg-gray-700 dark:text-gray-100 sm:text-sm"
													disabled={isSubmitting}
												>
													<option value="">Selecione uma empresa</option>
													{companies.map(company => (
														<option key={company.id} value={company.id}>
															{company.name}
														</option>
													))}
												</select>
												{errors.companyId && (
													<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.companyId.message}</p>
												)}
											</div>

											<div>
												<label htmlFor="departmentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
													Setor
												</label>
												<select
													{...register('departmentId', { required: 'Setor é obrigatório' })}
													className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:bg-gray-700 dark:text-gray-100 sm:text-sm"
													disabled={isSubmitting || !selectedCompanyId}
												>
													<option value="">Selecione um setor</option>
													{departments.map(dept => (
														<option key={dept.id} value={dept.id}>
															{dept.name}
														</option>
													))}
												</select>
												{errors.departmentId && (
													<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.departmentId.message}</p>
												)}
											</div>

											<div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
												<button
													type="submit"
													disabled={isSubmitting}
													className="inline-flex w-full justify-center rounded-md bg-orange-600 dark:bg-orange-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 dark:hover:bg-orange-600 disabled:bg-orange-300 dark:disabled:bg-orange-800 sm:ml-3 sm:w-auto"
												>
													{isSubmitting ? 'Salvando...' : manager ? 'Atualizar' : 'Criar'}
												</button>
												<button
													type="button"
													onClick={onClose}
													disabled={isSubmitting}
													className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 sm:mt-0 sm:w-auto"
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

export default ManagerModal