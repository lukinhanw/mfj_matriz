import { Fragment, useState, useEffect } from 'react'
import { Menu, Transition } from '@headlessui/react'
import {
	Bars3Icon,
	UserCircleIcon,
	SunIcon,
	MoonIcon,
	BellIcon
} from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { useNotifications } from '../hooks/useNotifications'

function Header({ onMenuClick }) {
	const navigate = useNavigate()
	const { user, logout } = useAuthStore()
	const [isDark, setIsDark] = useState(() =>
		document.documentElement.classList.contains('dark')
	)

	const toggleTheme = () => {
		if (isDark) {
			document.documentElement.classList.remove('dark')
			localStorage.theme = 'light'
		} else {
			document.documentElement.classList.add('dark')
			localStorage.theme = 'dark'
		}
		setIsDark(!isDark)
	}

	const handleLogout = () => {
		logout()
		navigate('/login')
	}

	useEffect(() => {
		if (localStorage.theme === 'dark' ||
			(!localStorage.theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
			document.documentElement.classList.add('dark')
			setIsDark(true)
		} else {
			document.documentElement.classList.remove('dark')
			setIsDark(false)
		}
	}, [])

	const {
		notifications,
		unreadCount,
		markAsRead,
		markAllAsRead,
		formatDate
	} = useNotifications()

	return (
		<header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
			<button
				type="button"
				className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-200 lg:hidden"
				onClick={onMenuClick}
			>
				<span className="sr-only">Abrir menu</span>
				<Bars3Icon className="h-6 w-6" aria-hidden="true" />
			</button>

			<div className="flex flex-1 justify-end gap-x-4 self-stretch lg:gap-x-6">
				<div className="flex items-center gap-x-4 lg:gap-x-6">
					<button
						onClick={toggleTheme}
						className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
						aria-label="Toggle dark mode"
					>
						{isDark ? (
							<SunIcon className="h-6 w-6 text-gray-400 dark:text-gray-300" />
						) : (
							<MoonIcon className="h-6 w-6 text-gray-400" />
						)}
					</button>

					<Menu as="div" className="relative">
						<Menu.Button className="relative p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
							<BellIcon className="h-6 w-6 text-gray-400 dark:text-gray-300" />
							{unreadCount > 0 && (
								<span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
									{unreadCount}
								</span>
							)}
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
							<Menu.Items className="absolute right-0 mt-2 w-96 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-blue-100 ring-opacity-5 focus:outline-none ">
								<div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
									<div className="flex justify-between items-center">
										<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
											Notificações
										</h3>
										<button
											onClick={markAllAsRead}
											className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
										>
											Marcar todas como lidas
										</button>
									</div>
								</div>
								<div className="max-h-96 overflow-y-auto">
									{notifications.map((notification) => (
										<Menu.Item key={notification.id}>
											{({ active }) => (
												<div
													onClick={() => markAsRead(notification.id)}
													className={`
                            ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}
                            ${!notification.checked ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                            px-4 py-3 cursor-pointer
                          `}
												>
													<p className="text-sm text-gray-700 dark:text-gray-300">
														{notification.message}
													</p>
													<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
														{formatDate(notification.date)}
													</p>
												</div>
											)}
										</Menu.Item>
									))}
								</div>
							</Menu.Items>
						</Transition>
					</Menu>

					<Menu as="div" className="relative">
						<Menu.Button className="flex items-center gap-x-2 p-2 text-sm font-medium leading-6 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
							<UserCircleIcon className="h-6 w-6 text-gray-400 dark:text-gray-300" aria-hidden="true" />
							<span>{user?.name}</span>
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
							<Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
								<Menu.Item>
									{({ active }) => (
										<button
											onClick={() => navigate('/profile')}
											className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''
												} block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 w-full text-left`}
										>
											Perfil
										</button>
									)}
								</Menu.Item>
								<Menu.Item>
									{({ active }) => (
										<button
											onClick={handleLogout}
											className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''
												} block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 w-full text-left`}
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
		</header>
	)
}

export default Header