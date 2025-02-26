import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'react-hot-toast'
import api from '../../utils/api'
import useAuthStore from '../../store/authStore'
import { ChevronLeftIcon, ChevronRightIcon, FunnelIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

const statusColors = {
    success: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-200',
    error: 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-200',
    bounce: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200'
}

const statusLabels = {
    success: 'Sucesso',
    error: 'Erro',
    bounce: 'Retorno'
}

const periodOptions = [
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '30d', label: 'Últimos 30 dias' },
    { value: '90d', label: 'Últimos 3 meses' },
    { value: '365d', label: 'Últimos 12 meses' },
    { value: 'all', label: 'Todos' }
]

export default function EmailLogs() {
    const { token } = useAuthStore()
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    })
    const [filters, setFilters] = useState({
        status: [],
        period: '7d',
        search: ''
    })
    const [itemsPerPage, setItemsPerPage] = useState(10)

    const fetchLogs = async (page = 1) => {
        try {
            setLoading(true)
            const response = await api.get(`/admin/email-logs?page=${page}&limit=${itemsPerPage}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            
            // Processar logs para remover sucessos que depois tiveram retorno
            const processedLogs = processLogs(response.data.logs)
            
            setLogs(processedLogs)
            setPagination({
                ...pagination,
                page,
                limit: itemsPerPage,
                ...response.data.pagination
            })
        } catch (error) {
            console.error('Erro ao buscar logs:', error)
            toast.error('Erro ao buscar logs de email')
        } finally {
            setLoading(false)
        }
    }

    // Função para processar logs e remover sucessos que depois tiveram retorno
    const processLogs = (logs) => {
        // Agrupar logs por email
        const emailGroups = {}
        
        // Primeiro, agrupar todos os logs por email
        logs.forEach(log => {
            if (!emailGroups[log.email]) {
                emailGroups[log.email] = []
            }
            emailGroups[log.email].push(log)
        })
        
        // Filtrar logs de sucesso que têm um retorno posterior
        const filteredLogs = []
        
        Object.values(emailGroups).forEach(group => {
            // Verificar se existe algum log de retorno neste grupo
            const hasBounce = group.some(log => log.status === 'bounce')
            
            if (hasBounce) {
                // Se tem retorno, adicionar apenas os logs que não são de sucesso
                group.forEach(log => {
                    if (log.status !== 'success') {
                        filteredLogs.push(log)
                    }
                })
            } else {
                // Se não tem retorno, adicionar todos os logs
                filteredLogs.push(...group)
            }
        })
        
        return filteredLogs
    }

    useEffect(() => {
        if (token) {
            fetchLogs(pagination.page)
        }
    }, [token, itemsPerPage])

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchLogs(newPage)
            window.scrollTo(0, 0)
        }
    }

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value })
    }

    const handleRemoveFilter = (key, value) => {
        if (key === 'all') {
            setFilters({
                status: [],
                period: '7d',
                search: ''
            })
        } else if (key === 'status') {
            setFilters({
                ...filters,
                status: filters.status.filter(v => v !== value)
            })
        } else {
            setFilters({
                ...filters,
                [key]: ''
            })
        }
    }

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
            case 'all':
                cutoffDate.setFullYear(2000) // Data bem antiga para pegar tudo
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
        // Se não tiver data formatada, não filtra por data
        if (!log.data_envio && !log.data_formatada) return true;

        // Filtra por período
        if (filters.period !== 'all') {
            const logDate = new Date(log.data_envio || log.data_formatada);
            const { start, end } = getDateRange();
            if (logDate < start || logDate > end) {
                return false;
            }
        }

        // Filtra por status
        if (filters.status.length > 0 && !filters.status.includes(log.status)) {
            return false;
        }

        // Filtra por termo de busca
        if (filters.search) {
            const search = filters.search.toLowerCase();
            const searchMatch =
                (log.nome_colaborador && log.nome_colaborador.toLowerCase().includes(search)) ||
                (log.email && log.email.toLowerCase().includes(search)) ||
                (log.mensagem && log.mensagem.toLowerCase().includes(search));
            if (!searchMatch) return false;
        }

        return true;
    });

    // Componente para mostrar filtros ativos
    const ActiveFilters = () => {
        const activeFilters = [];

        if (filters.status.length > 0) {
            filters.status.forEach(status => {
                activeFilters.push({ key: 'status', value: status, label: `Status: ${statusLabels[status]}` });
            });
        }

        if (filters.search) {
            activeFilters.push({ key: 'search', value: filters.search, label: `Busca: ${filters.search}` });
        }

        if (activeFilters.length === 0) return null;

        return (
            <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Filtros ativos:</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                    {activeFilters.map((filter, index) => (
                        <span
                            key={`${filter.key}-${filter.value}-${index}`}
                            className="inline-flex items-center gap-x-1 rounded-md bg-orange-50 dark:bg-orange-900 px-2 py-1 text-sm font-medium text-orange-700 dark:text-orange-200"
                        >
                            {filter.label}
                            <button
                                type="button"
                                onClick={() => handleRemoveFilter(filter.key, filter.value)}
                                className="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-orange-600/20 dark:hover:bg-orange-600/30"
                            >
                                <span className="sr-only">Remover filtro</span>
                                <XMarkIcon className="h-3.5 w-3.5" />
                            </button>
                        </span>
                    ))}
                    <button
                        onClick={() => handleRemoveFilter('all')}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        Limpar todos
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Logs de Email</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Logs de emails enviados pela plataforma. Emails com status de sucesso que posteriormente retornaram são exibidos apenas como retorno.
                    </p>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6">
                {/* Busca */}
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 dark:text-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6"
                        placeholder="Buscar por nome, email ou mensagem..."
                    />
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <FunnelIcon className="h-5 w-5" />
                            <span>Filtros:</span>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-start md:gap-8">
                            <div className="mb-4 md:mb-0">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-500">
                                    Período
                                </label>
                                <select
                                    value={filters.period}
                                    onChange={(e) => handleFilterChange('period', e.target.value)}
                                    className="mt-1 block w-full md:w-60 justify-center gap-x-1.5 rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                                >
                                    {periodOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-500">
                                    Status
                                </label>
                                <div className="mt-1 flex flex-wrap gap-2">
                                    {Object.entries(statusLabels).map(([value, label]) => (
                                        <button
                                            key={value}
                                            onClick={() => {
                                                const newStatus = filters.status.includes(value)
                                                    ? filters.status.filter(s => s !== value)
                                                    : [...filters.status, value];
                                                handleFilterChange('status', newStatus);
                                            }}
                                            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                                                filters.status.includes(value)
                                                    ? statusColors[value]
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <ActiveFilters />
                    </div>
                </div>
            </div>

            {/* Lista de Logs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            Histórico de Emails
                        </h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Mostrando apenas o status final de cada email (sucessos que depois retornaram são exibidos como retorno)
                        </p>
                    </div>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className="w-32 rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600"
                    >
                        <option value="10">10 itens</option>
                        <option value="25">25 itens</option>
                        <option value="50">50 itens</option>
                        <option value="100">100 itens</option>
                    </select>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">Carregando logs...</p>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">Nenhum log encontrado com os filtros aplicados.</p>
                    </div>
                ) : (
                    <div className="overflow-hidden">
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredLogs.map((log) => (
                                <li key={log.id} className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {log.nome_colaborador || 'N/A'}
                                                </p>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    {log.email}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                                                {log.mensagem}
                                            </p>
                                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                {log.data_formatada ? (
                                                    log.data_formatada
                                                ) : (
                                                    log.data_envio && format(new Date(log.data_envio), "d 'de' MMMM 'às' HH:mm", {
                                                        locale: ptBR
                                                    })
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[log.status]}`}
                                            >
                                                {statusLabels[log.status]}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Paginação */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                    >
                        <ChevronLeftIcon className="h-5 w-5 inline mr-1" />
                        Anterior
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                        Página {pagination.page} de {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                    >
                        Próxima
                        <ChevronRightIcon className="h-5 w-5 inline ml-1" />
                    </button>
                </div>
            </div>
        </div>
    )
} 