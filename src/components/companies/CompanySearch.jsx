import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

function CompanySearch({ value, onChange }) {
	return (
		<div>
			<label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
				Pesquisar Empresas
			</label>
			<div className="mt-2 relative rounded-md shadow-sm">
				<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
					<MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-300" aria-hidden="true" />
				</div>
				<input
					type="text"
					name="search"
					id="search"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className="block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 pl-10 focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-400 dark:focus:ring-primary-400 sm:text-sm transition-colors"
					placeholder="Buscar por nome, documento, email ou telefone..."
				/>
			</div>
		</div>
	)
}

export default CompanySearch