import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import axios from 'axios'

function Login() {
	const [rememberMe, setRememberMe] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const navigate = useNavigate()
	const setAuth = useAuthStore(state => state.setAuth)

	const { register, handleSubmit, formState: { errors } } = useForm({
		defaultValues: {
			email: '',
			password: ''
		}
	})

	const onSubmit = async (data) => {
		try {
			setIsSubmitting(true)

			const payload = {
				usuario: data.email,
				senha: data.password
			}

			const response = await axios.post('https://api-matriz-mfj.8bitscompany.com/login', payload)

			setAuth({
				user: {
					id: 1,
					name: response.data.nome,
					email: data.email,
					role: response.data.nivel
				},
				token: response.data.token,
				rememberMe
			})

			toast.success(
				<div>
					<span className="font-medium text-green-600">Sucesso!</span>
					<br />
					<span className="text-sm text-green-950">Login realizado com sucesso</span>
				</div>
			)
			navigate('/')
		} catch (error) {
			let errorMessage = error.response.data.error

			toast.error(
				<div>
					<span className="font-medium text-red-600">Erro ao fazer login</span>
					<br />
					<span className="text-sm text-red-950">{errorMessage}</span>
				</div>
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8 relative">
				{/* Glass effect container */}
				<div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-70 dark:bg-opacity-70 backdrop-blur-lg rounded-2xl shadow-xl transform transition-all"></div>

				{/* Content */}
				<div className="relative p-8">
					<div className="text-center">
						<h2 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
							Sistema de Gestão de Cursos
						</h2>
						<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
							Faça login para acessar o sistema
						</p>
					</div>

					<form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
						<div className="space-y-4">
							<div>
								<label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
									Email
								</label>
								<div className="mt-1">
									<input
										{...register('email', {
											required: 'Email é obrigatório',
											pattern: {
												value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
												message: 'Email inválido'
											}
										})}
										type="email"
										className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 
                                        focus:outline-none focus:ring-primary-500 focus:border-primary-500 
                                        dark:bg-gray-700 dark:text-white dark:placeholder-gray-400
                                        transition-all duration-200 ease-in-out"
										placeholder="seu@email.com"
										disabled={isSubmitting}
									/>
									{errors.email && (
										<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
									)}
								</div>
							</div>

							<div>
								<label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
									Senha
								</label>
								<div className="mt-1">
									<input
										{...register('password', {
											required: 'Senha é obrigatória',
											minLength: {
												value: 6,
												message: 'A senha deve ter no mínimo 6 caracteres'
											}
										})}
										type="password"
										className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 
                                        focus:outline-none focus:ring-primary-500 focus:border-primary-500 
                                        dark:bg-gray-700 dark:text-white dark:placeholder-gray-400
                                        transition-all duration-200 ease-in-out"
										placeholder="••••••••"
										disabled={isSubmitting}
									/>
									{errors.password && (
										<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
									)}
								</div>
							</div>
						</div>

						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<input
									id="remember-me"
									type="checkbox"
									className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded
                                    dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-primary-500
                                    transition-colors duration-200 ease-in-out"
									checked={rememberMe}
									onChange={(e) => setRememberMe(e.target.checked)}
									disabled={isSubmitting}
								/>
								<label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
									Lembrar-me
								</label>
							</div>
						</div>

						<div>
							<button
								type="submit"
								disabled={isSubmitting}
								className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white 
                                bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                                disabled:opacity-50 disabled:cursor-not-allowed
                                transform transition-all duration-200 ease-in-out hover:scale-[1.02]
                                dark:bg-primary-700 dark:hover:bg-primary-600"
							>
								{isSubmitting ? (
									<>
										<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
										</svg>
										Entrando...
									</>
								) : (
									'Entrar'
								)}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}

export default Login