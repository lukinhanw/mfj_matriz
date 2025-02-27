import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import api from '../../utils/api'

function LogList({ filters, itemsPerPage = 10 }) {
	const { token } = useAuthStore()
	const [logs, setLogs] = useState([])
	const [isLoading, setIsLoading] = useState(true)
	const [currentPage, setCurrentPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)

	useEffect(() => {
		const fetchLogs = async () => {
			setIsLoading(true)
			try {
				// Construir os parâmetros de consulta com os filtros
				const params = new URLSearchParams({
					page: currentPage,
					limit: itemsPerPage
				})
				
				// Adicionar filtros de tipo se existirem
				if (filters && filters.type && Array.isArray(filters.type) && filters.type.length > 0) {
					filters.type.forEach(type => {
						if (type) {
							params.append('type', type)
						}
					})
				}
				
				// Adicionar filtros de usuário se existirem
				if (filters && filters.user && Array.isArray(filters.user) && filters.user.length > 0) {
					filters.user.forEach(user => {
						if (user) {
							params.append('user', user)
						}
					})
				}
				
				// Adicionar filtro de período
				if (filters && filters.period) {
					params.append('period', filters.period)
				}
				
				const response = await api.get(`/admin/logs?${params.toString()}`, {
					headers: { Authorization: `Bearer ${token}` }
				})
				
				setLogs(response.data.logs || [])
				setTotalPages(Math.ceil((response.data.total || 0) / itemsPerPage))
			} catch (error) {
				console.error('Erro ao carregar logs:', error)
				toast.error('Erro ao carregar logs')
				setLogs([])
				setTotalPages(1)
			} finally {
				setIsLoading(false)
			}
		}

		if (token) {
			fetchLogs()
		}
	}, [token, currentPage, itemsPerPage, filters])

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

	if (!logs || logs.length === 0) {
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
					{logs.map((log, index) => (
						<li key={log.id || index} className="p-6">
							<div className="flex items-center justify-between">
								<div className="flex-1">
									<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
										{log.description || 'Sem descrição'}
									</p>
									<div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
										<span className="mr-2">{log.user && log.user.name ? log.user.name : 'Usuário desconhecido'}</span>
										<span>•</span>
										<span className="ml-2">
											{log.timestamp ? format(new Date(log.timestamp), "d 'de' MMMM 'às' HH:mm", {
												locale: ptBR
											}) : 'Data desconhecida'}
										</span>
									</div>
								</div>
								<div>
									<span
										className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
											log.type === 'system'
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
					Página {currentPage} de {totalPages || 1}
				</span>
				<button
					onClick={() => handlePageChange(currentPage + 1)}
					disabled={currentPage === totalPages || totalPages === 0}
					className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
				>
					Próxima
				</button>
			</div>
		</div>
	)
}

export default LogList