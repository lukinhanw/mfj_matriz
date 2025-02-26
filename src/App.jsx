import { Toaster } from 'react-hot-toast'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import PasswordRecovery from './pages/PasswordRecovery'
import Dashboard from './pages/Dashboard'
import Companies from './pages/Companies'
import Departments from './pages/Departments'
import Positions from './pages/Positions'
import Managers from './pages/Managers'
import Collaborators from './pages/Collaborators'
import Courses from './pages/Courses'
import Reports from './pages/Reports'
import SystemLogs from './pages/SystemLogs'
import Profile from './pages/Profile'
import ReportsBuy from './pages/ReportsBuy'
import Assessment from './pages/Assessment'
import EmailLogs from './components/email/EmailLogs'

export default function App() {
	return (
		<>
			<Toaster position="top-right" />
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/forgot-password" element={<PasswordRecovery />} />
				<Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
					<Route path="/" element={<Dashboard />} />
					<Route path="/companies" element={<Companies />} />
					<Route path="/departments" element={<Departments />} />
					<Route path="/positions" element={<Positions />} />
					<Route path="/managers" element={<Managers />} />
					<Route path="/collaborators" element={<Collaborators />} />
					<Route path="/courses" element={<Courses />} />
					<Route path="/reports" element={<Reports />} />
					<Route path="/reports-buy" element={<ReportsBuy />} />
					<Route path="/logs" element={<SystemLogs />} />
					<Route path="/profile" element={<Profile />} />
					<Route path="/assessment" element={<Assessment />} />
					<Route path="/email-logs" element={<EmailLogs />} />
				</Route>
			</Routes>
		</>
	)
}