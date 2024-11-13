import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { FunnelIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline'

const statusOptions = [
  { value: 'active', label: 'Ativos' },
  { value: 'inactive', label: 'Inativos' }
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
                    className={`${
                      active ? 'bg-gray-100 dark:bg-gray-600' : ''
                    } flex items-center px-4 py-2 text-sm w-full text-left dark:text-white`}
                  >
                    <input
                      type="checkbox"
                      checked={isOptionSelected(option.value)}
                      onChange={() => {}}
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

function ActiveFilters({ filters, companies, departments, onRemove }) {
  const activeFilters = []
  if (filters.status.length > 0) {
    filters.status.forEach(status => {
      const statusLabel = statusOptions.find(s => s.value === status)?.label
      activeFilters.push({ key: 'status', value: status, label: `Status: ${statusLabel}` })
    })
  }
  if (filters.companies.length > 0) {
    filters.companies.forEach(companyId => {
      const companyName = companies.find(c => c.id.toString() === companyId)?.name
      activeFilters.push({ key: 'companies', value: companyId, label: `Empresa: ${companyName}` })
    })
  }
  if (filters.departments.length > 0) {
    filters.departments.forEach(departmentId => {
      const departmentName = departments.find(d => d.id.toString() === departmentId)?.name
      activeFilters.push({ key: 'departments', value: departmentId, label: `Setor: ${departmentName}` })
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
            className="inline-flex items-center gap-x-1 rounded-md bg-primary-50 px-2 py-1 text-sm font-medium text-primary-700"
          >
            {filter.label}
            <button
              type="button"
              onClick={() => onRemove(filter.key, filter.value)}
              className="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-primary-600/20"
            >
              <span className="sr-only">Remove filter</span>
              <XMarkIcon className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        <button
          onClick={() => onRemove('all')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Limpar todos
        </button>
      </div>
    </div>
  )
}

function ManagerFilters({ filters, onChange, companies = [], departments = [] }) {
  const handleFilterChange = (key, values) => {
    onChange({ ...filters, [key]: values })
  }

  const handleRemoveFilter = (key, value) => {
    if (key === 'all') {
      onChange({
        status: [],
        companies: [],
        departments: []
      })
    } else {
      onChange({
        ...filters,
        [key]: filters[key].filter(v => v !== value)
      })
    }
  }

  // Filter departments based on selected companies
  const filteredDepartments = departments.filter(dept =>
    filters.companies.length === 0 ||
    filters.companies.includes(dept.empresa_id?.toString())
  )

  return (
    <div className="relative">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <FunnelIcon className="h-5 w-5" />
        <span>Filtros:</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-4">
        <FilterDropdown
          label="Status"
          selectedValues={filters.status}
          onChange={(values) => handleFilterChange('status', values)}
          options={statusOptions}
        />
        <FilterDropdown
          label="Empresa"
          selectedValues={filters.companies}
          onChange={(values) => handleFilterChange('companies', values)}
          options={companies.map(company => ({
            value: company.id.toString(),
            label: company.name
          }))}
        />
        <FilterDropdown
          label="Setor"
          selectedValues={filters.departments}
          onChange={(values) => handleFilterChange('departments', values)}
          options={filteredDepartments.map(dept => ({
            value: dept.id.toString(),
            label: dept.name
          }))}
        />
      </div>
      <ActiveFilters
        filters={filters}
        companies={companies}
        departments={departments}
        onRemove={handleRemoveFilter}
      />
    </div>
  )
}

export default ManagerFilters