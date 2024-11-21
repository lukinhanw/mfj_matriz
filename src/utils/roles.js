// Role definitions
export const ROLES = {
	ADMIN: 'admin',
	GESTOR: 'gestor',
	COLABORADOR: 'colaborador',
	EMPRESA: 'empresa'
}

// Role-based route permissions
export const ROUTE_PERMISSIONS = {
	'/': [ROLES.ADMIN, ROLES.GESTOR, ROLES.COLABORADOR, ROLES.EMPRESA],
	'/companies': [ROLES.ADMIN],
	'/departments': [ROLES.ADMIN],
	'/managers': [ROLES.ADMIN, ROLES.EMPRESA],
	'/collaborators': [ROLES.ADMIN, ROLES.GESTOR, ROLES.EMPRESA],
	'/courses': [ROLES.ADMIN],
	'/reports': [ROLES.ADMIN, ROLES.GESTOR, ROLES.COLABORADOR, ROLES.EMPRESA],
	'/reports_buy': [ROLES.ADMIN, ROLES.GESTOR, ROLES.COLABORADOR, ROLES.EMPRESA],
	'/logs': [ROLES.ADMIN],
	'/profile': [ROLES.ADMIN, ROLES.GESTOR, ROLES.COLABORADOR, ROLES.EMPRESA]
}

// Action permissions by role
export const ACTION_PERMISSIONS = {
	[ROLES.ADMIN]: {
		canCreateCompany: true,
		canEditCompany: true,
		canDeleteCompany: true,
		canCreateDepartment: true,
		canEditDepartment: true,
		canDeleteDepartment: true,
		canCreateManager: true,
		canEditManager: true,
		canDeleteManager: true,
		canCreateCollaborator: true,
		canEditCollaborator: true,
		canEditCourseCollaborator: true,
		canDeleteCollaborator: true,
		canViewCreditsAssign: true,
		canCreateCourse: true,
		canEditCourse: true,
		canDeleteCourse: true,
		canAssignCourses: true,
		canViewReports: true,
		canViewLogs: true,
		canExportData: true,
	},
	[ROLES.GESTOR]: {
		canViewManagers: false,
		canViewCollaborators: true,
		canCreateCollaborator: false,
		canEditCollaborator: false,
		canEditCourseCollaborator: false,
		canDeleteCollaborator: false,
		canAssignCourses: true,
		canViewReports: true,
		canViewLogs: true,
		canExportData: true
	},
	[ROLES.COLABORADOR]: {
		canViewReports: true,
		canViewLogs: true,
		canExportData: false
	},
	[ROLES.EMPRESA]: {
		canViewManagers: true,
		canViewCollaborators: true,
		canEditCourseCollaborator: false,
		canViewReports: true,
		canViewLogs: true,
		canExportData: true,
	}
}

// Helper function to check if user has permission for a route
export const hasRoutePermission = (userRole, path) => {
	const allowedRoles = ROUTE_PERMISSIONS[path]
	return allowedRoles?.includes(userRole) || false
}

// Helper function to check if user has permission for an action
export const hasActionPermission = (userRole, action) => {
	const rolePermissions = ACTION_PERMISSIONS[userRole] || {}
	return rolePermissions[action] || false
}

// Navigation items by role
export const getNavigationByRole = (userRole) => {
	const baseNavigation = [
		{
			title: 'Principal',
			items: [
				{ name: 'Dashboard', href: '/', icon: 'HomeIcon' }
			]
		}
	]

	if (userRole === ROLES.ADMIN) {
		baseNavigation.push(
			{
				title: 'Organizacional',
				items: [
					{ name: 'Empresas', href: '/companies', icon: 'BuildingOfficeIcon' },
					{ name: 'Setores', href: '/departments', icon: 'BuildingOffice2Icon' }
				]
			},
			{
				title: 'Usuários',
				items: [
					{ name: 'Gestores', href: '/managers', icon: 'UserGroupIcon' },
					{ name: 'Colaboradores', href: '/collaborators', icon: 'UsersIcon' }
				]
			},
			{
				title: 'Treinamentos',
				items: [
					{ name: 'Cursos', href: '/courses', icon: 'AcademicCapIcon' }
				]
			}
		)
	} else if (userRole === ROLES.EMPRESA) {
		baseNavigation.push(
			{
				title: 'Usuários',
				items: [
					{ name: 'Gestores', href: '/managers', icon: 'UserGroupIcon' },
					{ name: 'Colaboradores', href: '/collaborators', icon: 'UsersIcon' }
				]
			}
		)
	} else if (userRole === ROLES.GESTOR) {
		baseNavigation.push(
			{
				title: 'Usuários',
				items: [
					{ name: 'Colaboradores', href: '/collaborators', icon: 'UsersIcon' }
				]
			}
		)
	}

	// Common items for all roles
	baseNavigation.push({
		title: 'Relatórios',
		items: [
			{ name: 'Relatórios de Uso', href: '/reports', icon: 'ChartBarIcon' },
			{ name: 'Relatórios de Créditos', href: '/reports_buy', icon: 'ChartBarIcon' },
		]
	})

	if (userRole === ROLES.ADMIN) {
		baseNavigation.push({
			title: 'Sistema',
			items: [
				{ name: 'Logs', href: '/logs', icon: 'ClockIcon' }
			]
		})
	}

	return baseNavigation
}