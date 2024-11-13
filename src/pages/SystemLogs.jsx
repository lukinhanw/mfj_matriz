import { useState } from 'react'
import LogList from '../components/logs/LogList'
import LogFilters from '../components/logs/LogFilters'
import LogSearch from '../components/logs/LogSearch'

export default function SystemLogs() {
  const [filters, setFilters] = useState({
    type: [],
    user: [],
    period: '7d'
  })
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="space-y-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Logs do Sistema</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <LogSearch value={searchTerm} onChange={setSearchTerm} />
        <div className="border-t border-gray-200 pt-6">
          <LogFilters filters={filters} onChange={setFilters} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Histórico de Atividades
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Lista de todas as ações realizadas no sistema
          </p>
        </div>
        <LogList 
          filters={filters}
          searchTerm={searchTerm}
        />
      </div>
    </div>
  )
}