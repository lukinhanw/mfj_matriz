import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Mock data - substituir por chamada à API
const mockLogs = [
	{
		id: 1,
		type: 'user',
		action: 'login',
		description: 'Login realizado com sucesso',
		user: { id: 1, name: 'João Silva' },
		timestamp: '2024-03-15T10:30:00'
	},
	{
		id: 2,
		type: 'course',
		action: 'create',
		description: 'Novo curso criado: React Avançado',
		user: { id: 2, name: 'Maria Santos' },
		timestamp: '2024-03-15T09:15:00'
	},
	{
		id: 3,
		type: 'system',
		action: 'backup',
		description: 'Backup do sistema realizado automaticamente',
		user: { id: 1, name: 'Sistema' },
		timestamp: '2024-03-14T16:45:00'
	}
]

function LogList({ filters, searchTerm }) {
	const [logs] = useState(mockLogs)

	const getDateRange = () => {
		const now = new Date()
		const cutoffDate = new Date(now)

		// Ajusta as horas do momento atual
		now.setHours(23, 59, 59, 999)

		switch (filters.period) {
			case '7d':
				cutoffDate.setDate(now.getDate() - 7)
				break
			case '30d':
				cutoffDate.setDate(now.getDate() - 30)
				break
			case '90d':
				cutoffDate.setDate(now.getDate() - 90)
				break
			case '365d':
				cutoffDate.setDate(now.getDate() - 365)
				break
			default:
				cutoffDate.setDate(now.getDate() - 7)
		}

		// Ajusta as horas da data inicial
		cutoffDate.setHours(0, 0, 0, 0)

		return {
			start: cutoffDate,
			end: now
		}
	}

	const filteredLogs = logs.filter(log => {
		const logDate = new Date(log.timestamp)
		const { start, end } = getDateRange()

		// Verifica se a data do log está dentro do intervalo
		if (logDate < start || logDate > end) {
			return false
		}

		// Search filter
		if (searchTerm) {
			const search = searchTerm.toLowerCase()
			const searchMatch =
				log.description.toLowerCase().includes(search) ||
				log.user.name.toLowerCase().includes(search)
			if (!searchMatch) return false
		}

		// Type filter
		if (filters.type.length > 0 && !filters.type.includes(log.type)) {
			return false
		}

		// User filter
		if (filters.user.length > 0 && !filters.user.includes(log.user.id.toString())) {
			return false
		}

		return true
	})

	if (filteredLogs.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500 dark:text-gray-400">Nenhum log encontrado com os filtros aplicados.</p>
			</div>
		)
	}

	return (
		<div className="overflow-hidden">
			<ul className="divide-y divide-gray-200 dark:divide-gray-700">
				{filteredLogs.map((log) => (
					<li key={log.id} className="p-6">
						<div className="flex items-center justify-between">
							<div className="flex-1">
								<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
									{log.description}
								</p>
								<div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
									<span className="mr-2">{log.user.name}</span>
									<span>•</span>
									<span className="ml-2">
										{format(new Date(log.timestamp), "d 'de' MMMM 'às' HH:mm", {
											locale: ptBR
										})}
									</span>
								</div>
							</div>
							<div>
								<span
									className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${log.type === 'system'
											? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
											: log.type === 'user'
												? 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200'
												: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-200'
										}`}
								>
									{log.type === 'system'
										? 'Sistema'
										: log.type === 'user'
											? 'Usuário'
											: 'Curso'}
								</span>
							</div>
						</div>
					</li>
				))}
			</ul>
		</div>
	)
}

export default LogList