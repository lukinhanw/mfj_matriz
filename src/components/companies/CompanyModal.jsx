import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import MaskedInput from '../common/MaskedInput'
import axios from 'axios'
import useAuthStore from '../../store/authStore'

function CompanyModal({ open, onClose, company }) {
	const { token } = useAuthStore()
	const [documentType, setDocumentType] = useState('cpf')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const {
		register,
		handleSubmit,
		control,
		reset,
		formState: { errors }
	} = useForm()

	useEffect(() => {
		if (company) {
			// Determine o tipo de documento com base no comprimento
			const docType = company.document?.replace(/\D/g, '').length > 11 ? 'cnpj' : 'cpf'
			setDocumentType(docType)

			reset({
				name: company.name,
				document: company.document,
				phone: company.phone,
				email: company.email,
			})
		} else {
			reset({
				name: '',
				document: '',
				phone: '',
				email: '',
			})
		}
	}, [company, reset])

	const onSubmit = async (data) => {
		try {
			setIsSubmitting(true)

			// Mapear status para 1 (ativo) ou 0 (inativo)
			const statusValue = data.status === 'active' ? 1 : 0

			// Preparar payload para a API
			const payload = {
				name: data.name,
				document: data.document.replace(/\D/g, ''),
				phone: data.phone.replace(/\D/g, ''),
				email: data.email,
				status: statusValue
			}

			if (company) {
				// Atualizar empresa existente
				payload.id = company.id
				await axios.put(
					'https://api-matriz-mfj.8bitscompany.com/admin/editarEmpresa',
					payload,
					{
						headers: { Authorization: `Bearer ${token}` }
					}
				)
				toast.success(
					<div>
						<span className="font-medium text-green-600">Sucesso!</span>
						<br />
						<span className="text-sm text-green-950">Empresa atualizada com sucesso</span>
					</div>
				)
			} else {
				// Criar nova empresa
				await axios.post(
					'https://api-matriz-mfj.8bitscompany.com/admin/cadastrarEmpresa',
					payload,
					{
						headers: { Authorization: `Bearer ${token}` }
					}
				)
				toast.success(
					<div>
						<span className="font-medium text-green-600">Sucesso!</span>
						<br />
						<span className="text-sm text-green-950">Empresa cadastrada com sucesso</span>
					</div>
				)
			}
			onClose()
		} catch (error) {
			console.error('Error saving company:', error)
			const errorMessage = error.response?.data?.error || 'Erro desconhecido'
			toast.error(
				<div>
					<span className="font-medium text-red-600">Erro ao salvar empresa</span>
					<br />
					<span className="text-sm text-red-950">{errorMessage}</span>
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
													className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100"
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
															onChange={(e) => setDocumentType(e.target.value)}
															className="form-radio h-4 w-4 text-primary-600 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
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
															className="form-radio h-4 w-4 text-primary-600 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
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
															className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100"
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
													htmlFor="phone"
													className="block text-sm font-medium text-gray-700 dark:text-gray-300"
												>
													Telefone
												</label>
												<Controller
													name="phone"
													control={control}
													rules={{ required: 'Telefone é obrigatório' }}
													render={({ field }) => (
														<MaskedInput
															{...field}
															mask="phone"
															placeholder="(99) 99999-9999"
															className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100"
															disabled={isSubmitting}
														/>
													)}
												/>
												{errors.phone && (
													<p className="mt-1 text-sm text-red-600 dark:text-red-400">
														{errors.phone.message}
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
													className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100"
													disabled={isSubmitting}
												/>
												{errors.email && (
													<p className="mt-1 text-sm text-red-600 dark:text-red-400">
														{errors.email.message}
													</p>
												)}
											</div>

											<div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
												<button
													type="submit"
													className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 disabled:bg-primary-300 sm:ml-3 sm:w-auto dark:bg-primary-700 dark:hover:bg-primary-600 dark:disabled:bg-primary-400"
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
