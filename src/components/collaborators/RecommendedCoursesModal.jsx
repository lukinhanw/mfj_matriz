import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, BookOpenIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

function RecommendedCoursesModal({ isOpen, onClose, collaborator }) {
    if (!collaborator) return null

    const hasCourses = (collaborator.obligatoryCourses?.length > 0 || collaborator.recommendedCourses?.length > 0)

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity dark:bg-gray-900 dark:bg-opacity-75" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                                <div className="absolute right-0 top-0 pr-4 pt-4">
                                    <button
                                        type="button"
                                        className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-400"
                                        onClick={onClose}
                                    >
                                        <span className="sr-only">Fechar</span>
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                        <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100">
                                            Cursos - {collaborator.name}
                                        </Dialog.Title>

                                        <div className="mt-6 space-y-6">
                                            {/* Cursos Obrigatórios */}
                                            <div>
                                                <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                                    <ExclamationTriangleIcon className="h-5 w-5 text-orange-500 mr-2" />
                                                    Cursos Obrigatórios
                                                </h4>
                                                {collaborator.obligatoryCourses?.length > 0 ? (
                                                    <div className="grid gap-4">
                                                        {collaborator.obligatoryCourses.map((course) => (
                                                            <div
                                                                key={course.id}
                                                                className="flex items-start space-x-4 p-4 rounded-lg border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20"
                                                            >
                                                                <div className="flex-shrink-0">
                                                                    <BookOpenIcon className="h-6 w-6 text-orange-500" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                                        {course.title}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-center text-gray-500 dark:text-gray-400">
                                                        Nenhum curso obrigatório para este colaborador.
                                                    </p>
                                                )}
                                            </div>

                                            {/* Cursos Recomendados */}
                                            <div>
                                                <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                                    <BookOpenIcon className="h-5 w-5 text-orange-500 mr-2" />
                                                    Cursos Recomendados
                                                </h4>
                                                {collaborator.recommendedCourses?.length > 0 ? (
                                                    <div className="grid gap-4">
                                                        {collaborator.recommendedCourses.map((course) => (
                                                            <div
                                                                key={course.id}
                                                                className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                                                            >
                                                                <div className="flex-shrink-0">
                                                                    <BookOpenIcon className="h-6 w-6 text-orange-500" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                                        {course.title}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-center text-gray-500 dark:text-gray-400">
                                                        Nenhum curso recomendado para este colaborador.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}

export default RecommendedCoursesModal