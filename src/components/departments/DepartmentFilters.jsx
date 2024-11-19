import Select from 'react-select'
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'

const statusOptions = [
	{ value: 'active', label: 'Ativos' },
	{ value: 'inactive', label: 'Inativos' }
]

function FilterDropdown({ label, options, selectedValues, onChange }) {

	const customStyles = {
		control: (base, state) => ({
			...base,
			backgroundColor: 'var(--bg-input)',
			borderColor: 'var(--border-input)',
			color: 'var(--text-primary)',
			boxShadow: state.isFocused ? 'none' : base.boxShadow,
			'&:hover': {
				borderColor: 'var(--border-input-hover)'
			}
		}),
		menu: (base) => ({
			...base,
			backgroundColor: 'var(--bg-input)',
			zIndex: 100
		}),
		option: (base, { isFocused, isSelected }) => ({
			...base,
			backgroundColor: isSelected
				? 'var(--primary-600)'
				: isFocused
					? 'var(--bg-hover)'
					: 'var(--bg-input)',
			color: isSelected
				? 'white'
				: 'var(--text-primary)'
		}),
		multiValue: (base) => ({
			...base,
			backgroundColor: 'var(--primary-100)',
		}),
		multiValueLabel: (base) => ({
			...base,
			color: 'var(--primary-700)',
		}),
		multiValueRemove: (base) => ({
			...base,
			color: 'var(--primary-700)',
			'&:hover': {
				backgroundColor: 'var(--primary-200)',
				color: 'var(--primary-900)',
			},
		}),
		input: (base) => ({
			...base,
			color: 'var(--text-primary)',
		}),
		placeholder: (base) => ({
			...base,
			color: 'var(--text-primary)',
		}),
	}

	return (
		<Select
			isMulti
			options={options}
			value={options.filter(option => selectedValues.includes(option.value))}
			onChange={(selected) => onChange(selected ? selected.map(item => item.value) : [])}
			placeholder={label}
			className="w-full"
			classNamePrefix="select"
			styles={customStyles}
			noOptionsMessage={() => 'Nenhum item encontrado'}
		/>
	)
}

function ActiveFilters({ filters, onRemove }) {
	const activeFilters = []

	if (filters.status.length > 0) {
		filters.status.forEach(status => {
			const statusLabel = statusOptions.find(s => s.value === status)?.label
			activeFilters.push({ key: 'status', value: status, label: `Status: ${statusLabel}` })
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
						className="inline-flex items-center gap-x-1 rounded-md bg-primary-50 dark:bg-primary-900 px-2 py-1 text-sm font-medium text-primary-700 dark:text-primary-100"
					>
						{filter.label}
						<button
							type="button"
							onClick={() => onRemove(filter.key, filter.value)}
							className="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-primary-600/20 dark:hover:bg-primary-300/20"
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

function DepartmentFilters({ filters, onChange }) {
	const handleFilterChange = (key, values) => {
		onChange({ ...filters, [key]: values })
	}

	const handleRemoveFilter = (key, value) => {
		if (key === 'all') {
			onChange({
				status: []
			})
		} else {
			onChange({
				...filters,
				[key]: filters[key].filter(v => v !== value)
			})
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
				<FunnelIcon className="h-5 w-5" />
				<span>Filtros:</span>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<FilterDropdown
					label="Status"
					selectedValues={filters.status}
					onChange={(values) => handleFilterChange('status', values)}
					options={statusOptions}
				/>
			</div>

			<ActiveFilters filters={filters} onRemove={handleRemoveFilter} />
		</div>
	)
}

export default DepartmentFilters