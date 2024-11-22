import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import MaskedInput from '../components/common/MaskedInput'
import PasswordChangeModal from '../components/profile/PasswordChangeModal'
import { formatCpfCnpj, formatPhoneNumber } from '../utils/helpers'

function Profile() {
	const { user, setAuth } = useAuthStore()
	const [isEditing, setIsEditing] = useState(false)
	const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
	const [documentType, setDocumentType] = useState(user?.role === 'empresa' ? 'cnpj' : 'cpf')

	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
		reset
	} = useForm({
		defaultValues: {
			name: user?.name || '',
			email: user?.email || '',
			document: user?.document || '',
			phone: user?.phone || ''
		}
	})

	const validateDocument = (value) => {
		const numbers = value.replace(/\D/g, '')

		if (documentType === 'cpf') {
			if (numbers.length !== 11) {
				return 'CPF deve ter 11 dígitos'
			}
		} else {
			if (numbers.length !== 14) {
				return 'CNPJ deve ter 14 dígitos'
			}
		}
		return true
	}

	const validatePhone = (value) => {
		const numbers = value.replace(/\D/g, '')
		if (numbers.length < 10 || numbers.length > 11) {
			return 'Telefone deve ter 10 ou 11 dígitos'
		}
		return true
	}

	const onSubmit = async (data) => {
		try {
			// Prepare payload
			const payload = {
				name: data.name,
				email: data.email,
				phone: data.phone.replace(/\D/g, ''),
			}

			if (user?.role === 'empresa') {
				payload.document = data.document.replace(/\D/g, '')
			} else if (['gestor', 'colaborador'].includes(user?.role)) {
				payload.cpf = data.document.replace(/\D/g, '')
			}

			// Simulate API call - Replace with actual API endpoint
			await new Promise(resolve => setTimeout(resolve, 1000))

			setAuth({
				...user,
				...payload
			})

			toast.success(
				<div>
					<span className="font-medium text-green-600">Sucesso!</span>
					<br />
					<span className="text-sm text-green-950">Perfil atualizado com sucesso</span>
				</div>
			)
			setIsEditing(false)
		} catch (error) {
			toast.error(
				<div>
					<span className="font-medium text-red-600">Erro ao atualizar perfil</span>
					<br />
					<span className="text-sm text-red-950">Tente novamente mais tarde</span>
				</div>
			)
		}
	}

	return (
		<div className="max-w-2xl mx-auto">
			<div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
				<div className="px-4 py-5 sm:p-6">
					<h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
						Perfil do Usuário
					</h3>

					<form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
						<div>
							<label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
								Nome
							</label>
							<input
								type="text"
								{...register('name', { required: 'Nome é obrigatório' })}
								disabled={!isEditing}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
							/>
							{errors.name && (
								<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
							)}
						</div>

						{user?.role === 'empresa' && (
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
											className="form-radio h-4 w-4 text-orange-600 focus:ring-orange-500"
											disabled={!isEditing}
										/>
										<span className="ml-2 text-gray-700 dark:text-gray-300">CPF</span>
									</label>
									<label className="inline-flex items-center">
										<input
											type="radio"
											value="cnpj"
											checked={documentType === 'cnpj'}
											onChange={(e) => setDocumentType(e.target.value)}
											className="form-radio h-4 w-4 text-orange-600 focus:ring-orange-500"
											disabled={!isEditing}
										/>
										<span className="ml-2 text-gray-700 dark:text-gray-300">CNPJ</span>
									</label>
								</div>
							</div>
						)}

						{(['gestor', 'colaborador', 'empresa'].includes(user?.role)) && (
							<div>
								<label htmlFor="document" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
									{user?.role === 'empresa' ? (documentType === 'cpf' ? 'CPF' : 'CNPJ') : 'CPF'}
								</label>
								<Controller
									name="document"
									control={control}
									rules={{
										required: 'Documento é obrigatório',
										validate: validateDocument
									}}
									render={({ field }) => (
										<MaskedInput
											{...field}
											mask={documentType}
											placeholder={documentType === 'cpf' ? '999.999.999-99' : '99.999.999/9999-99'}
											className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
											disabled={!isEditing}
										/>
									)}
								/>
								{errors.document && (
									<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.document.message}</p>
								)}
							</div>
						)}

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
								disabled={!isEditing}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
							/>
							{errors.email && (
								<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
							)}
						</div>

						{(['gestor', 'colaborador', 'empresa'].includes(user?.role)) && (
							<div>
								<label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
											className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
											disabled={!isEditing}
										/>
									)}
								/>
								{errors.phone && (
									<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone.message}</p>
								)}
							</div>
						)}

						<div className="flex justify-end gap-3">
							{!isEditing ? (
								<div className="flex gap-3">
									<button
										type="button"
										onClick={() => setIsPasswordModalOpen(true)}
										className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
									>
										Alterar Senha
									</button>
									<button
										type="button"
										onClick={() => setIsEditing(true)}
										className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
									>
										Editar Perfil
									</button>
								</div>
							) : (
								<>
									<button
										type="button"
										onClick={() => {
											setIsEditing(false)
											reset()
										}}
										className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
									>
										Cancelar
									</button>
									<button
										type="submit"
										className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
									>
										Salvar Alterações
									</button>
								</>
							)}
						</div>
					</form>
				</div>
			</div>

			<PasswordChangeModal
				isOpen={isPasswordModalOpen}
				onClose={() => setIsPasswordModalOpen(false)}
			/>
		</div>
	)
}

export default Profile