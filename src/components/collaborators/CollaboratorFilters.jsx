import { FunnelIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Select from 'react-select'
import { customSelectStyles } from '../../styles/selectStyles'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import api from '../../utils/api'
import useAuthStore from '../../store/authStore'

const statusOptions = [
	{ value: 'active', label: 'Ativos' },
	{ value: 'inactive', label: 'Inativos' }
]

const evaluatedOptions = [
	{ value: 'yes', label: 'Avaliados' },
	{ value: 'no', label: 'Não avaliados' }
]

const initialFilters = {
	status: [],
	companies: [],
	departments: [],
	positions: [],
	evaluated: []
}

function FilterDropdown({ label, options, selectedValues, onChange }) {
	return (
		<Select
			isMulti
			options={options}
			value={options.filter(option => selectedValues.includes(option.value))}
			onChange={(selected) => onChange(selected ? selected.map(item => item.value) : [])}
			placeholder={label}
			className="w-full"
			classNamePrefix="select"
			styles={customSelectStyles}
			noOptionsMessage={() => 'Nenhum item encontrado'}
		/>
	)
}

function ActiveFilters({ filters, companies, departments, positions, onRemove }) {
	const hasActiveFilters = Object.values(filters).some(filterArray => filterArray.length > 0)

	if (!hasActiveFilters) {
		return null
	}

	const filterLabels = {
		status: {
			active: 'Ativo',
			inactive: 'Inativo'
		},
		evaluated: {
			yes: 'Avaliado',
			no: 'Não avaliado'
		}
	}

	const getFilterLabel = (type, value) => {
		if (type === 'status' || type === 'evaluated') {
			return filterLabels[type][value]
		} else if (type === 'companies') {
			const company = companies.find(c => c.id.toString() === value)
			return company ? company.name : value
		} else if (type === 'departments') {
			const department = departments.find(d => d.id.toString() === value)
			return department ? department.name : value
		} else if (type === 'positions') {
			const position = positions.find(p => p.id.toString() === value)
			return position ? position.name : value
		}
		return value
	}

	return (
		<div className="mt-4">
			<div className="flex flex-wrap gap-2">
				{Object.entries(filters).map(([key, values]) =>
					values.map(value => (
						<span
							key={`${key}-${value}`}
							className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
						>
							{key === 'status' && 'Status: '}
							{key === 'companies' && 'Empresa: '}
							{key === 'departments' && 'Setor: '}
							{key === 'positions' && 'Cargo: '}
							{key === 'evaluated' && 'Avaliação: '}
							{getFilterLabel(key, value)}
							<button
								type="button"
								onClick={() => onRemove(key, value)}
								className="ml-1.5 inline-flex items-center justify-center flex-shrink-0 h-4 w-4 rounded-full text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:text-gray-500 dark:focus:text-gray-400 transition-colors"
							>
								<XMarkIcon className="h-3 w-3" />
							</button>
						</span>
					))
				)}
				{hasActiveFilters && (
					<button
						type="button"
						onClick={() => onRemove('all')}
						className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 dark:text-red-300 hover:text-red-500 dark:hover:text-red-200"
					>
						Limpar todos
					</button>
				)}
			</div>
		</div>
	)
}

function CollaboratorFilters({ onFilterChange }) {
	const { token } = useAuthStore()
	const [filters, setFilters] = useState(initialFilters)
	const [companies, setCompanies] = useState([])
	const [departments, setDepartments] = useState([])
	const [positions, setPositions] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const [isFiltersOpen, setIsFiltersOpen] = useState(false)

	useEffect(() => {
		const fetchFilterData = async () => {
			setIsLoading(true)
			try {
				const [companiesRes, departmentsRes, positionsRes] = await Promise.all([
					api.get('/admin/listarEmpresas', {
						headers: { Authorization: `Bearer ${token}` }
					}),
					api.get('/admin/listarSetores', {
						headers: { Authorization: `Bearer ${token}` }
					}),
					api.get('/admin/listarCargos', {
						headers: { Authorization: `Bearer ${token}` }
					})
				])

				setCompanies(companiesRes.data)
				setDepartments(departmentsRes.data)
				setPositions(positionsRes.data)
			} catch (error) {
				console.error('Error fetching filter data:', error)
				toast.error('Erro ao carregar dados de filtro')
			} finally {
				setIsLoading(false)
			}
		}

		if (token) {
			fetchFilterData()
		}
	}, [token])

	const handleFilterChange = (filterType, value) => {
		// Se for para limpar todos os filtros
		if (filterType === 'all') {
			setFilters(initialFilters);
			onFilterChange(initialFilters);
			return;
		}
		
		setFilters(prevFilters => {
			const newFilters = { ...prevFilters };

			if (newFilters[filterType].includes(value)) {
				newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
			} else {
				newFilters[filterType] = [...newFilters[filterType], value];
			}

			onFilterChange(newFilters);
			return newFilters;
		});
	}

	const handleSelectChange = (filterType, values) => {
		setFilters(prevFilters => {
			const newFilters = { 
				...prevFilters,
				[filterType]: values
			}
			onFilterChange(newFilters)
			return newFilters
		})
	}

	const clearFilters = () => {
		setFilters(initialFilters)
		onFilterChange(initialFilters)
	}

	const hasActiveFilters = Object.values(filters).some(filterArray => filterArray.length > 0)

	const renderFilterToggle = () => (
		<button
			onClick={() => setIsFiltersOpen(prev => !prev)}
			className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
		>
			<span className="mr-1">{isFiltersOpen ? 'Ocultar' : 'Mostrar'} filtros</span>
			{hasActiveFilters && (
				<span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-400">
					{Object.values(filters).reduce((acc, curr) => acc + curr.length, 0)}
				</span>
			)}
		</button>
	)

	if (isLoading) {
		return <div className="text-sm text-gray-500 dark:text-gray-400">Carregando filtros...</div>
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
				<FunnelIcon className="h-5 w-5" />
				<span>Filtros:</span>
			</div>

			<div className="flex justify-between items-center mb-4">
				<div className="text-lg font-medium text-gray-700 dark:text-gray-300">Filtros</div>
				<div className="flex items-center space-x-3">
					{renderFilterToggle()}
				</div>
			</div>

			{isFiltersOpen && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
					<div className="mb-2">
						<h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</h3>
						<FilterDropdown
							label="Selecione o status"
							selectedValues={filters.status}
							onChange={(values) => handleSelectChange('status', values)}
							options={statusOptions}
						/>
					</div>

					<div className="mb-2">
						<h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Avaliado</h3>
						<FilterDropdown
							label="Selecione o status da avaliação"
							selectedValues={filters.evaluated}
							onChange={(values) => handleSelectChange('evaluated', values)}
							options={evaluatedOptions}
						/>
					</div>

					{companies.length > 0 && (
						<div className="mb-2">
							<h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Empresa</h3>
							<FilterDropdown
								label="Selecione a empresa"
								selectedValues={filters.companies}
								onChange={(values) => handleSelectChange('companies', values)}
								options={companies.map(company => ({
									value: company.id.toString(),
									label: company.name
								}))}
							/>
						</div>
					)}

					{departments.length > 0 && (
						<div className="mb-2">
							<h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Setor</h3>
							<FilterDropdown
								label="Selecione o setor"
								selectedValues={filters.departments}
								onChange={(values) => handleSelectChange('departments', values)}
								options={departments.map(dept => ({
									value: dept.id.toString(),
									label: dept.name
								}))}
							/>
						</div>
					)}

					{positions.length > 0 && (
						<div className="mb-2">
							<h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cargo</h3>
							<FilterDropdown
								label="Selecione o cargo"
								selectedValues={filters.positions}
								onChange={(values) => handleSelectChange('positions', values)}
								options={positions.map(pos => ({
									value: pos.id.toString(),
									label: pos.name
								}))}
							/>
						</div>
					)}
				</div>
			)}

			<ActiveFilters
				filters={filters}
				companies={companies}
				departments={departments}
				positions={positions}
				onRemove={handleFilterChange}
			/>
		</div>
	)
}

export default CollaboratorFilters