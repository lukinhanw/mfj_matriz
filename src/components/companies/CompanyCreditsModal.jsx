// CompanyCreditsModal.jsx
import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import useAuthStore from '../../store/authStore'
import api from '../../utils/api'

function CompanyCreditsModal({ open, onClose, company, type, onCreditsUpdated }) {
	const { token } = useAuthStore()
	const [credits, setCredits] = useState(1)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleSubmit = async (e) => {
		e.preventDefault()

		try {
			setIsSubmitting(true)
			const endpoint =
				type === 'add' ? 'adicionarCreditos' : 'removerCreditos'

			const payload = {
				companyId: company.id,
				credits
			}

			await api({
				method: type === 'add' ? 'post' : 'put',
				url: `/admin/${endpoint}`,
				data: payload,
				headers: { Authorization: `Bearer ${token}` }
			})

			const newCredits =
			  type === 'add'
				? Number(company.credits) + Number(credits)
				: Number(company.credits) - Number(credits)

			toast.success(
				<div>
					<span className="font-medium text-green-600">Sucesso!</span>
					<br />
					<span className="text-sm text-green-950">
						{credits} crédito(s) {type === 'add' ? 'adicionado(s)' : 'removido(s)'} com sucesso
					</span>
				</div>
			)

			// Atualiza os créditos no componente pai
			onCreditsUpdated({ ...company, credits: newCredits })

			handleClose()
		} catch (error) {
			console.error('Error updating credits:', error)
			const errorMessage =
				error.response?.data?.message ||
				`Erro ao ${type === 'add' ? 'adicionar' : 'remover'} créditos`
			toast.error(
				<div>
					<span className="font-medium text-red-600">
						Erro ao {type === 'add' ? 'adicionar' : 'remover'} créditos
					</span>
					<br />
					<span className="text-sm text-red-950">{errorMessage}</span>
				</div>
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleClose = () => {
		setCredits(1) // Reseta o valor para 1
		onClose()
	}

	return (
		<Transition.Root show={open} as={Fragment}>
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
										className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
										onClick={handleClose}
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
											{type === 'add' ? 'Adicionar Créditos' : 'Remover Créditos'}
										</Dialog.Title>
										<form onSubmit={handleSubmit} className="mt-6">
											<div>
												<label
													htmlFor="credits"
													className="block text-sm font-medium text-gray-700 dark:text-gray-300"
												>
													Quantidade de Créditos
												</label>
												<input
													type="number"
													min="1"
													max={type === 'remove' ? company?.credits : undefined}
													value={credits}
													onChange={(e) => setCredits(Number(e.target.value))}
													className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100"
													required
													disabled={isSubmitting}
												/>
											</div>

											<div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
												<button
													type="submit"
													disabled={isSubmitting}
													className={`w-full sm:ml-3 sm:w-auto px-4 py-2 rounded-md text-white ${type === 'add'
															? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400 dark:bg-green-700 dark:hover:bg-green-600 dark:disabled:bg-green-500'
															: 'bg-red-600 hover:bg-red-700 disabled:bg-red-400 dark:bg-red-700 dark:hover:bg-red-600 dark:disabled:bg-red-500'
														}`}
												>
													{isSubmitting
														? 'Processando...'
														: type === 'add'
															? 'Adicionar'
															: 'Remover'}
												</button>
												<button
													type="button"
													className="mt-3 w-full sm:mt-0 sm:w-auto px-4 py-2 bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-600"
													onClick={handleClose}
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

export default CompanyCreditsModal
