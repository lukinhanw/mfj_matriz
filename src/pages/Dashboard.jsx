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
	const [viewType, setViewType] = useState('grid') // Adicione este estado

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

	const formattedCreditsByCompany = user.role === 'admin' && dashboardData.creditsByCompany ? dashboardData.creditsByCompany.map(company => ({
		...company,
		value: parseInt(company.value, 10) // Converte string para número
	})) : [];

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
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					<>
						<StatsCard
							title="Total de Colaboradores"
							value={dashboardData.totalCollaborators}
							icon="collaborators"
						/>
						<StatsCard
							title="Créditos do Setor"
							value={dashboardData.sectorCredits || 0}
							icon="credits"
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
						<>
							<div className="flex items-center gap-2 mb-4 justify-end">
								<span className="text-gray-700 dark:text-gray-300">Visualização:</span>
								<button
									onClick={() => setViewType(viewType === 'grid' ? 'list' : 'grid')}
									className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
									title={viewType === 'grid' ? 'Visualizar em lista' : 'Visualizar em grid'}
								>
									{viewType === 'grid' ? (
										<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
										</svg>
									) : (
										<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
										</svg>
									)}
								</button>
							</div>
							
							<div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/20 p-6 transition-colors">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
										Resultados da Avaliação
									</h2>
								</div>
								<div className="text-sm text-gray-500 dark:text-gray-400">
									Data da Avaliação: <span className="text-gray-900 dark:text-gray-100">
										{new Date(resultados.data).toLocaleDateString('pt-BR', {
											day: '2-digit',
											month: '2-digit',
											year: 'numeric',
											hour: '2-digit',
											minute: '2-digit'
										})}
									</span>
								</div>
							</div>

							{resultados.cursosObrigatorios && resultados.cursosObrigatorios.length > 0 && (
								<div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/20 p-6 transition-colors">
									<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
										Cursos Obrigatórios
									</h3>
									<div className={viewType === 'grid'
										? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
										: "space-y-4"
									}>
										{resultados.cursosObrigatorios.map(curso => (
											viewType === 'grid' ? (
												<div
													key={curso.id}
													className="group bg-orange-600 shadow rounded-lg overflow-hidden hover:scale-105 transition duration-500"
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
														<h4 className="font-medium text-white dark:text-gray-100 line-clamp-2 mb-1">
															{curso.titulo}
														</h4>
														{curso.categoria && (
															<span className="inline-block px-2 py-1 text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
																{curso.categoria}
															</span>
														)}
													</div>
												</div>
											) : (
												<div
													key={curso.id}
													className="group bg-gray-50 dark:bg-gray-700 shadow rounded-lg overflow-hidden flex hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
												>
													<div className="w-24 h-24 relative flex-shrink-0">
														<img
															src={curso.imagem
																? `${import.meta.env.VITE_API_BASE_URL}/imagem/${curso.imagem}`
																: `${import.meta.env.VITE_API_BASE_URL}/imagem/sem-foto.jpg`}
															alt={curso.titulo}
															className="w-full h-full object-cover"
														/>
													</div>
													<div className="p-4 flex-grow">
														<h4 className="font-medium text-orange-600 dark:text-orange-600 line-clamp-1">
															{curso.titulo}
														</h4>
														{curso.categoria && (
															<span className="inline-block px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full mt-2">
																{curso.categoria}
															</span>
														)}
													</div>
												</div>
											)
										))}
									</div>
								</div>
							)}

							{resultados.cursosRecomendados && resultados.cursosRecomendados.length > 0 && (
								<div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/20 p-6 transition-colors">
									<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
										Cursos Recomendados
									</h3>
									<div className={viewType === 'grid'
										? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
										: "space-y-4"
									}>
										{resultados.cursosRecomendados.map(curso => (
											viewType === 'grid' ? (
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
											) : (
												<div
													key={curso.id}
													className="group bg-gray-50 dark:bg-gray-700 shadow rounded-lg overflow-hidden flex hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
												>
													<div className="w-24 h-24 relative flex-shrink-0">
														<img
															src={curso.imagem
																? `${import.meta.env.VITE_API_BASE_URL}/imagem/${curso.imagem}`
																: `${import.meta.env.VITE_API_BASE_URL}/imagem/sem-foto.jpg`}
															alt={curso.titulo}
															className="w-full h-full object-cover"
														/>
													</div>
													<div className="p-4 flex-grow">
														<h4 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
															{curso.titulo}
														</h4>
														{curso.categoria && (
															<span className="inline-block px-2 py-1 text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full mt-2">
																{curso.categoria}
															</span>
														)}
													</div>
												</div>
											)
										))}
									</div>
								</div>
							)}
						</>
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