import { useState, useEffect } from 'react'
import Select from 'react-select'
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'
import useAuthStore from '../../store/authStore'
import axios from 'axios'

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

// Atualizar o componente ActiveFilters para receber users como prop
function ActiveFilters({ filters, onRemove }) {
	const activeFilters = []

	if (filters.type.length > 0) {
		filters.type.forEach(type => {
			const typeLabel = typeOptions.find(t => t.value === type)?.label
			activeFilters.push({ key: 'type', value: type, label: `Tipo: ${typeLabel}` })
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

// Atualizar a renderização do ActiveFilters no componente LogFilters
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

				<div className="grid gap-4 md:grid-cols-3">
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

				</div>
			</div>

			<ActiveFilters filters={filters} onRemove={handleRemoveFilter} />
		</div>
	)
}