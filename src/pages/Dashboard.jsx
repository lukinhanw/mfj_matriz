import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import StatsCard from '../components/dashboard/StatsCard'
import ActivityFeed from '../components/dashboard/ActivityFeed'
import PeriodFilter from '../components/dashboard/PeriodFilter'

const mockData = {
	stats: {
		totalCompanies: 25,
		totalDepartments: 48,
		totalManagers: 35,
		totalEmployees: 150,
		totalCourses: 42,
		totalCredits: 1000,
		usedCredits: 750,
		availableCredits: 250
	},
	courseCompletionData: [
		{ name: 'React Básico', completed: 25, inProgress: 15, notStarted: 10 },
		{ name: 'JavaScript Avançado', completed: 20, inProgress: 12, notStarted: 8 },
		{ name: 'Node.js', completed: 18, inProgress: 10, notStarted: 7 },
		{ name: 'Python', completed: 22, inProgress: 13, notStarted: 5 },
		{ name: 'UX/UI Design', completed: 15, inProgress: 8, notStarted: 12 }
	],
	creditsByCompany: [
		{ name: 'Empresa A', value: 300, color: '#0284c7' },
		{ name: 'Empresa B', value: 200, color: '#22c55e' },
		{ name: 'Empresa C', value: 150, color: '#eab308' },
		{ name: 'Empresa D', value: 100, color: '#ef4444' }
	],
	activities: [
		{
			id: 1,
			type: 'course',
			description: 'Novo curso adicionado: React Avançado',
			date: '2024-03-15T10:30:00'
		},
		{
			id: 2,
			type: 'employee',
			description: 'Funcionário João Silva cadastrado',
			date: '2024-03-15T09:15:00'
		},
		{
			id: 3,
			type: 'client',
			description: 'Cliente Maria Santos vinculada ao curso de JavaScript',
			date: '2024-03-14T16:45:00'
		}
	]
}

function Dashboard() {
	const [period, setPeriod] = useState('7d')
	const { stats, courseCompletionData, creditsByCompany, activities } = mockData

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

	return (
		<div className="space-y-6">
			<div className="sm:flex sm:items-center sm:justify-between">
				<h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>
				<PeriodFilter value={period} onChange={setPeriod} />
			</div>

			{/* Estatísticas Principais */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				<StatsCard
					title="Total de Empresas"
					value={stats.totalCompanies}
					icon="companies"
				/>
				<StatsCard
					title="Total de Setores"
					value={stats.totalDepartments}
					icon="departments"
				/>
				<StatsCard
					title="Total de Gestores"
					value={stats.totalManagers}
					icon="managers"
				/>
				<StatsCard
					title="Total de Colaboradores"
					value={stats.totalEmployees}
					icon="employees"
				/>
			</div>

			{/* Métricas de Créditos */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Gráfico de Conclusão de Cursos */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/20 p-6 transition-colors">
					<h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
						Status dos Cursos
					</h2>
					<div className="h-80">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={courseCompletionData}>
								<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
								<XAxis dataKey="name" stroke="#9CA3AF" />
								<YAxis stroke="#9CA3AF" />
								<Tooltip
									content={<CustomTooltip />}
									contentStyle={{
										backgroundColor: 'rgb(31 41 55)',
										border: 'none',
										borderRadius: '0.5rem',
										color: '#F3F4F6'
									}}
								/>
								<Bar dataKey="completed" name="Concluídos" stackId="a" fill="#22c55e" />
								<Bar dataKey="inProgress" name="Em Andamento" stackId="a" fill="#eab308" />
								<Bar dataKey="notStarted" name="Não Iniciados" stackId="a" fill="#ef4444" />
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
									data={creditsByCompany}
									cx="50%"
									cy="50%"
									labelLine={false}
									outerRadius={120}
									fill="#8884d8"
									dataKey="value"
									label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
								>
									{creditsByCompany.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Pie>
								<Tooltip
									contentStyle={{
										backgroundColor: 'rgb(31 41 55)',
										border: 'none',
										borderRadius: '0.5rem',
										color: '#F3F4F6'
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
					<p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">{stats.totalCredits}</p>
				</div>
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/20 p-6 transition-colors">
					<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Créditos Utilizados</h3>
					<p className="mt-2 text-3xl font-semibold text-green-600 dark:text-green-400">{stats.usedCredits}</p>
				</div>
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/20 p-6 transition-colors">
					<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Créditos Disponíveis</h3>
					<p className="mt-2 text-3xl font-semibold text-blue-600 dark:text-blue-400">{stats.availableCredits}</p>
				</div>
			</div>

			{/* Feed de Atividades */}
			<ActivityFeed activities={activities} />
		</div>
	)
}

export default Dashboard