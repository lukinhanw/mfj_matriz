import { useState, useEffect } from 'react'
import Select from 'react-select'
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { customSelectStyles } from '../../styles/selectStyles'
import api from '../../utils/api'
import useAuthStore from '../../store/authStore'
import { toast } from 'react-hot-toast'

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

function FilterDropdown({ label, options, selectedValues, onChange }) {
	// Garantir que options e selectedValues sejam sempre arrays válidos
	const safeOptions = Array.isArray(options) ? options.filter(option => option && typeof option === 'object') : [];
	const safeSelectedValues = Array.isArray(selectedValues) ? selectedValues.filter(value => value != null) : [];
	
	// Função segura para lidar com mudanças
	const handleChange = (selected) => {
		if (typeof onChange === 'function') {
			const values = selected && Array.isArray(selected) 
				? selected
					.filter(item => item && typeof item === 'object' && item.value != null)
					.map(item => item.value) 
				: [];
			onChange(values);
		}
	};
	
	return (
		<Select
			isMulti
			options={safeOptions}
			value={safeOptions.filter(option => 
				option && 
				typeof option === 'object' && 
				option.value != null && 
				safeSelectedValues.includes(option.value)
			)}
			onChange={handleChange}
			placeholder={label || 'Selecionar'}
			className="w-full"
			classNamePrefix="select"
			styles={customSelectStyles}
			noOptionsMessage={() => 'Nenhum item encontrado'}
		/>
	)
}

// Atualizar o componente ActiveFilters para receber users como prop
function ActiveFilters({ filters, onRemove, userOptions }) {
	// Verificar se filters é um objeto válido
	if (!filters || typeof filters !== 'object') {
		return null;
	}
	
	const activeFilters = [];
	
	// Garantir que filters.type e filters.user sejam sempre arrays
	const typeFilters = Array.isArray(filters.type) ? filters.type : [];
	const userFilters = Array.isArray(filters.user) ? filters.user : [];
	
	// Garantir que userOptions seja sempre um array
	const safeUserOptions = Array.isArray(userOptions) ? userOptions : [];

	if (typeFilters.length > 0) {
		typeFilters.forEach(type => {
			if (type) { // Verificar se o tipo não é nulo
				const typeOption = typeOptions.find(t => t && t.value === type);
				const typeLabel = typeOption && typeOption.label ? typeOption.label : type;
				activeFilters.push({ key: 'type', value: type, label: `Tipo: ${typeLabel}` });
			}
		});
	}
	
	if (userFilters.length > 0) {
		userFilters.forEach(userId => {
			if (userId) { // Verificar se o userId não é nulo
				const userOption = safeUserOptions.find(u => u && u.value === userId);
				const userLabel = userOption && userOption.label ? userOption.label : userId;
				activeFilters.push({ key: 'user', value: userId, label: `Usuário: ${userLabel}` });
			}
		});
	}

	if (activeFilters.length === 0) return null;
	
	// Função segura para lidar com remoção de filtros
	const handleRemove = (key, value) => {
		if (typeof onRemove === 'function') {
			onRemove(key, value);
		}
	};

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
							onClick={() => handleRemove(filter.key, filter.value)}
							className="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-orange-600/20 dark:hover:bg-orange-600/30"
						>
							<span className="sr-only">Remove filter</span>
							<XMarkIcon className="h-3.5 w-3.5" />
						</button>
					</span>
				))}
				<button
					onClick={() => handleRemove('all')}
					className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
				>
					Limpar todos
				</button>
			</div>
		</div>
	)
}

// Atualizar a renderização do ActiveFilters no componente LogFilters
export default function LogFilters({ filters, onChange }) {
	const { token } = useAuthStore()
	const [userOptions, setUserOptions] = useState([])
	const [isLoadingUsers, setIsLoadingUsers] = useState(false)

	useEffect(() => {
		const fetchUsers = async () => {
			setIsLoadingUsers(true)
			try {
				const response = await api.get('/admin/pessoasLogs', {
					headers: { Authorization: `Bearer ${token}` }
				})
				
				if (response.data && Array.isArray(response.data)) {
					const options = response.data.map(user => ({
						value: user.id.toString(),
						label: user.name
					}))
					setUserOptions(options)
				}
			} catch (error) {
				console.error('Erro ao carregar usuários:', error)
				toast.error('Erro ao carregar lista de usuários')
			} finally {
				setIsLoadingUsers(false)
			}
		}

		if (token) {
			fetchUsers()
		}
	}, [token])

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
			// Garantir que filters[key] seja um array
			const currentFilters = Array.isArray(filters[key]) ? filters[key] : [];
			onChange({
				...filters,
				[key]: currentFilters.filter(v => v !== value)
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

					<div className="mb-4 md:mb-0">
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-500">
							Tipo
						</label>
						<div className="mt-1">
							<FilterDropdown
								label="Selecionar tipos"
								selectedValues={filters.type}
								onChange={(values) => handleFilterChange('type', values)}
								options={typeOptions}
							/>
						</div>
					</div>
					
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-500">
							Usuário
						</label>
						<div className="mt-1">
							<FilterDropdown
								label={isLoadingUsers ? "Carregando usuários..." : "Selecionar usuários"}
								selectedValues={filters.user}
								onChange={(values) => handleFilterChange('user', values)}
								options={userOptions}
							/>
						</div>
					</div>
				</div>
			</div>

			<ActiveFilters filters={filters} onRemove={handleRemoveFilter} userOptions={userOptions} />
		</div>
	)
}