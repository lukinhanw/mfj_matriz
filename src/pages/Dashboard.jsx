import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import StatsCard from '../components/dashboard/StatsCard'
import ActivityFeed from '../components/dashboard/ActivityFeed'
import axios from 'axios'
import useAuthStore from '../store/authStore'
import { toast } from 'react-hot-toast'

function Dashboard() {
	const [dashboardData, setDashboardData] = useState(null)
	const [isLoading, setIsLoading] = useState(true)
	const { user, token } = useAuthStore()

	useEffect(() => {
		const fetchDashboardData = async () => {
			let url;
			switch (user.role) {
				case 'admin':
					url = 'https://api-matriz-mfj.8bitscompany.com/admin/dashboard'
					break
				case 'empresa':
					url = 'https://api-matriz-mfj.8bitscompany.com/company/dashboard'
					break
				case 'gestor':
					url = 'https://api-matriz-mfj.8bitscompany.com/manager/dashboard'
					break
				case 'colaborador':
					url = 'https://api-matriz-mfj.8bitscompany.com/collaborator/dashboard'
					break
			}
			try {
				setIsLoading(true)
				const response = await axios.get(
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

		if (token) {
			fetchDashboardData()
		}
	}, [token])

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

	const formattedCreditsByCompany = dashboardData.creditsByCompany.map(company => ({
		...company,
		value: parseInt(company.value, 10) // Converte string para número
	}));

	return (
		<div className="space-y-6">
			{/* Estatísticas Principais */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				{/* Gráfico de Inscrições em Cursos */}
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

				{/* Distribuição de Créditos por Empresa */}
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

			{/* Resumo de Créditos */}
			<div className="grid gap-6 md:grid-cols-3">
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/20 p-6 transition-colors">
					<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total de Créditos</h3>
					<p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">{dashboardData.stats.totalCredits}</p>
				</div>
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/20 p-6 transition-colors">
					<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Créditos Utilizados</h3>
					<p className="mt-2 text-3xl font-semibold text-green-600 dark:text-green-400">2</p>
				</div>
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/20 p-6 transition-colors">
					<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Créditos Disponíveis</h3>
					<p className="mt-2 text-3xl font-semibold text-blue-600 dark:text-blue-400">{dashboardData.stats.availableCredits}</p>
				</div>
			</div>

			{/* Feed de Atividades */}
			<ActivityFeed activities={dashboardData.activities} />
		</div>
	)
}

export default Dashboard