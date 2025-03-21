// Role definitions
const ROLES = {
	ADMIN: 'admin',
	GESTOR: 'gestor',
	COLABORADOR: 'colaborador',
	EMPRESA: 'empresa'
}

// Role-based route permissions
const ROUTE_PERMISSIONS = {
	'/': [ROLES.ADMIN, ROLES.GESTOR, ROLES.COLABORADOR, ROLES.EMPRESA],
	'/companies': [ROLES.ADMIN],
	'/departments': [ROLES.ADMIN],
	'/positions': [ROLES.ADMIN],
	'/managers': [ROLES.ADMIN, ROLES.EMPRESA],
	'/collaborators': [ROLES.ADMIN, ROLES.GESTOR, ROLES.EMPRESA],
	'/courses': [ROLES.ADMIN],
	'/assessments': [ROLES.ADMIN], // Added new route
	'/reports': [ROLES.ADMIN, ROLES.EMPRESA],
	'/reports-buy': [ROLES.ADMIN, ROLES.EMPRESA],
	'/logs': [ROLES.ADMIN],
	'/email-logs': [ROLES.ADMIN],
	'/profile': [ROLES.ADMIN, ROLES.GESTOR, ROLES.COLABORADOR, ROLES.EMPRESA],
	'/assessment': [ROLES.COLABORADOR]
}

// Action permissions by role
const ACTION_PERMISSIONS = {
	[ROLES.ADMIN]: {
		canCreateCompany: true,
		canEditCompany: true,
		canDeleteCompany: true,
		canCreateDepartment: true,
		canEditDepartment: true,
		canDeleteDepartment: true,
		canCreatePosition: false,
		canEditPosition: false,
		canDeletePosition: false,
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
		canEditPerfil: true,
		canManageAssessments: true // Added new permission
	},
	[ROLES.GESTOR]: {
		canViewManagers: false,
		canViewCollaborators: true,
		canCreateCollaborator: false,
		canEditCollaborator: false,
		canEditCourseCollaborator: false,
		canDeleteCollaborator: false,
		canAssignCourses: false,
		canViewReports: true,
		canViewLogs: true,
		canExportData: true
	},
	[ROLES.COLABORADOR]: {
		canViewReports: true,
		canViewLogs: true,
		canExportData: false,
		canTakeAssessment: true
	},
	[ROLES.EMPRESA]: {
		canViewManagers: true,
		canViewCollaborators: true,
		canEditCourseCollaborator: false,
		canViewReports: true,
		canAssignCourses: false,
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
					{ name: 'Setores', href: '/departments', icon: 'BuildingOffice2Icon' },
					{ name: 'Cargos', href: '/positions', icon: 'BriefcaseIcon' }
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
					{ name: 'Cursos', href: '/courses', icon: 'AcademicCapIcon' },
					{ name: 'Avaliações', href: '/assessments', icon: 'ClipboardDocumentCheckIcon' }
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
	} else if (userRole === ROLES.COLABORADOR) {
		baseNavigation.push(
			{
				title: 'Avaliações',
				items: [
					{ name: 'Avaliação', href: '/assessment', icon: 'ClipboardDocumentCheckIcon' }
				]
			}
		)
	}

	if (userRole === ROLES.ADMIN) {
		baseNavigation.push({
			title: 'Relatórios',
			items: [
				{ name: 'Relatórios de Uso', href: '/reports', icon: 'ChartBarIcon' },
				{ name: 'Relatórios de Créditos', href: '/reports-buy', icon: 'ChartBarIcon' },
			]
		})
	}

	if (userRole === ROLES.ADMIN) {
		baseNavigation.push({
			title: 'Sistema',
			items: [
				{ name: 'Logs', href: '/logs', icon: 'ClockIcon' },
				{ name: 'Logs de Email', href: '/email-logs', icon: 'EnvelopeIcon' }
			]
		})
	}

	return baseNavigation
}