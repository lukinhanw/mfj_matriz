import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import RecoveryStepEmail from '../components/password-recovery/RecoveryStepEmail'
import RecoveryStepCode from '../components/password-recovery/RecoveryStepCode'
import RecoveryStepPassword from '../components/password-recovery/RecoveryStepPassword'
import SuccessModal from '../components/password-recovery/SuccessModal'
import logo from '../assets/logo.png'
import logoBlack from '../assets/logo-black.png'
import api from '../utils/api' // Importar a instancia da API

const STEPS = {
	EMAIL: 'email',
	CODE: 'code',
	PASSWORD: 'password'
}

export default function PasswordRecovery() {
	const [currentStep, setCurrentStep] = useState(STEPS.EMAIL)
	const [email, setEmail] = useState('')
	const [code, setCode] = useState('') // Adicionar estado para o código
	const [isLoading, setIsLoading] = useState(false)
	const [showSuccessModal, setShowSuccessModal] = useState(false)
	const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'))
	const navigate = useNavigate()

	const handleEmailSubmit = async (email) => {
		setIsLoading(true)
		try {
			await api.post('/esquecisenha', { usuario: email }) // Chamada para POST /esquecisenha
			setEmail(email)
			setCurrentStep(STEPS.CODE)
			toast.success('Código de recuperação enviado com sucesso!')
		} catch (error) {
			toast.error('Erro ao enviar código de recuperação')
		} finally {
			setIsLoading(false)
		}
	}

	const handleCodeSubmit = async (code) => {
		setIsLoading(true)
		try {
			const payload = {
				usuario: email,
				codigo: code
			}

			const response = await api.post('/confirmarCodigo', payload)

			if (response.data) {
				setCode(code)
				setCurrentStep(STEPS.PASSWORD)
				toast.success('Código verificado com sucesso!')
			} else {
				throw new Error('Resposta inválida da API')
			}
		} catch (error) {
			toast.error(
				error.response?.data?.message || 
				error.response?.data?.error || 
				'Código inválido'
			)
		} finally {
			setIsLoading(false)
		}
	}

	const handlePasswordSubmit = async (passwords) => {
		setIsLoading(true)
		try {
			await api.put('/trocarSenha', { // Chamada para PUT /trocarSenha
				usuario: email,
				codigo: code,
				senha: passwords.newPassword
			})
			setShowSuccessModal(true)
			toast.success('Senha atualizada com sucesso!')
		} catch (error) {
			toast.error('Erro ao atualizar senha')
		} finally {
			setIsLoading(false)
		}
	}

	const handleSuccessModalClose = () => {
		setShowSuccessModal(false)
		navigate('/login')
	}

	const renderStep = () => {
		switch (currentStep) {
			case STEPS.EMAIL:
				return (
					<RecoveryStepEmail
						onSubmit={handleEmailSubmit}
						isLoading={isLoading}
					/>
				)
			case STEPS.CODE:
				return (
					<RecoveryStepCode
						onSubmit={handleCodeSubmit}
						isLoading={isLoading}
						email={email}
						onResend={() => handleEmailSubmit(email)}
					/>
				)
			case STEPS.PASSWORD:
				return (
					<RecoveryStepPassword
						onSubmit={handlePasswordSubmit}
						isLoading={isLoading}
					/>
				)
			default:
				return null
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8 relative">
				<div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-50 dark:bg-opacity-50 backdrop-blur-xl rounded-3xl shadow-2xl transform transition-all"></div>

				<div className="relative p-8 flex flex-col items-center">
					<div className="mb-6">
						<img
							src={isDarkMode ? logoBlack : logo}
							alt="Logo"
							className="w-full h-20 animate-pulse"
						/>
					</div>

					<div className="text-center mb-8">
						<h2 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
							Recuperação de Senha
						</h2>
						<div className="mt-2 flex justify-center gap-2">
							{Object.values(STEPS).map((step, index) => (
								<div
									key={step}
									className={`h-2 w-12 rounded-full transition-colors duration-200 ${Object.values(STEPS).indexOf(currentStep) >= index
											? 'bg-orange-600'
											: 'bg-gray-200 dark:bg-gray-700'
										}`}
								/>
							))}
						</div>
					</div>

					{renderStep()}

					<div className="mt-4">
						<button
							onClick={() => navigate('/login')}
							className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
						>
							Voltar para o login
						</button>
					</div>
				</div>
			</div>

			<SuccessModal
				isOpen={showSuccessModal}
				onClose={handleSuccessModalClose}
			/>
		</div>
	)
}