
import { CheckCircleIcon } from '@heroicons/react/24/solid'

export default function CompletedState() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
                <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Avaliação Concluída
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Você já realizou esta avaliação.
                </p>
            </div>
        </div>
    )
}