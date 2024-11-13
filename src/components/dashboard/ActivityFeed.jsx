import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  AcademicCapIcon,
  UserGroupIcon,
  UsersIcon
} from '@heroicons/react/24/outline'

const icons = {
  course: AcademicCapIcon,
  employee: UserGroupIcon,
  client: UsersIcon
}

function ActivityFeed({ activities }) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900">
          Atividades Recentes
        </h2>
        <div className="mt-4 flow-root">
          <ul className="-mb-8">
            {activities.map((activity, index) => {
              const Icon = icons[activity.type]
              return (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {index !== activities.length - 1 && (
                      <span
                        className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex items-start space-x-3">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center ring-8 ring-white">
                          <Icon className="h-6 w-6 text-primary-600" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <p className="text-sm text-gray-500">
                            {activity.description}
                          </p>
                          <div className="mt-1 text-sm text-gray-400">
                            {format(new Date(activity.date), "d 'de' MMMM 'às' HH:mm", {
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