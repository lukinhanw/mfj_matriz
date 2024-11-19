import { Fragment, useState, useEffect } from 'react'
import { Menu, Transition } from '@headlessui/react'
import {
	Bars3Icon,
	UserCircleIcon,
	SunIcon,
	MoonIcon
} from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

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