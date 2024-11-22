import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
	AcademicCapIcon,
	UserGroupIcon,
	UsersIcon,
	UserIcon
} from '@heroicons/react/24/outline'

const icons = {
	course: AcademicCapIcon,
	employee: UserGroupIcon,
	client: UsersIcon,
	user: UserIcon
}

function ActivityFeed({ activities }) {
	if (!Array.isArray(activities) || activities.length === 0) {
		return (
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/20 transition-colors p-6">
				<h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
					Atividades Recentes
				</h2>
				<p className="mt-4 text-gray-500 dark:text-gray-400">Nenhuma atividade para exibir.</p>
			</div>
		)
	}

	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/20 transition-colors">
			<div className="p-6">
				<h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
					Atividades Recentes
				</h2>
				<div className="mt-4 flow-root">
					<ul className="-mb-8">
						{activities.map((activity, index) => {
							const Icon = icons[activity.type] || UserIcon // Fallback para UserIcon
							return (
								<li key={activity.id}>
									<div className="relative pb-8">
										{index !== activities.length - 1 && (
											<span
												className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
												aria-hidden="true"
											/>
										)}
										<div className="relative flex items-start space-x-3">
											<div className="relative">
												<div className="h-10 w-10 rounded-full bg-orange-50 dark:bg-orange-900/50 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
													<Icon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
												</div>
											</div>
											<div className="min-w-0 flex-1">
												<div>
													<p className="text-sm text-gray-500 dark:text-gray-400">
														{activity.description}
													</p>
													<div className="mt-1 text-sm text-gray-400 dark:text-gray-500">
														{format(parseISO(activity.date), "d 'de' MMMM 'às' HH:mm", {
															locale: ptBR
														})}
													</div>
												</div>
											</div>
										</div>
									</div>
								</li>
							)
						})}
					</ul>
				</div>
			</div>
		</div>
	)
}

export default ActivityFeed