import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

function ManagerSearch({ value, onChange }) {
	return (
		<div>
			<label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
				Pesquisar Gestores
			</label>
			<div className="mt-2 relative rounded-md shadow-sm">
				<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
					<MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
				</div>
				<input
					type="text"
					name="search"
					id="search"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className="block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 pl-10 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
					placeholder="Buscar por nome ou email..."
				/>
			</div>
		</div>
	)
}

export default ManagerSearch