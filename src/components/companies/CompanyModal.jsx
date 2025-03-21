import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import MaskedInput from '../common/MaskedInput'
import useAuthStore from '../../store/authStore'
import { formatCpfCnpj, formatPhoneNumber } from '../../utils/helpers'
import api from '../../utils/api'

function CompanyModal({ open, onClose, company }) {
	const { token } = useAuthStore()
	const [documentType, setDocumentType] = useState('cpf')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [departments, setDepartments] = useState([])
	const [selectedDepartments, setSelectedDepartments] = useState([])
	const {
		register,
		handleSubmit,
		control,
		reset,
		formState: { errors }
	} = useForm()

	useEffect(() => {
		// Carregar setores
		const fetchDepartments = async () => {
			try {
				const response = await api.get('/admin/listarSetores', {
					headers: { Authorization: `Bearer ${token}` }
				})
				setDepartments(response.data)
			} catch (error) {
				console.error('Erro ao buscar setores:', error)
				toast.error('Erro ao carregar setores')
			}
		}

		if (token) {
			fetchDepartments()
		}
	}, [token])

	useEffect(() => {
		if (company) {
			// Determine o tipo de documento com base no comprimento
			const docType = company.document?.replace(/\D/g, '').length > 11 ? 'cnpj' : 'cpf'
			setDocumentType(docType)

			// Definir os setores selecionados
			if (company.setores) {
				setSelectedDepartments(company.setores.map(setor => setor.id || setor))
			} else {
				setSelectedDepartments([])
			}

			reset({
				name: company.name,
				document: formatCpfCnpj(company.document) || '',
				email: company.email,
			})
		} else {
			reset({
				name: '',
				document: '',
				email: '',
			})
			setSelectedDepartments([])
		}
	}, [company, reset, token])

	const onSubmit = async (data) => {
		try {
			setIsSubmitting(true)

			// Mapear status para 1 (ativo) ou 0 (inativo)
			const statusValue = data.status === 'active' ? 1 : 0

			// Preparar payload para a API
			const payload = {
				name: data.name,
				document: data.document.replace(/\D/g, ''),
				email: data.email,
				status: statusValue,
				setores: selectedDepartments
			}

			const headers = {
				Authorization: `Bearer ${token}`
			}

			if (company) {
				// Atualizar empresa existente
				payload.id = company.id
				await api.put('/admin/editarEmpresa', payload, { headers })
				toast.success(
					<div>
						<span className="font-medium text-green-600">Sucesso!</span>
						<br />
						<span className="text-sm text-green-950">Empresa atualizada com sucesso</span>
					</div>
				)
			} else {
				// Criar nova empresa
				await api.post('/admin/cadastrarEmpresa', payload, { headers })
				toast.success(
					<div>
						<span className="font-medium text-green-600">Sucesso!</span>
						<br />
						<span className="text-sm text-green-950">Empresa cadastrada com sucesso</span>
					</div>
				)
			}
			onClose() // O refreshKey no componente pai já cuidará da atualização
		} catch (error) {
			console.error('Erro ao salvar empresa:', error)
			const errorMessage = error.response?.data?.error || 'Erro ao salvar empresa: Erro desconhecido'
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

	const validateDocument = (value) => {
		const numbers = value.replace(/\D/g, '')

		if (documentType === 'cpf') {
			if (numbers.length !== 11) {
				return 'CPF deve ter 11 dígitos'
			}
			// Lógica de validação adicional para CPF, se necessário
		} else {
			if (numbers.length !== 14) {
				return 'CNPJ deve ter 14 dígitos'
			}
			// Lógica de validação adicional para CNPJ, se necessário
		}

		return true
	}

	const handleDepartmentChange = (departmentId) => {
		setSelectedDepartments(prev => {
			if (prev.includes(departmentId)) {
				return prev.filter(id => id !== departmentId)
			} else {
				return [...prev, departmentId]
			}
		})
	}

	return (
		<Transition.Root show={open} as={Fragment}>
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
							<Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
								<div className="absolute right-0 top-0 pr-4 pt-4">
									<button
										type="button"
										className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
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
											{company ? 'Editar Empresa' : 'Nova Empresa'}
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

											<div>
												<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
													Tipo de Documento
												</label>
												<div className="mt-2 flex gap-4">
													<label className="inline-flex items-center">
														<input
															type="radio"
															value="cpf"
															checked={documentType === 'cpf'}
															onChange={(e) => {setDocumentType(e.target.value); reset({document: ''})}}
															className="form-radio h-4 w-4 text-orange-600 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600"
															disabled={isSubmitting}
														/>
														<span className="ml-2 dark:text-gray-300">CPF</span>
													</label>
													<label className="inline-flex items-center">
														<input
															type="radio"
															value="cnpj"
															checked={documentType === 'cnpj'}
															onChange={(e) => setDocumentType(e.target.value)}
															className="form-radio h-4 w-4 text-orange-600 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600"
															disabled={isSubmitting}
														/>
														<span className="ml-2 dark:text-gray-300">CNPJ</span>
													</label>
												</div>
											</div>

											<div>
												<label
													htmlFor="document"
													className="block text-sm font-medium text-gray-700 dark:text-gray-300"
												>
													{documentType.toUpperCase()}
												</label>
												<Controller
													name="document"
													control={control}
													rules={{
														required: `${documentType.toUpperCase()} é obrigatório`,
														validate: validateDocument
													}}
													render={({ field }) => (
														<MaskedInput
															{...field}
															mask={documentType}
															placeholder={
																documentType === 'cpf'
																	? '999.999.999-99'
																	: '99.999.999/9999-99'
															}
															className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100"
															disabled={isSubmitting}
														/>
													)}
												/>
												{errors.document && (
													<p className="mt-1 text-sm text-red-600 dark:text-red-400">
														{errors.document.message}
													</p>
												)}
											</div>

											<div>
												<label
													htmlFor="email"
													className="block text-sm font-medium text-gray-700 dark:text-gray-300"
												>
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
													className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100"
													disabled={isSubmitting}
												/>
												{errors.email && (
													<p className="mt-1 text-sm text-red-600 dark:text-red-400">
														{errors.email.message}
													</p>
												)}
											</div>

											<div>
												<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
													Setores
												</label>
												<div className="mt-1 grid grid-cols-2 gap-2">
													{departments.map(department => (
														<div key={department.id} className="flex items-center">
															<input
																type="checkbox"
																id={`department-${department.id}`}
																checked={selectedDepartments.includes(department.id)}
																onChange={() => handleDepartmentChange(department.id)}
																className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
																disabled={isSubmitting}
															/>
															<label 
																htmlFor={`department-${department.id}`}
																className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
															>
																{department.name}
															</label>
														</div>
													))}
												</div>
												{departments.length === 0 && (
													<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
														Nenhum setor disponível. Cadastre setores primeiro.
													</p>
												)}
											</div>

											<div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
												<button
													type="submit"
													className="inline-flex w-full justify-center rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 disabled:bg-orange-300 sm:ml-3 sm:w-auto dark:bg-orange-700 dark:hover:bg-orange-600 dark:disabled:bg-orange-400"
													disabled={isSubmitting}
												>
													{isSubmitting
														? 'Salvando...'
														: company
															? 'Atualizar'
															: 'Cadastrar'}
												</button>
												<button
													type="button"
													onClick={onClose}
													className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:bg-gray-100 sm:mt-0 sm:w-auto dark:bg-gray-700 dark:text-gray-100 dark:ring-gray-600 dark:hover:bg-gray-600 dark:disabled:bg-gray-500"
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

export default CompanyModal
