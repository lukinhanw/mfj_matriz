import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import api from '../utils/api'
import logo from '../assets/logo.png'
import logoBlack from '../assets/logo-black.png'

function Login() {
	const [rememberMe, setRememberMe] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const navigate = useNavigate()
	const setAuth = useAuthStore(state => state.setAuth)
	
	const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'))

	useEffect(() => {
		const observer = new MutationObserver(() => {
			setIsDarkMode(document.documentElement.classList.contains('dark'))
		})
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
		return () => observer.disconnect()
	}, [])

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

			const response = await api.post('/login', payload)

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
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8 relative">
				{/* Glass effect container */}
				<div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-50 dark:bg-opacity-50 backdrop-blur-xl rounded-3xl shadow-2xl transform transition-all"></div>

				{/* Content */}
				<div className="relative p-8 flex flex-col items-center">
					{/* Logo */}
					<div className="mb-6">
						<img src={isDarkMode ? logoBlack : logo} alt="Logo" className="w-full h-20 animate-pulse" />
					</div>

					<div className="text-center mb-4">
						<h2 className="mt-2 text-4xl font-extrabold text-gray-900 dark:text-white">
							Bem-vindo(a)
						</h2>
						<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
							Faça login para acessar o sistema
						</p>
					</div>

					<form className="mt-8 space-y-6 w-full" onSubmit={handleSubmit(onSubmit)}>
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
										className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-full shadow-sm placeholder-gray-400 
                                        focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent 
                                        dark:bg-gray-700 dark:text-white dark:placeholder-gray-400
                                        transition-transform transform hover:scale-105"
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
										className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-full shadow-sm placeholder-gray-400 
                                        focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent 
                                        dark:bg-gray-700 dark:text-white dark:placeholder-gray-400
                                        transition-transform transform hover:scale-105"
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
									className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded
                                        dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-orange-500
                                        transition-colors duration-200 ease-in-out"
									checked={rememberMe}
									onChange={(e) => setRememberMe(e.target.checked)}
									disabled={isSubmitting}
								/>
								<label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
									Lembrar-me
								</label>
							</div>

							<div className="text-sm">
								<Link 
                  to="/forgot-password" 
                  className="font-medium text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
                >
									Esqueci minha senha
								</Link>
							</div>
						</div>

						<div>
							<button
								type="submit"
								disabled={isSubmitting}
								className="group relative w-full flex justify-center py-3 px-6 border border-transparent text-sm font-medium rounded-full text-white 
                                    bg-gradient-to-r from-gray-500 to-gray-500 hover:from-gray-600 hover:to-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                                    shadow-lg transform transition-transform duration-200 ease-in-out hover:scale-105
                                    dark:bg-gradient-to-r dark:from-gray-600 dark:to-gray-600"
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