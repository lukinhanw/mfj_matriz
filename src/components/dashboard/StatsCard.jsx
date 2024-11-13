import {
	BuildingOfficeIcon,
	BuildingOffice2Icon,
	UserGroupIcon,
	UsersIcon,
	AcademicCapIcon,
	ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline'

const icons = {
	companies: BuildingOfficeIcon,
	departments: BuildingOffice2Icon,
	managers: UserGroupIcon,
	employees: UsersIcon,
	courses: AcademicCapIcon,
	evaluations: ClipboardDocumentCheckIcon
}

function StatsCard({ title, value, icon }) {
	const Icon = icons[icon]

	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/20 p-6 transition-colors">
			<div className="flex items-center">
				<div className="flex-shrink-0">
					<Icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
				</div>
				<div className="ml-5 w-0 flex-1">
					<dl>
						<dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</dt>
						<dd className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</dd>
					</dl>
				</div>
			</div>
		</div>
	)
}

export default StatsCard