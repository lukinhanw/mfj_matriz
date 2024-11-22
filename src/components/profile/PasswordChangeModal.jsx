import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'

function PasswordChangeModal({ isOpen, onClose }) {
	const {
		register,
		handleSubmit,
		watch,
		reset,
		formState: { errors }
	} = useForm({
		defaultValues: {
			currentPassword: '',
			newPassword: '',
			confirmPassword: ''
		}
	})

	const newPassword = watch('newPassword')

	const onSubmit = async (data) => {
		try {
			// Simulate API call - Replace with actual API endpoint
			await new Promise(resolve => setTimeout(resolve, 1000))

			toast.success(
				<div>
					<span className="font-medium text-green-600">Sucesso!</span>
					<br />
					<span className="text-sm text-green-950">Senha alterada com sucesso</span>
				</div>
			)
			reset()
			onClose()
		} catch (error) {
			toast.error(
				<div>
					<span className="font-medium text-red-600">Erro ao alterar senha</span>
					<br />
					<span className="text-sm text-red-950">Tente novamente mais tarde</span>
				</div>
			)
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
										className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
										onClick={onClose}
									>
										<span className="sr-only">Fechar</span>
										<XMarkIcon className="h-6 w-6" />
									</button>
								</div>

								<div className="sm:flex sm:items-start">
									<div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
										<Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100">
											Alterar Senha
										</Dialog.Title>

										<form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
											<div>
												<label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
													Senha Atual
												</label>
												<input
													type="password"
													{...register('currentPassword', {
														required: 'Senha atual é obrigatória'
													})}
													className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
												/>
												{errors.currentPassword && (
													<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.currentPassword.message}</p>
												)}
											</div>

											<div>
												<label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
													Nova Senha
												</label>
												<input
													type="password"
													{...register('newPassword', {
														required: 'Nova senha é obrigatória',
														minLength: {
															value: 6,
															message: 'A senha deve ter no mínimo 6 caracteres'
														}
													})}
													className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
												/>
												{errors.newPassword && (
													<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.newPassword.message}</p>
												)}
											</div>

											<div>
												<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
													Confirmar Nova Senha
												</label>
												<input
													type="password"
													{...register('confirmPassword', {
														required: 'Confirmação de senha é obrigatória',
														validate: value =>
															value === newPassword || 'As senhas não coincidem'
													})}
													className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
												/>
												{errors.confirmPassword && (
													<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword.message}</p>
												)}
											</div>

											<div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
												<button
													type="submit"
													className="inline-flex w-full justify-center rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 sm:ml-3 sm:w-auto"
												>
													Alterar Senha
												</button>
												<button
													type="button"
													onClick={() => {
														reset()
														onClose()
													}}
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

export default PasswordChangeModal