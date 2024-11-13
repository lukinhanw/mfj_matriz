// CompanyList.jsx
import { useState, useEffect, useMemo } from 'react'
import { toast } from 'react-hot-toast'
import {
	PencilIcon,
	TrashIcon,
	NoSymbolIcon,
	CheckCircleIcon,
	PlusIcon,
	MinusIcon
} from '@heroicons/react/24/outline'
import ConfirmationModal from '../common/ConfirmationModal'
import CompanyCreditsModal from './CompanyCreditsModal'
import axios from 'axios'
import useAuthStore from '../../store/authStore'
import { formatPhoneNumber, formatCpfCnpj } from '../../utils/helpers'

function CompanyList({ onEdit, filters, searchTerm }) {
	const { token } = useAuthStore()
	const [companies, setCompanies] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const [confirmModal, setConfirmModal] = useState({
		show: false,
		type: null,
		companyId: null,
		currentStatus: null
	})
	const [creditsModal, setCreditsModal] = useState({
		open: false,
		type: null,
		company: null
	})

	useEffect(() => {
		const fetchCompanies = async () => {
			try {
				setIsLoading(true)
				const response = await axios.get(
					'https://api-matriz-mfj.8bitscompany.com/admin/listarEmpresas',
					{
						headers: { Authorization: `Bearer ${token}` }
					}
				)
				setCompanies(response.data)
			} catch (error) {
				console.error('Error fetching companies:', error)
				const errorMessage = error.response?.data?.error || 'Erro desconhecido'
				toast.error(
					<div>
						<span className="font-medium text-red-600">Erro ao carregar empresas</span>
						<br />
						<span className="text-sm text-red-950">{errorMessage}</span>
					</div>
				)
			} finally {
				setIsLoading(false)
			}
		}

		if (token) {
			fetchCompanies()
		}
	}, [token])

	const handleDelete = async () => {
		try {
			// Se não houver endpoint para deletar, podemos desativar a empresa ou omitir esta função
			await axios.put(
				`https://api-matriz-mfj.8bitscompany.com/admin/desativarEmpresa`,
				{ companyId: confirmModal.companyId },
				{
					headers: { Authorization: `Bearer ${token}` }
				}
			)
			toast.success('Empresa desativada com sucesso!')
			// Atualiza o status da empresa na lista
			setCompanies((prevCompanies) =>
				prevCompanies.map((company) =>
					company.id === confirmModal.companyId
						? { ...company, status: 'inactive' }
						: company
				)
			)
			setConfirmModal({ show: false, type: null, companyId: null })
		} catch (error) {
			console.error('Error deleting company:', error)
			toast.error('Erro ao desativar empresa')
		}
	}

	const handleToggleStatus = async () => {
		try {
			const { companyId, currentStatus } = confirmModal
			const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
			const endpoint =
				newStatus === 'active'
					? 'ativarEmpresa'
					: 'desativarEmpresa'

			await axios.put(
				`https://api-matriz-mfj.8bitscompany.com/admin/${endpoint}`,
				{ companyId: companyId },
				{
					headers: { Authorization: `Bearer ${token}` }
				}
			)

			toast.success(
				<div>
					<span className="font-medium text-green-600">Sucesso!</span>
					<br />
					<span className="text-sm text-green-950">
						Status alterado para {newStatus === 'active' ? 'ativo' : 'inativo'}
					</span>
				</div>
			)
			// Atualiza o status da empresa na lista
			setCompanies((prevCompanies) =>
				prevCompanies.map((company) =>
					company.id === companyId ? { ...company, status: newStatus } : company
				)
			)
			setConfirmModal({
				show: false,
				type: null,
				companyId: null,
				currentStatus: null
			})
		} catch (error) {
			console.error('Error updating company status:', error)
			const errorMessage = error.response?.data?.error || 'Erro desconhecido'
			toast.error(
				<div>
					<span className="font-medium text-red-600">Erro ao alterar status</span>
					<br />
					<span className="text-sm text-red-950">{errorMessage}</span>
				</div>
			)
		}
	}

	const openConfirmModal = (type, id, currentStatus = null) => {
		setConfirmModal({
			show: true,
			type,
			companyId: id,
			currentStatus
		})
	}

	const openCreditsModal = (company, type) => {
		setCreditsModal({ open: true, type, company })
	}

	const closeCreditsModal = () => {
		setCreditsModal({ open: false, type: null, company: null })
	}

	const filteredCompanies = useMemo(() => {
		return companies.filter((company) => {
			// Filtro de busca
			if (searchTerm) {
				const search = searchTerm.toLowerCase()
				const searchMatch =
					company.name.toLowerCase().includes(search) ||
					company.document.includes(search) ||
					company.email.toLowerCase().includes(search) ||
					company.phone.includes(search)
				if (!searchMatch) return false
			}

			// Filtro de status
			if (filters.status.length > 0 && !filters.status.includes(company.status)) {
				return false
			}

			return true
		})
	}, [companies, filters, searchTerm])

	if (isLoading) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500">Carregando empresas...</p>
			</div>
		)
	}

	if (filteredCompanies.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500">
					Nenhuma empresa encontrada com os filtros aplicados.
				</p>
			</div>
		)
	}

	return (
		<>
			<div className="overflow-x-auto">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							{/* Cabeçalhos da tabela */}
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Nome
							</th>
							{/* Outros cabeçalhos */}
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								CPF/CNPJ
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Telefone
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Email
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Créditos
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Status
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Ações
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{filteredCompanies.map((company) => (
							<tr key={company.id}>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm font-medium text-gray-900">
										{company.name}
									</div>
								</td>
								{/* Outras colunas */}
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm text-gray-500">{formatCpfCnpj(company.document)}</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm text-gray-500">{formatPhoneNumber(company.phone)}</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm text-gray-500">{company.email}</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm font-medium text-gray-900">
										{company.credits}
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span
										className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${company.status === 'active'
												? 'bg-green-100 text-green-800'
												: 'bg-red-100 text-red-800'
											}`}
									>
										{company.status === 'active' ? 'Ativo' : 'Inativo'}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
									<button
										onClick={() => openCreditsModal(company, 'add')}
										className="text-green-600 hover:text-green-900 mr-4 transition-colors duration-200"
										title="Adicionar créditos"
									>
										<PlusIcon className="h-5 w-5" />
									</button>
									<button
										onClick={() => openCreditsModal(company, 'remove')}
										className={`mr-4 transition-colors duration-200 ${company.credits > 0
												? 'text-red-600 hover:text-red-900'
												: 'text-gray-400 cursor-not-allowed'
											}`}
										title="Remover créditos"
										disabled={company.credits === 0}
									>
										<MinusIcon className="h-5 w-5" />
									</button>
									<button
										onClick={() => onEdit(company)}
										className="text-primary-600 hover:text-primary-900 mr-4 transition-colors duration-200"
										title="Editar"
									>
										<PencilIcon className="h-5 w-5" />
									</button>
									<button
										onClick={() =>
											openConfirmModal('status', company.id, company.status)
										}
										className={`${company.status === 'active'
												? 'text-red-600 hover:text-red-900'
												: 'text-green-600 hover:text-green-900'
											} mr-4 transition-colors duration-200`}
										title={
											company.status === 'active' ? 'Desativar' : 'Ativar'
										}
									>
										{company.status === 'active' ? (
											<NoSymbolIcon className="h-5 w-5" />
										) : (
											<CheckCircleIcon className="h-5 w-5" />
										)}
									</button>
									{/* Se não houver endpoint para deletar, podemos remover este botão */}
									{/* <button
                    onClick={() => openConfirmModal('delete', company.id)}
                    className="text-red-600 hover:text-red-900 transition-colors duration-200"
                    title="Excluir"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button> */}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<ConfirmationModal
				isOpen={confirmModal.show}
				onClose={() =>
					setConfirmModal({
						show: false,
						type: null,
						companyId: null,
						currentStatus: null
					})
				}
				onConfirm={
					confirmModal.type === 'delete' ? handleDelete : handleToggleStatus
				}
				title={
					confirmModal.type === 'delete'
						? 'Excluir Empresa'
						: `${confirmModal.currentStatus === 'active'
							? 'Desativar'
							: 'Ativar'
						} Empresa`
				}
				message={
					confirmModal.type === 'delete'
						? 'Tem certeza que deseja excluir esta empresa?'
						: `Tem certeza que deseja ${confirmModal.currentStatus === 'active'
							? 'desativar'
							: 'ativar'
						} esta empresa?`
				}
				confirmText={
					confirmModal.type === 'delete'
						? 'Excluir'
						: confirmModal.currentStatus === 'active'
							? 'Desativar'
							: 'Ativar'
				}
				confirmStyle={
					confirmModal.type === 'delete' ||
						confirmModal.currentStatus === 'active'
						? 'danger'
						: 'success'
				}
			/>

			<CompanyCreditsModal
				open={creditsModal.open}
				onClose={closeCreditsModal}
				company={creditsModal.company}
				type={creditsModal.type}
				onCreditsUpdated={(updatedCompany) => {
					setCompanies((prevCompanies) =>
						prevCompanies.map((company) =>
							company.id === updatedCompany.id ? updatedCompany : company
						)
					)
				}}
			/>
		</>
	)
}

export default CompanyList
