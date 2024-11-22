import { Bars3Icon, UserCircleIcon } from '@heroicons/react/24/outline'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

function Navbar({ onMenuClick }) {
	const navigate = useNavigate()
	const { user, logout } = useAuthStore()

	const handleLogout = () => {
		logout()
		navigate('/login')
	}

	return (
		<nav className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-700/20 transition-colors">
			<div className="mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					<div className="flex">
						<div className="flex-shrink-0 flex items-center">
							<button
								type="button"
								className="lg:hidden p-2 rounded-md text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
								onClick={onMenuClick}
							>
								<Bars3Icon className="h-6 w-6" />
							</button>
						</div>
					</div>

					<div className="flex items-center">
						<Menu as="div" className="relative ml-3">
							<Menu.Button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 dark:focus:ring-offset-gray-800 transition-colors">
								<UserCircleIcon className="h-8 w-8 text-gray-400 dark:text-gray-300" />
								<span className="ml-2 text-gray-700 dark:text-gray-200">{user?.name}</span>
							</Menu.Button>

							<Transition
								as={Fragment}
								enter="transition ease-out duration-100"
								enterFrom="transform opacity-0 scale-95"
								enterTo="transform opacity-100 scale-100"
								leave="transition ease-in duration-75"
								leaveFrom="transform opacity-100 scale-100"
								leaveTo="transform opacity-0 scale-95"
							>
								<Menu.Items className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
									<Menu.Item>
										{({ active }) => (
											<button
												onClick={handleLogout}
												className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 w-full text-left`}
											>
												Sair
											</button>
										)}
									</Menu.Item>
								</Menu.Items>
							</Transition>
						</Menu>
					</div>
				</div>
			</div>
		</nav>
	)
}

export default Navbar