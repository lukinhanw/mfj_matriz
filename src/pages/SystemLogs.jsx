import { useState, useEffect } from 'react'
import LogList from '../components/logs/LogList'
import LogFilters from '../components/logs/LogFilters'

export default function SystemLogs() {
	const [filters, setFilters] = useState({
		type: [],
		user: [],
		period: '7d'
	})
	const [itemsPerPage, setItemsPerPage] = useState(10)

	useEffect(() => {
		if (!filters || typeof filters !== 'object') {
			setFilters({
				type: [],
				user: [],
				period: '7d'
			});
			return;
		}
		
		const updatedFilters = { ...filters };
		if (!Array.isArray(updatedFilters.type)) {
			updatedFilters.type = [];
		}
		if (!Array.isArray(updatedFilters.user)) {
			updatedFilters.user = [];
		}
		if (!updatedFilters.period) {
			updatedFilters.period = '7d';
		}
		
		if (JSON.stringify(updatedFilters) !== JSON.stringify(filters)) {
			setFilters(updatedFilters);
		}
	}, [filters]);

	return (
		<div className="space-y-8">
			<div className="sm:flex sm:items-center sm:justify-between">
				<h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Logs do Sistema</h1>
			</div>

			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6">
				<div>
					<LogFilters filters={filters} onChange={setFilters} />
				</div>
			</div>

			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
				<div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
					<div>
						<h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
							Histórico de Atividades
						</h2>
						<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
							Lista de todas as ações realizadas no sistema
						</p>
					</div>
					<select
						value={itemsPerPage}
						onChange={(e) => setItemsPerPage(e.target.value === 'all' ? 10000 : Number(e.target.value))}
						className="w-32 rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600"
					>
						<option value="10">10 itens</option>
						<option value="50">50 itens</option>
						<option value="100">100 itens</option>
						<option value="500">500 itens</option>
						<option value="1000">1000 itens</option>
						<option value="10000">10000 itens</option>
						<option value="100000">100000 itens</option>
					</select>
				</div>
				<LogList 
					filters={filters} 
					itemsPerPage={itemsPerPage}
				/>
			</div>
		</div>
	)
}