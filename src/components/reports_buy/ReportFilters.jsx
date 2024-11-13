import { Fragment, useState, useEffect } from 'react'
import { Menu, Transition } from '@headlessui/react'
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
	const isOptionSelected = (value) => selectedValues.includes(value)
	const selectedCount = selectedValues.length

	return (
		<Menu as="div" className="relative inline-block text-left">
			<div>
				<Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
					{label}
					{selectedCount > 0 && (
						<span className="ml-1 text-primary-600">({selectedCount})</span>
					)}
					<ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
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
				<Menu.Items className="absolute right-0 z-[100] mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
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
										className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''
											} flex items-center px-4 py-2 text-sm w-full text-left text-gray-700 dark:text-gray-300`}
									>
										<input
											type="checkbox"
											checked={isOptionSelected(option.value)}
											onChange={() => { }}
											className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-2"
										/>
										<span className={isOptionSelected(option.value) ? 'text-primary-900 dark:text-primary-300 font-medium' : 'text-gray-700 dark:text-gray-300'}>
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

function DateRangePicker({ startDate, endDate, onChange }) {
	return (
		<div className="flex gap-4">
			<div>
				<label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
					Data inicial
				</label>
				<input
					type="date"
					id="startDate"
					value={startDate}
					onChange={(e) => onChange('startDate', e.target.value)}
					className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
				/>
			</div>
			<div>
				<label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
					Data final
				</label>
				<input
					type="date"
					id="endDate"
					value={endDate}
					onChange={(e) => onChange('endDate', e.target.value)}
					className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
				<label className="block text-sm font-medium text-gray-700">
					Período
				</label>
				<select
					value={filters.period}
					onChange={(e) => handleFilterChange('period', e.target.value)}
					className="mt-1 block w-80 rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
					<label className="block text-sm font-medium text-gray-700">
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
					<label className="block text-sm font-medium text-gray-700">
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
					<label className="block text-sm font-medium text-gray-700">
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