import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { NavLink } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { getNavigationByRole } from '../utils/roles'
import logo from '../assets/logo.png'
import logoBlack from '../assets/logo-black.png'

import {
	HomeIcon,
	BuildingOfficeIcon,
	BuildingOffice2Icon,
	UserGroupIcon,
	UsersIcon,
	AcademicCapIcon,
	ChartBarIcon,
	ClockIcon,
	ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'
import ConfirmationModal from './common/ConfirmationModal'

const icons = {
	HomeIcon,
	BuildingOfficeIcon,
	BuildingOffice2Icon,
	UserGroupIcon,
	UsersIcon,
	AcademicCapIcon,
	ChartBarIcon,
	ClockIcon,
	ArrowRightOnRectangleIcon
}

export default function Sidebar({ sidebarOpen = false, setSidebarOpen }) {
	const navigate = useNavigate()
	const { user, logout } = useAuthStore()
	const navigation = getNavigationByRole(user?.role)
	const [logoutModalOpen, setLogoutModalOpen] = useState(false)
	const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'))

	useEffect(() => {
		const observer = new MutationObserver(() => {
			setIsDarkMode(document.documentElement.classList.contains('dark'))
		})
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
		return () => observer.disconnect()
	}, [])

	const handleLogout = () => {
		setLogoutModalOpen(true)
	}

	const confirmLogout = () => {
		logout()
		navigate('/login')
	}

	const SidebarContent = () => (
		<div className="flex h-full flex-col bg-white dark:bg-gray-800 transition-colors">
			<div className="flex h-16 shrink-0 items-center justify-center border-b border-gray-200 dark:border-gray-700">
				<img
					className="h-8 w-auto"
					src={isDarkMode ? logoBlack : logo}
					alt="Logo"
				/>
			</div>

			<nav className="flex-1 overflow-y-auto">
				<ul role="list" className="flex flex-1 flex-col gap-y-7 px-6 py-4">
					{navigation.map((group) => (
						<li key={group.title}>
							<div className="text-xs font-semibold leading-6 text-gray-400 dark:text-gray-500 uppercase tracking-wider">
								{group.title}
							</div>
							<ul role="list" className="mt-2 space-y-1">
								{group.items.map((item) => {
									const Icon = icons[item.icon]
									return (
										<li key={item.name}>
											<NavLink
												to={item.href}
												className={({ isActive }) =>
													`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold hover:scale-105 transition duration-500 ${isActive
														? 'bg-orange-50 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400'
														: 'text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30'
													}`
												}
												onClick={() => setSidebarOpen?.(false)}
											>
												<Icon
													className="h-6 w-6 shrink-0"
													aria-hidden="true"
												/>
												{item.name}
											</NavLink>
										</li>
									)
								})}
							</ul>
						</li>
					))}
				</ul>
			</nav>

			<div className="border-t border-gray-200 dark:border-gray-700 p-4">
				<div className="flex flex-col items-start space-y-3">
					<div className="flex items-start space-x-3">
						<div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
							<span className="text-orange-700 dark:text-orange-400 font-semibold text-lg">
								{user?.name?.charAt(0).toUpperCase()}
							</span>
						</div>
						<div className="flex flex-col">
							<span className="text-sm font-medium text-gray-900 dark:text-gray-100">
								{user?.name}
							</span>
							<span className="text-xs text-gray-500 dark:text-gray-400">
								{user?.email}
							</span>
						</div>
					</div>
					<button
						onClick={handleLogout}
						className="w-full flex items-center justify-end gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
					>
						<ArrowRightOnRectangleIcon className="h-5 w-5" />
						Sair
					</button>
				</div>
			</div>
		</div>
	)

	return (
		<>
			<Transition.Root show={sidebarOpen} as={Fragment}>
				<Dialog as="div" className="relative z-[60]" onClose={setSidebarOpen}>
					<Transition.Child
						as={Fragment}
						enter="transition-opacity ease-linear duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="transition-opacity ease-linear duration-300"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="fixed inset-0 bg-gray-900/80" />
					</Transition.Child>

					<div className="fixed inset-0 flex">
						<Transition.Child
							as={Fragment}
							enter="transition ease-in-out duration-300 transform"
							enterFrom="-translate-x-full"
							enterTo="translate-x-0"
							leave="transition ease-in-out duration-300 transform"
							leaveFrom="translate-x-0"
							leaveTo="-translate-x-full"
						>
							<Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
								<Transition.Child
									as={Fragment}
									enter="ease-in-out duration-300"
									enterFrom="opacity-0"
									enterTo="opacity-100"
									leave="ease-in-out duration-300"
									leaveFrom="opacity-100"
									leaveTo="opacity-0"
								>
									<div className="absolute left-full top-0 flex w-16 justify-center pt-5">
										<button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
											<span className="sr-only">Fechar menu</span>
											<XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
										</button>
									</div>
								</Transition.Child>
								<div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white">
									<SidebarContent />
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</Dialog>
			</Transition.Root>

			<div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
				<div className="flex grow flex-col overflow-y-auto border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors">
					<SidebarContent />
				</div>
			</div>
			<ConfirmationModal
				isOpen={logoutModalOpen}
				onClose={() => setLogoutModalOpen(false)}
				onConfirm={confirmLogout}
				title="Sair"
				message="Tem certeza que deseja sair?"
				confirmText="Sair"
				confirmStyle="danger"
			/>
		</>
	)
}