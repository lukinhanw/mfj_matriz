import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

function Layout() {
	const [sidebarOpen, setSidebarOpen] = useState(false)

	return (
		<div className="bg-slate-100 dark:bg-gray-900 min-h-screen">
			<Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

			<div className="lg:pl-72">
				<Header onMenuClick={() => setSidebarOpen(true)} />

				<main className="py-10">
					<div className="px-4 sm:px-6 lg:px-8">
						<Outlet />
					</div>
				</main>
			</div>
		</div>
	)
}

export default Layout