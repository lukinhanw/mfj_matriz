import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import api from '../../utils/api'
import { toast } from 'react-hot-toast'
import useAuthStore from '../../store/authStore'

const COLORS = ['#0284c7', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#ec4899']

const CustomTooltip = ({ active, payload }) => {
	if (active && payload && payload.length) {
		const data = payload[0].payload
		return (
			<div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow-sm">
				<p className="font-medium text-gray-600 dark:text-gray-400">{data.name}</p>
				<p className="text-sm text-gray-600 dark:text-gray-400">Créditos: {data.value}</p>
			</div>
		)
	}
	return null
}

export default function CreditAllocationChart() {
	const { user, token } = useAuthStore()
	const [chartData, setChartData] = useState([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const fetchData = async () => {
			let url;
			switch (user.role) {
				case 'admin':
					url = '/admin/relatoriosInscricoes'
					break
				case 'empresa':
					url = '/company/relatoriosInscricoes'
					break
				case 'gestor':
					url = '/manager/relatoriosInscricoes'
					break
				case 'colaborador':
					url = '/collaborator/relatoriosInscricoes'
					break
			}
			try {
				const response = await api.get(
					url,
					{
						headers: { Authorization: `Bearer ${token}` }
					}
				)

				// Formatar os dados recebidos para o formato esperado pelo gráfico
				const formattedData = response.data.map(item => ({
					name: item.name,
					value: parseInt(item.value)
				}))

				setChartData(formattedData)
			} catch (error) {
				console.error('Erro ao buscar dados:', error)
				toast.error('Erro ao carregar dados do gráfico')
			} finally {
				setIsLoading(false)
			}
		}

		fetchData()
	}, [token])

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-full">
				<p className="text-gray-500 dark:text-gray-400">Carregando...</p>
			</div>
		)
	}

	return (
		<ResponsiveContainer width="100%" height="100%">
			<PieChart>
				<Pie
					data={chartData}
					cx="50%"
					cy="50%"
					labelLine={false}
					outerRadius={120}
					fill="#8884d8"
					dataKey="value"
				>
					{chartData.map((entry, index) => (
						<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
					))}
				</Pie>
				<Tooltip content={<CustomTooltip />} />
				<Legend />
			</PieChart>
		</ResponsiveContainer>
	)
}