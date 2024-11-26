import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import StatsCard from '../components/dashboard/StatsCard'
import ActivityFeed from '../components/dashboard/ActivityFeed'
import api from '../utils/api'
import useAuthStore from '../store/authStore'
import { toast } from 'react-hot-toast'

function Dashboard() {
	const [dashboardData, setDashboardData] = useState(null)
	const [isLoading, setIsLoading] = useState(true)
	const [resultados, setResultados] = useState(null)
	const { user, token } = useAuthStore()

	useEffect(() => {
		const fetchDashboardData = async () => {
			let url;
			switch (user.role) {
				case 'admin':
					url = '/admin/dashboard'
					break
				case 'empresa':
					url = '/company/dashboard'
					break
				case 'gestor':
					url = '/manager/dashboard'
					break
				case 'colaborador':
					url = '/collaborator/dashboard'
					break
			}
			try {
				setIsLoading(true)
				const response = await api.get(
					url,
					{
						headers: { Authorization: `Bearer ${token}` }
					}
				)
				setDashboardData(response.data)
			} catch (error) {
				console.error('Erro ao buscar dados do dashboard:', error)
				toast.error('Erro ao carregar dados do dashboard')
			} finally {
				setIsLoading(false)
			}
		}

		const fetchResultados = async () => {
			if (user.role === 'colaborador') {
				try {
					const response = await api.get('/collaborator/meusResultados', {
						headers: { Authorization: `Bearer ${token}` }
					})
					setResultados(response.data[0])
				} catch (error) {
					console.error('Erro ao buscar resultados:', error)
				}
			}
		}

		if (token) {
			fetchDashboardData()
			fetchResultados()
		}
	}, [token, user.role])

	if (isLoading || !dashboardData) {
		return <div className="flex justify-center items-center h-full text-white">
			<span className="loader mt-5"></span>
		</div>
	}

	const CustomTooltip = ({ active, payload, label }) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-sm dark:shadow-gray-700/20 transition-colors">
					<p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
					{payload.map((entry, index) => (
						<p key={index} className="text-sm text-gray-700 dark:text-gray-300" style={{ color: entry.color }}>
							{entry.name}: {entry.value}
						</p>
					))}
				</div>
			)
		}
		return null
	}

	const formattedCreditsByCompany = user.role === 'admin' && dashboardData.creditsByCompany
		? dashboardData.creditsByCompany.map(company => ({
			...company,
			value: parseInt(company.value, 10) // Converte string para número
		}))
		: [];

	return (
		<div className="space-y-6">
			{user.role === 'admin' && (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
					<>
						<StatsCard
							title="Total de Empresas"
							value={dashboardData.stats.totalCompanies}
							icon="companies"
						/>
						<StatsCard
							title="Total de Setores"
							value={dashboardData.stats.totalDepartments}
							icon="departments"
						/>
						<StatsCard
							title="Total de Gestores"
							value={dashboardData.stats.totalManagers}
							icon="managers"
						/>
						<StatsCard
							title="Total de Colaboradores"
							value={dashboardData.stats.totalEmployees}
							icon="employees"
						/>
					</>
				</div>
			)}

			{user.role === 'gestor' && (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
					<>
						<StatsCard
							title="Total de Colaboradores"
							value={dashboardData.totalCollaborators}
							icon="collaborators"
						/>
					</>
				</div>
			)}

			{user.role === 'empresa' && (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					<>
						<StatsCard
							title="Créditos Disponíveis"
							value={dashboardData.availableCredits}
							icon="credits"
						/>
						<StatsCard
							title="Total de Gestores"
							value={dashboardData.totalManagers}
							icon="managers"
						/>
						<StatsCard
							title="Total de Colaboradores"
							value={dashboardData.totalCollaborators}
							icon="collaborators"
						/>
					</>
				</div>
			)}

			{user.role === 'colaborador' && (
				<>
					<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-4">
						<StatsCard
							title="Cargo"
							value={dashboardData.cargo}
							icon="role"
						/>
						<StatsCard
							title="Setor"
							value={dashboardData.setor}
							icon="department"
						/>
						<StatsCard
							title="Inscrições"
							value={dashboardData.inscricoes}
							icon="subscriptions"
						/>
						<StatsCard
							title="Avaliação"
							value={dashboardData.avaliacaoConcluida ? "Concluída ✅" : "Pendente"}
							icon="assessment"
						/>
					</div>

					{resultados && (
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/20 p-6 transition-colors">
							<h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
								Resultados da Avaliação
							</h2>
							<div className="space-y-4">
								<div className="flex items-center">
									<span className="text-sm text-gray-500 dark:text-gray-400">Data da Avaliação:</span>
									<span className="ml-2 text-gray-900 dark:text-gray-100">
										{new Date(resultados.data).toLocaleDateString('pt-BR', {
											day: '2-digit',
											month: '2-digit',
											year: 'numeric',
											hour: '2-digit',
											minute: '2-digit'
										})}
									</span>
								</div>

								{resultados.cursos && resultados.cursos.length > 0 && (
									<div>
										<h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">
											Cursos Recomendados
										</h3>
										<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
											{resultados.cursos.map(curso => (
												<div
													key={curso.id}
													className="group bg-gray-50 dark:bg-gray-700 shadow rounded-lg overflow-hidden hover:scale-105 transition duration-500"
												>
													<div className="relative h-32 overflow-hidden">
														<img 
															src={curso.imagem 
																? `${import.meta.env.VITE_API_BASE_URL}/imagem/${curso.imagem}` 
																: `${import.meta.env.VITE_API_BASE_URL}/imagem/sem-foto.jpg`}
															alt={curso.titulo}
															className="w-full h-full object-cover transition-transform duration-300"
														/>
														<div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
													</div>
													<div className="p-4">
														<h4 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">
															{curso.titulo}
														</h4>
														{curso.categoria && (
															<span className="inline-block px-2 py-1 text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
																{curso.categoria}
															</span>
														)}
													</div>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						</div>
					)}
				</>
			)}

			{user.role === 'admin' && (
				<div className="grid gap-6 lg:grid-cols-2">
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/20 p-6 transition-colors">
						<h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
							Inscrições por Curso
						</h2>
						<div className="h-80">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={dashboardData.courseCompletionData}>
									<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
									<XAxis dataKey="name" stroke="#9CA3AF" />
									<YAxis stroke="#9CA3AF" />
									<Tooltip content={<CustomTooltip />} />
									<Bar dataKey="subscriptions" name="Inscrições" fill="#22c55e" />
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/20 p-6 transition-colors">
						<h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
							Distribuição de Créditos por Empresa
						</h2>
						<div className="h-80">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={formattedCreditsByCompany}
										cx="50%"
										cy="50%"
										labelLine
										outerRadius={120}
										fill="#8884d8"
										dataKey="value"
										nameKey="name"
										label={({ name, value }) => `${name}: ${value}`}
									>
										{formattedCreditsByCompany.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={entry.color} />
										))}
									</Pie>
									<Tooltip
										content={({ active, payload }) => {
											if (active && payload && payload.length) {
												const data = payload[0].payload;
												return (
													<div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-sm">
														<p className="font-medium" style={{ color: data.color }}>{data.name}</p>
														<p className="text-gray-600 dark:text-gray-400">Créditos: {data.value}</p>
													</div>
												);
											}
											return null;
										}}
									/>
								</PieChart>
							</ResponsiveContainer>
						</div>
					</div>
				</div>
			)}

			{user.role === 'admin' && (
				Array.isArray(dashboardData.activities) && dashboardData.activities.length > 0 ? (
					<ActivityFeed activities={dashboardData.activities} />
				) : (
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/20 p-6 transition-colors">
						<p className="text-gray-500 dark:text-gray-400">Nenhuma atividade recente.</p>
					</div>
				)
			)}
		</div >
	)
}

export default Dashboard