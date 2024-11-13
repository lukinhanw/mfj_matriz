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
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
						Sistema de Gestão de Cursos
					</h2>
					<p className="mt-2 text-center text-sm text-gray-600">
						Faça login para acessar o sistema
					</p>
				</div>
				<form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
					<div className="rounded-md shadow-sm -space-y-px">
						<div>
							<label htmlFor="email" className="sr-only">Email</label>
							<input
								{...register('email', {
									required: 'Email é obrigatório',
									pattern: {
										value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
										message: 'Email inválido'
									}
								})}
								type="email"
								className="input-field rounded-t-md"
								placeholder="Email"
								disabled={isSubmitting}
							/>
							{errors.email && (
								<p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
							)}
						</div>
						<div>
							<label htmlFor="password" className="sr-only">Senha</label>
							<input
								{...register('password', {
									required: 'Senha é obrigatória',
									minLength: {
										value: 6,
										message: 'A senha deve ter no mínimo 6 caracteres'
									}
								})}
								type="password"
								className="input-field rounded-b-md"
								placeholder="Senha"
								disabled={isSubmitting}
							/>
							{errors.password && (
								<p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
							)}
						</div>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center">
							<input
								id="remember-me"
								type="checkbox"
								className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
								checked={rememberMe}
								onChange={(e) => setRememberMe(e.target.checked)}
								disabled={isSubmitting}
							/>
							<label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
								Lembrar-me
							</label>
						</div>
					</div>

					<div>
						<button
							type="submit"
							disabled={isSubmitting}
							className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isSubmitting ? 'Entrando...' : 'Entrar'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default Login