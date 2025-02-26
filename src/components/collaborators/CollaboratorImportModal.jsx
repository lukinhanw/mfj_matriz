import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import * as XLSX from 'xlsx'
import api from '../../utils/api'
import useAuthStore from '../../store/authStore'

function CollaboratorImportModal({ open, onClose, onImportComplete }) {
    const { token } = useAuthStore()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [file, setFile] = useState(null)
    const [companies, setCompanies] = useState([])
    const [departments, setDepartments] = useState([])
    const [positions, setPositions] = useState([])
    const [showProgress, setShowProgress] = useState(false)
    const [collaborators, setCollaborators] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [companiesRes, departmentsRes, positionsRes] = await Promise.all([
                    api.get('/admin/listarEmpresas', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    api.get('/admin/listarSetores', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    api.get('/admin/listarCargos', {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ])

                setCompanies(companiesRes.data || [])
                setDepartments(departmentsRes.data || [])
                setPositions(positionsRes.data || [])
            } catch (error) {
                console.error('Error fetching data:', error)
                toast.error('Erro ao carregar dados')
            }
        }

        if (open && token) {
            fetchData()
        }
    }, [open, token])

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile) {
            if (!selectedFile.name.endsWith('.csv') && !selectedFile.name.endsWith('.xlsx')) {
                toast.error('Por favor, selecione um arquivo CSV ou Excel')
                return
            }
            setFile(selectedFile)
        }
    }

    const processFile = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => {
                try {
                    const data = e.target.result
                    const workbook = XLSX.read(data, { type: 'array' })
                    const firstSheetName = workbook.SheetNames[0]
                    const worksheet = workbook.Sheets[firstSheetName]
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                        raw: true,
                        defval: '',
                        blankrows: false,
                        ...(file.name.endsWith('.csv') ? { FS: ';' } : {})
                    })

                    const processedData = jsonData.map((row, index) => {
                        try {
                            // Encontrar IDs baseado nos nomes
                            const company = companies.find(c => c.name.toLowerCase() === (row.empresa || '').toLowerCase())
                            const department = departments.find(d => d.name.toLowerCase() === (row.setor || '').toLowerCase())
                            const position = positions.find(p => p.name.toLowerCase() === (row.cargo || '').toLowerCase())

                            const rowErrors = []
                            if (!row.nome) rowErrors.push('Nome é obrigatório')
                            if (!row.email) rowErrors.push('Email é obrigatório')
                            if (!row.cpf) rowErrors.push('CPF é obrigatório')
                            if (!company) rowErrors.push(`Empresa "${row.empresa}" não encontrada`)
                            if (!department) rowErrors.push(`Setor "${row.setor}" não encontrado`)
                            if (!position) rowErrors.push(`Cargo "${row.cargo}" não encontrado`)

                            return {
                                index: index + 2,
                                raw: row,
                                data: rowErrors.length === 0 ? {
                                    name: row.nome,
                                    email: row.email,
                                    cpf: (row.cpf || '').toString().replace(/\D/g, ''),
                                    companyId: company?.id,
                                    departmentId: department?.id,
                                    positionId: position?.id
                                } : null,
                                status: rowErrors.length === 0 ? 'pending' : 'error',
                                error: rowErrors.length > 0 ? rowErrors.join(', ') : null
                            }
                        } catch (error) {
                            return {
                                index: index + 2,
                                raw: row,
                                data: null,
                                status: 'error',
                                error: 'Erro ao processar linha: ' + error.message
                            }
                        }
                    })

                    resolve(processedData)
                } catch (error) {
                    reject(error)
                }
            }
            reader.onerror = (error) => reject(error)
            reader.readAsArrayBuffer(file)
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!file) {
            toast.error('Por favor, selecione um arquivo')
            return
        }

        try {
            setIsSubmitting(true)
            const processedData = await processFile(file)
            
            if (!processedData.some(item => item.status === 'pending')) {
                toast.error('Nenhum registro válido encontrado no arquivo')
                return
            }

            setCollaborators(processedData.map(item => ({
                ...item,
                status: 'pending'
            })))
            
            onClose()
            setShowProgress(true)

            const response = await api.post('/admin/cadastrarColaboradoresEmMassa', 
                { collaborators: processedData.filter(item => item.status === 'pending').map(item => item.data) },
                { headers: { Authorization: `Bearer ${token}` } }
            )

            // Atualiza o status de cada colaborador com base na resposta
            setCollaborators(prev => {
                const newCollaborators = [...prev]
                response.data.results.forEach(result => {
                    const index = newCollaborators.findIndex(c => c.raw.nome === result.name)
                    if (index !== -1) {
                        newCollaborators[index] = {
                            ...newCollaborators[index],
                            status: result.status,
                            error: result.error,
                            emailStatus: result.emailStatus
                        }
                    }
                })
                return newCollaborators
            })

            const successCount = response.data.results.filter(r => r.status === 'success').length
            if (successCount > 0) {
                toast.success(`${successCount} colaborador(es) importado(s) com sucesso!`)
                onImportComplete()
            } else {
                toast.error('Nenhum colaborador foi importado devido a erros.')
            }
        } catch (error) {
            console.error('Erro ao importar colaboradores:', error)
            toast.error(error.response?.data?.error || 'Erro ao importar colaboradores')
        } finally {
            setIsSubmitting(false)
            setFile(null)
        }
    }

    const handleCloseProgress = () => {
        setShowProgress(false)
        setCollaborators([])
        onClose()
    }

    return (
        <>
            <Transition.Root show={open} as={Fragment}>
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
                        <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity" />
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
                                                Importar Colaboradores
                                            </Dialog.Title>
                                            <div className="mt-4">
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Selecione um arquivo CSV ou Excel com os seguintes campos: nome, email, cpf, empresa, setor, cargo
                                                </p>
                                                <a 
                                                    href="/modelo_colaboradores.csv" 
                                                    download
                                                    className="inline-block mt-2 text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
                                                >
                                                    Baixar modelo de arquivo
                                                </a>
                                                <div className="mt-4">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Arquivo CSV/Excel
                                                    </label>
                                                    <input
                                                        type="file"
                                                        accept=".csv,.xlsx"
                                                        onChange={handleFileChange}
                                                        className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400
                                                            file:mr-4 file:py-2 file:px-4
                                                            file:rounded-md file:border-0
                                                            file:text-sm file:font-semibold
                                                            file:bg-orange-50 file:text-orange-700
                                                            dark:file:bg-orange-900 dark:file:text-orange-300
                                                            hover:file:bg-orange-100 dark:hover:file:bg-orange-800"
                                                        disabled={isSubmitting}
                                                    />
                                                </div>
                                                <div className="mt-6 flex justify-end gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={onClose}
                                                        className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                                                        disabled={isSubmitting}
                                                    >
                                                        Cancelar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleSubmit}
                                                        className="inline-flex justify-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                                                        disabled={isSubmitting || !file}
                                                    >
                                                        {isSubmitting ? 'Importando...' : 'Importar'}
                                                    </button>
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

            <Transition.Root show={showProgress} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => {}}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity" />
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
                                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                            <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100 mb-4">
                                                Progresso da Importação
                                            </Dialog.Title>
                                            <div className="flex gap-4 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center rounded-md bg-green-50 dark:bg-green-900/30 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-500">
                                                        <CheckCircleIcon className="mr-1 h-4 w-4" />
                                                        Sucesso: {collaborators.filter(c => c.status === 'success').length}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center rounded-md bg-red-50 dark:bg-red-900/30 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-500">
                                                        <XCircleIcon className="mr-1 h-4 w-4" />
                                                        Erros: {collaborators.filter(c => c.status === 'error').length}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center rounded-md bg-gray-50 dark:bg-gray-900 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                                                        Total: {collaborators.length}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="max-h-[400px] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                                                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                                                    <thead>
                                                        <tr>
                                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 sm:pl-6">
                                                                Nome
                                                            </th>
                                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                                Status
                                                            </th>
                                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                                Mensagem
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                        {collaborators.map((collaborator, index) => (
                                                            <tr key={index}>
                                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-100 sm:pl-6">
                                                                    {collaborator.raw.nome || 'N/A'}
                                                                </td>
                                                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                                    {collaborator.status === 'pending' && (
                                                                        <span className="inline-flex items-center rounded-md bg-gray-50 dark:bg-gray-900 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                                                                            Pendente
                                                                        </span>
                                                                    )}
                                                                    {collaborator.status === 'processing' && (
                                                                        <span className="inline-flex items-center rounded-md bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 text-xs font-medium text-yellow-800 dark:text-yellow-500">
                                                                            Processando...
                                                                        </span>
                                                                    )}
                                                                    {collaborator.status === 'success' && (
                                                                        <span className="inline-flex items-center rounded-md bg-green-50 dark:bg-green-900/30 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-500">
                                                                            <CheckCircleIcon className="mr-1 h-4 w-4" />
                                                                            Sucesso
                                                                        </span>
                                                                    )}
                                                                    {collaborator.status === 'error' && (
                                                                        <span className="inline-flex items-center rounded-md bg-red-50 dark:bg-red-900/30 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-500">
                                                                            <XCircleIcon className="mr-1 h-4 w-4" />
                                                                            Erro
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                                    {collaborator.error || '-'}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                                <button
                                                    type="button"
                                                    className="inline-flex w-full justify-center rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 sm:ml-3 sm:w-auto"
                                                    onClick={handleCloseProgress}
                                                >
                                                    Fechar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </>
    )
}

export default CollaboratorImportModal 