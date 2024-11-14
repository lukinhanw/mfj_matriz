import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { FunnelIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline'

const typeOptions = [
	{ value: 'system', label: 'Sistema' },
	{ value: 'user', label: 'Usuário' },
	{ value: 'course', label: 'Curso' }
]

const periodOptions = [
	{ value: '7d', label: 'Últimos 7 dias' },
	{ value: '30d', label: 'Últimos 30 dias' },
	{ value: '90d', label: 'Últimos 3 meses' },
	{ value: '365d', label: 'Últimos 12 meses' }
]

// Mock data - substituir por dados da API
const users = [
	{ id: 1, name: 'João Silva' },
	{ id: 2, name: 'Maria Santos' }
]

function FilterDropdown({ label, options, selectedValues, onChange }) {
	const isOptionSelected = (value) => selectedValues.includes(value)
	const selectedCount = selectedValues.length
	return (
		<Menu as="div" className="relative inline-block text-left">
			<div>
				<Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
					{label}
					{selectedCount > 0 && (
						<span className="ml-1 text-primary-600">({selectedCount})</span>
					)}
					<ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400 dark:text-gray-300" aria-hidden="true" />
				</Menu.Button>
			</div>
			<Transition
				as={Fragment}
				enter="transition ease-out duration-100"
				enterFrom="transform opacity-0 scale-95"
				enterTo="transform opacity-100 scale-100"
				leave="transition ease-in duration-75"
				leaveFrom="transform opacity-100 scale-100"
				leaveTo="transform opacity-0 scale-95"
			>
				<Menu.Items className="absolute right-0 z-[100] mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-gray-700 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-600 focus:outline-none">
					<div className="py-1">
						{options.map((option) => (
							<Menu.Item key={option.value}>
								{({ active }) => (
									<button
										onClick={() => {
											const newValues = isOptionSelected(option.value)
												? selectedValues.filter(v => v !== option.value)
												: [...selectedValues, option.value]
											onChange(newValues)
										}}
										className={`${active ? 'bg-gray-100 dark:bg-gray-600' : ''
											} flex items-center px-4 py-2 text-sm w-full text-left dark:text-white`}
									>
										<input
											type="checkbox"
											checked={isOptionSelected(option.value)}
											onChange={() => { }}
											className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 mr-2"
										/>
										<span className={isOptionSelected(option.value) ? 'text-primary-900 dark:text-primary-400 font-medium' : 'text-gray-700 dark:text-gray-300'}>
											{option.label}
										</span>
									</button>
								)}
							</Menu.Item>
						))}
					</div>
				</Menu.Items>
			</Transition>
		</Menu>
	)
}

function ActiveFilters({ filters, onRemove }) {
	const activeFilters = []

	if (filters.type.length > 0) {
		filters.type.forEach(type => {
			const typeLabel = typeOptions.find(t => t.value === type)?.label
			activeFilters.push({ key: 'type', value: type, label: `Tipo: ${typeLabel}` })
		})
	}

	if (filters.user.length > 0) {
		filters.user.forEach(userId => {
			const userName = users.find(u => u.id.toString() === userId)?.name
			activeFilters.push({ key: 'user', value: userId, label: `Usuário: ${userName}` })
		})
	}

	if (activeFilters.length === 0) return null

	return (
		<div className="mt-4">
			<h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtros ativos:</h4>
			<div className="mt-2 flex flex-wrap gap-2">
				{activeFilters.map((filter, index) => (
					<span
						key={`${filter.key}-${filter.value}-${index}`}
						className="inline-flex items-center gap-x-1 rounded-md bg-primary-50 dark:bg-primary-900 px-2 py-1 text-sm font-medium text-primary-700 dark:text-primary-200"
					>
						{filter.label}
						<button
							type="button"
							onClick={() => onRemove(filter.key, filter.value)}
							className="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-primary-600/20 dark:hover:bg-primary-600/30"
						>
							<span className="sr-only">Remove filter</span>
							<XMarkIcon className="h-3.5 w-3.5" />
						</button>
					</span>
				))}
				<button
					onClick={() => onRemove('all')}
					className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
				>
					Limpar todos
				</button>
			</div>
		</div>
	)
}

export default function LogFilters({ filters, onChange }) {
	const handleFilterChange = (key, value) => {
		onChange({ ...filters, [key]: value })
	}

	const handleRemoveFilter = (key, value) => {
		if (key === 'all') {
			onChange({
				type: [],
				user: [],
				period: '7d'
			})
		} else {
			onChange({
				...filters,
				[key]: filters[key].filter(v => v !== value)
			})
		}
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
				<FunnelIcon className="h-5 w-5" />
				<span>Filtros:</span>
			</div>

			<div className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-500">
						Período
					</label>
					<select
						value={filters.period}
						onChange={(e) => handleFilterChange('period', e.target.value)}
						className="mt-1 block w-full md:w-80 justify-center gap-x-1.5 rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
					>
						{periodOptions.map(option => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-500">
							Tipo
						</label>
						<FilterDropdown
							label="Selecionar tipos"
							selectedValues={filters.type}
							onChange={(values) => handleFilterChange('type', values)}
							options={typeOptions}
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-500">
							Usuário
						</label>
						<FilterDropdown
							label="Selecionar usuários"
							selectedValues={filters.user}
							onChange={(values) => handleFilterChange('user', values)}
							options={users.map(user => ({
								value: user.id.toString(),
								label: user.name
							}))}
						/>
					</div>
				</div>
			</div>

			<ActiveFilters filters={filters} onRemove={handleRemoveFilter} />
		</div>
	)
}