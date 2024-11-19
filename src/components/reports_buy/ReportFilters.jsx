import { useState, useEffect } from 'react'
import Select from 'react-select'
import { FunnelIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import useAuthStore from '../../store/authStore'

const periodOptions = [
	{ value: '7d', label: 'Últimos 7 dias' },
	{ value: '30d', label: 'Últimos 30 dias' },
	{ value: '90d', label: 'Últimos 3 meses' },
	{ value: '365d', label: 'Último ano' },
	{ value: 'custom', label: 'Período personalizado' }
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

function DateRangePicker({ startDate, endDate, onChange }) {
	return (
		<div className="flex gap-4">
			<div>
				<label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-500">
					Data inicial
				</label>
				<input
					type="date"
					id="startDate"
					value={startDate}
					onChange={(e) => onChange('startDate', e.target.value)}
					className="mt-1 block w-full rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-normal text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
				/>
			</div>
			<div>
				<label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-500">
					Data final
				</label>
				<input
					type="date"
					id="endDate"
					value={endDate}
					onChange={(e) => onChange('endDate', e.target.value)}
					className="mt-1 block w-full rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-normal text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
				/>
			</div>
		</div>
	)
}

function ActiveFilters({ filters, onRemove, companies, departments, courses }) {
	const activeFilters = []

	if (filters.company.length > 0) {
		filters.company.forEach(companyId => {
			const companyName = companies.find(c => c.id.toString() === companyId)?.name
			activeFilters.push({ key: 'company', value: companyId, label: `Empresa: ${companyName}` })
		})
	}

	if (filters.department.length > 0) {
		filters.department.forEach(departmentId => {
			const departmentName = departments.find(d => d.id.toString() === departmentId)?.name
			activeFilters.push({ key: 'department', value: departmentId, label: `Setor: ${departmentName}` })
		})
	}

	if (filters.course.length > 0) {
		filters.course.forEach(courseId => {
			const courseName = courses.find(c => c.id.toString() === courseId)?.title
			activeFilters.push({ key: 'course', value: courseId, label: `Curso: ${courseName}` })
		})
	}

	if (activeFilters.length === 0) return null

	return (
		<div className="mt-4">
			<h4 className="text-sm font-medium text-gray-700">Filtros ativos:</h4>
			<div className="mt-2 flex flex-wrap gap-2">
				{activeFilters.map((filter, index) => (
					<span
						key={`${filter.key}-${filter.value}-${index}`}
						className="inline-flex items-center gap-x-1 rounded-md bg-primary-50 dark:bg-primary-900 px-2 py-1 text-sm font-medium text-primary-700 dark:text-primary-300"
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

export default function ReportFilters({ filters, onChange }) {
	const { token } = useAuthStore()
	const [companies, setCompanies] = useState([])
	const [departments, setDepartments] = useState([])
	const [courses, setCourses] = useState([])

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [companiesResponse, departmentsResponse, coursesResponse] = await Promise.all([
					axios.get('https://api-matriz-mfj.8bitscompany.com/admin/listarEmpresas', {
						headers: { Authorization: `Bearer ${token}` }
					}),
					axios.get('https://api-matriz-mfj.8bitscompany.com/admin/listarSetores', {
						headers: { Authorization: `Bearer ${token}` }
					}),
					axios.get('https://api-matriz-mfj.8bitscompany.com/admin/listarCursos', {
						headers: { Authorization: `Bearer ${token}` }
					})
				])

				setCompanies(companiesResponse.data)
				setDepartments(departmentsResponse.data)
				setCourses(coursesResponse.data)
			} catch (error) {
				console.error('Error fetching data:', error)
				toast.error('Erro ao carregar dados dos filtros')
			}
		}

		fetchData()
	}, [token])

	const handleFilterChange = (key, values) => {
		onChange({ ...filters, [key]: values })
	}

	const handleDateRangeChange = (key, value) => {
		onChange({
			...filters,
			dateRange: {
				...filters.dateRange,
				[key]: value
			}
		})
	}

	const handleRemoveFilter = (key, value) => {
		if (key === 'all') {
			onChange({
				period: '30d',
				company: [],
				department: [],
				course: [],
				dateRange: { startDate: '', endDate: '' }
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
			<div className="flex items-center gap-2 text-sm text-gray-500">
				<FunnelIcon className="h-5 w-5" />
				<span>Filtros:</span>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700 dark:text-gray-500">
					Período
				</label>
				<select
					value={filters.period}
					onChange={(e) => handleFilterChange('period', e.target.value)}
					className="mt-1 block w-80 justify-center gap-x-1.5 rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
				>
					{periodOptions.map(option => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			</div>

			{filters.period === 'custom' && (
				<DateRangePicker
					startDate={filters.dateRange?.startDate}
					endDate={filters.dateRange?.endDate}
					onChange={handleDateRangeChange}
				/>
			)}

			<div className="grid gap-4 md:grid-cols-3">
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-500">
						Empresa
					</label>
					<FilterDropdown
						label="Selecionar empresas"
						selectedValues={filters.company}
						onChange={(values) => handleFilterChange('company', values)}
						options={companies?.map(company => ({
							value: company.id.toString(),
							label: company.name
						}))}
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-500">
						Setor
					</label>
					<FilterDropdown
						label="Selecionar setores"
						selectedValues={filters.department}
						onChange={(values) => handleFilterChange('department', values)}
						options={departments.map(dept => ({
							value: dept.id.toString(),
							label: dept.name
						}))}
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-500">
						Curso
					</label>
					<FilterDropdown
						label="Selecionar cursos"
						selectedValues={filters.course}
						onChange={(values) => handleFilterChange('course', values)}
						options={courses?.map(course => ({
							value: course.id.toString(),
							label: course.title
						}))}
					/>
				</div>
			</div>

			<ActiveFilters filters={filters} onRemove={handleRemoveFilter} companies={companies} departments={departments} courses={courses} />
		</div>
	)
}