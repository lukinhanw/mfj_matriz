import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import useAuthStore from '../../store/authStore'
import MaskedInput from '../common/MaskedInput'

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
		setValue,
		formState: { errors },
		reset
	} = useForm({
		defaultValues: {
			name: '',
			email: '',
			cpf: '',
			phone: '',
			departmentId: '',
			companyId: '',
		}
	})

	const selectedCompanyId = watch('companyId')

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [companiesResponse, departmentsResponse] = await Promise.all([
					axios.get('https://api-matriz-mfj.8bitscompany.com/admin/listarEmpresas', {
						headers: { Authorization: `Bearer ${token}` }
					}),
					axios.get('https://api-matriz-mfj.8bitscompany.com/admin/listarSetores', {
						headers: { Authorization: `Bearer ${token}` }
					})
				])

				setCompanies(companiesResponse.data || [])
				setDepartments(departmentsResponse.data || [])
			} catch (error) {
				console.error('Error fetching data:', error)
				toast.error('Erro ao carregar dados')
			}
		}

		if (isOpen && token) {
			fetchData()
		}
	}, [isOpen, token])

	useEffect(() => {
		if (manager) {
			reset({
				name: manager.name || '',
				email: manager.email || '',
				cpf: manager.cpf || '',
				phone: manager.phone || '',
				departmentId: manager.department?.id?.toString() || '',
				companyId: manager.company?.id?.toString() || '',
			})
		} else {
			reset({
				name: '',
				email: '',
				cpf: '',
				phone: '',
				departmentId: '',
				companyId: '',
			})
		}
	}, [manager, reset])

	const validateCPF = (cpf) => {
		const numbers = cpf.replace(/\D/g, '')
		if (numbers.length !== 11) {
			return 'CPF deve ter 11 dígitos'
		}
		return true
	}

	const validatePhone = (phone) => {
		const numbers = phone.replace(/\D/g, '')
		if (numbers.length < 10 || numbers.length > 11) {
			return 'Telefone deve ter 10 ou 11 dígitos'
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
				phone: data.phone.replace(/\D/g, ''),
				departmentId: parseInt(data.departmentId),
				companyId: parseInt(data.companyId)
			}

			if (manager) {
				// Update existing manager
				payload.id = manager.id
				await axios.put(
					'https://api-matriz-mfj.8bitscompany.com/admin/editarGestor',
					payload,
					{ headers: { Authorization: `Bearer ${token}` } }
				)
				toast.success(
					<div>
						<span className="font-medium text-green-600">Sucesso!</span>
						<br />
						<span className="text-sm text-green-950">Gestor atualizado com sucesso</span>
					</div>
				)
			} else {
				// Create new manager
				await axios.post(
					'https://api-matriz-mfj.8bitscompany.com/admin/novoGestor',
					payload,
					{ headers: { Authorization: `Bearer ${token}` } }
				)
				toast.success(
					<div>
						<span className="font-medium text-green-600">Sucesso!</span>
						<br />
						<span className="text-sm text-green-950">Gestor criado com sucesso</span>
					</div>
				)
			}

			onSave()
			onClose()
		} catch (error) {
			console.error('Error saving manager:', error)
            const errorMessage = error.response?.data?.error || 'Erro ao deletar setor: Erro desconhecido'
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
							<Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
								<div className="absolute right-0 top-0 pr-4 pt-4">
									<button
										type="button"
										className="rounded-md bg-white text-gray-400 hover:text-gray-500"
										onClick={onClose}
										disabled={isSubmitting}
									>
										<span className="sr-only">Fechar</span>
										<XMarkIcon className="h-6 w-6" />
									</button>
								</div>

								<div className="sm:flex sm:items-start">
									<div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
										<Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
											{manager ? 'Editar Gestor' : 'Novo Gestor'}
										</Dialog.Title>

										<form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
											<div>
												<label htmlFor="name" className="block text-sm font-medium text-gray-700">
													Nome
												</label>
												<input
													type="text"
													{...register('name', { required: 'Nome é obrigatório' })}
													className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
													disabled={isSubmitting}
												/>
												{errors.name && (
													<p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
												)}
											</div>

											<div>
												<label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
													className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
													disabled={isSubmitting}
												/>
												{errors.email && (
													<p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
												)}
											</div>

											<div>
												<label htmlFor="cpf" className="block text-sm font-medium text-gray-700">
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
															className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
															disabled={isSubmitting}
														/>
													)}
												/>
												{errors.cpf && (
													<p className="mt-1 text-sm text-red-600">{errors.cpf.message}</p>
												)}
											</div>

											<div>
												<label htmlFor="phone" className="block text-sm font-medium text-gray-700">
													Telefone
												</label>
												<Controller
													name="phone"
													control={control}
													rules={{
														required: 'Telefone é obrigatório',
														validate: validatePhone
													}}
													render={({ field }) => (
														<MaskedInput
															{...field}
															mask="phone"
															placeholder="(99) 99999-9999"
															className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
															disabled={isSubmitting}
														/>
													)}
												/>
												{errors.phone && (
													<p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
												)}
											</div>

											<div>
												<label htmlFor="companyId" className="block text-sm font-medium text-gray-700">
													Empresa
												</label>
												<select
													{...register('companyId', { required: 'Empresa é obrigatória' })}
													className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
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
													<p className="mt-1 text-sm text-red-600">{errors.companyId.message}</p>
												)}
											</div>

											<div>
												<label htmlFor="departmentId" className="block text-sm font-medium text-gray-700">
													Setor
												</label>
												<select
													{...register('departmentId', { required: 'Setor é obrigatório' })}
													className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
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
													<p className="mt-1 text-sm text-red-600">{errors.departmentId.message}</p>
												)}
											</div>

											<div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
												<button
													type="submit"
													disabled={isSubmitting}
													className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 disabled:bg-primary-300 sm:ml-3 sm:w-auto"
												>
													{isSubmitting ? 'Salvando...' : manager ? 'Atualizar' : 'Criar'}
												</button>
												<button
													type="button"
													onClick={onClose}
													disabled={isSubmitting}
													className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:bg-gray-100 sm:mt-0 sm:w-auto"
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