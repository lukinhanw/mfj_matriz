import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import useAuthStore from '../../store/authStore'

function LogList({ filters, searchTerm, itemsPerPage = 10 }) {
	const { token } = useAuthStore()
	const [logs, setLogs] = useState([])
	const [isLoading, setIsLoading] = useState(true)
	const [currentPage, setCurrentPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)

	useEffect(() => {
		const fetchLogs = async () => {
			setIsLoading(true)
			try {
				const response = await axios.get(
					`https://api-matriz-mfj.8bitscompany.com/admin/logs?page=${currentPage}&limit=${itemsPerPage}`,
					{
						headers: { Authorization: `Bearer ${token}` }
					}
				)
				setLogs(response.data.logs)
				setTotalPages(Math.ceil(response.data.total / itemsPerPage))
			} catch (error) {
				console.error('Erro ao carregar logs:', error)
				toast.error('Erro ao carregar logs')
			} finally {
				setIsLoading(false)
			}
		}

		if (token) {
			fetchLogs()
		}
	}, [token, currentPage, itemsPerPage])

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

	const handlePageChange = (newPage) => {
		setCurrentPage(newPage)
		window.scrollTo(0, 0)
	}

	if (isLoading) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500 dark:text-gray-400">Carregando logs...</p>
			</div>
		)
	}

	if (filteredLogs.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500 dark:text-gray-400">Nenhum log encontrado com os filtros aplicados.</p>
			</div>
		)
	}

	return (
		<div>
			<div className="overflow-hidden dark:bg-gray-800">
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

			{/* Paginação */}
			<div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
				<button
					onClick={() => handlePageChange(currentPage - 1)}
					disabled={currentPage === 1}
					className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
				>
					Anterior
				</button>
				<span className="text-sm text-gray-700 dark:text-gray-300">
					Página {currentPage} de {totalPages}
				</span>
				<button
					onClick={() => handlePageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
				>
					Próxima
				</button>
			</div>
		</div>
	)
}

export default LogList