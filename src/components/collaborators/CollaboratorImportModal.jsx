import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, CheckCircleIcon, XCircleIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'
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
    const [importErrors, setImportErrors] = useState([])
    const [hasErrors, setHasErrors] = useState(false)

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
            
            if (selectedFile.name.endsWith('.csv')) {
                checkCSVFormat(selectedFile)
            }
        }
    }
    
    const checkCSVFormat = (file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const content = e.target.result
                const firstLine = content.split('\n')[0]
                const separators = [';', ',', '\t']
                const counts = {}
                
                separators.forEach(sep => {
                    counts[sep] = (firstLine.match(new RegExp(sep, 'g')) || []).length
                })
                
                const hasBOM = content.charCodeAt(0) === 0xFEFF
                const hasUTF8Chars = /[^\u0000-\u007f]/.test(content)
                const lines = content.split('\n').filter(line => line.trim().length > 0)
                
                if (lines.length <= 1) {
                    toast.warning('O arquivo parece ter apenas o cabeçalho ou está vazio')
                }
                
                if (lines.length > 1) {
                    const mostLikelySeparator = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b)
                    const headerFields = lines[0].split(mostLikelySeparator).length
                    
                    const inconsistentLines = lines.slice(1).filter(line => 
                        line.split(mostLikelySeparator).length !== headerFields
                    )
                    
                    if (inconsistentLines.length > 0) {
                        toast.warning('Algumas linhas do arquivo têm formato inconsistente')
                    }
                }
            } catch (error) {
                toast.error('Erro ao verificar formato do arquivo')
            }
        }
        reader.onerror = () => {
            toast.error('Erro ao ler o arquivo')
        }
        reader.readAsText(file)
    }

    const processFile = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => {
                try {
                    const data = e.target.result
                    let jsonOptions = {
                        raw: true,
                        defval: '',
                        blankrows: false
                    }
                    
                    if (file.name.endsWith('.csv')) {
                        const textReader = new FileReader()
                        textReader.readAsText(file)
                        jsonOptions.FS = ';'
                    }
                    
                    let workbook
                    try {
                        workbook = XLSX.read(data, { type: 'array' })
                    } catch (error) {
                        toast.error('Erro ao ler o arquivo. Verifique se o formato está correto.')
                        resolve([])
                        return
                    }
                    
                    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                        toast.error('Nenhuma planilha encontrada no arquivo')
                        resolve([])
                        return
                    }
                    
                    const firstSheetName = workbook.SheetNames[0]
                    const worksheet = workbook.Sheets[firstSheetName]
                    
                    if (!worksheet) {
                        toast.error('Planilha vazia ou inválida')
                        resolve([])
                        return
                    }
                    
                    let jsonData = []
                    
                    try {
                        jsonData = XLSX.utils.sheet_to_json(worksheet, jsonOptions)
                        
                        if (jsonData.length === 0 && file.name.endsWith('.csv')) {
                            jsonOptions.FS = ','
                            jsonData = XLSX.utils.sheet_to_json(worksheet, jsonOptions)
                            
                            if (jsonData.length === 0) {
                                jsonOptions.FS = '\t'
                                jsonData = XLSX.utils.sheet_to_json(worksheet, jsonOptions)
                            }
                        }
                    } catch (error) {
                        toast.error('Erro ao processar o conteúdo do arquivo')
                        resolve([])
                        return
                    }
                    
                    if (jsonData.length === 0) {
                        toast.error('Nenhum dado encontrado no arquivo. Verifique se o formato está correto e se há dados além do cabeçalho.')
                        resolve([])
                        return
                    }

                    if (jsonData.length > 0) {
                        const columns = Object.keys(jsonData[0])
                        const requiredColumns = ['nome', 'email', 'cpf', 'empresa', 'setor', 'cargo']
                        const missingColumns = requiredColumns.filter(col => !columns.includes(col))
                        
                        if (missingColumns.length > 0) {
                            toast.error(`Colunas obrigatórias ausentes: ${missingColumns.join(', ')}`)
                            
                            const columnsLower = columns.map(c => c.toLowerCase())
                            const missingLowerCase = requiredColumns.filter(col => !columnsLower.includes(col.toLowerCase()))
                            
                            if (missingLowerCase.length < missingColumns.length) {
                                toast.warning('Algumas colunas podem estar com diferenças de maiúsculas/minúsculas')
                            }
                        }
                    }

                    const processedData = jsonData.map((row, index) => {
                        try {
                            const normalizedRow = {}
                            Object.keys(row).forEach(key => {
                                const lowerKey = key.toLowerCase()
                                if (lowerKey === 'nome' || lowerKey === 'name') normalizedRow.nome = row[key]
                                else if (lowerKey === 'email') normalizedRow.email = row[key]
                                else if (lowerKey === 'cpf') normalizedRow.cpf = row[key]
                                else if (lowerKey === 'empresa' || lowerKey === 'company') normalizedRow.empresa = row[key]
                                else if (lowerKey === 'setor' || lowerKey === 'department') normalizedRow.setor = row[key]
                                else if (lowerKey === 'cargo' || lowerKey === 'position') normalizedRow.cargo = row[key]
                                else normalizedRow[key] = row[key]
                            })
                            
                            row = normalizedRow
                            
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
                    
                    const errors = processedData.filter(item => item.status === 'error').map(item => ({
                        linha: item.index,
                        dados: JSON.stringify(item.raw),
                        erro: item.error
                    }))
                    
                    setImportErrors(errors)
                    setHasErrors(errors.length > 0)

                    resolve(processedData)
                } catch (error) {
                    toast.error('Erro ao processar o arquivo: ' + error.message)
                    reject(error)
                }
            }
            reader.onerror = (error) => {
                toast.error('Erro na leitura do arquivo')
                reject(error)
            }
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
            setHasErrors(false)
            setImportErrors([])
            const processedData = await processFile(file)
            
            if (!processedData.some(item => item.status === 'pending')) {
                const errorTypes = {}
                processedData.forEach(item => {
                    if (item.error) {
                        const errors = item.error.split(', ')
                        errors.forEach(err => {
                            errorTypes[err] = (errorTypes[err] || 0) + 1
                        })
                    }
                })
                
                let errorMessage = 'Nenhum registro válido encontrado no arquivo. '
                
                const commonErrors = Object.entries(errorTypes)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([error, count]) => `${error} (${count}x)`)
                
                if (commonErrors.length > 0) {
                    errorMessage += `Erros mais comuns: ${commonErrors.join(', ')}`
                }
                
                toast.error(errorMessage)
                
                const errors = processedData.filter(item => item.status === 'error').map(item => ({
                    linha: item.index,
                    dados: JSON.stringify(item.raw),
                    erro: item.error
                }))
                
                setImportErrors(errors)
                setHasErrors(errors.length > 0)
                
                setIsSubmitting(false)
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
            
            const updatedCollaborators = [...processedData]
            response.data.results.forEach(result => {
                const index = updatedCollaborators.findIndex(c => c.raw.nome === result.name)
                if (index !== -1) {
                    updatedCollaborators[index] = {
                        ...updatedCollaborators[index],
                        status: result.status,
                        error: result.error,
                        emailStatus: result.emailStatus
                    }
                }
            })
            
            setCollaborators(updatedCollaborators)
            
            const errors = updatedCollaborators.filter(item => item.status === 'error').map(item => ({
                linha: item.index,
                dados: JSON.stringify(item.raw),
                erro: item.error
            }))
            
            setImportErrors(errors)
            setHasErrors(errors.length > 0)

            const successCount = response.data.results.filter(r => r.status === 'success').length
            if (successCount > 0) {
                toast.success(`${successCount} colaborador(es) importado(s) com sucesso!`)
                onImportComplete()
            } else {
                toast.error('Nenhum colaborador foi importado devido a erros.')
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erro ao importar colaboradores')
            setHasErrors(false)
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

    const downloadErrorReport = () => {
        if (importErrors.length === 0) return
        
        try {
            let reportContent = "RELATÓRIO DE ERROS NA IMPORTAÇÃO DE COLABORADORES\n"
            reportContent += "=================================================\n\n"
            reportContent += `Data: ${new Date().toLocaleString()}\n`
            reportContent += `Arquivo: ${file?.name || 'Desconhecido'}\n`
            reportContent += `Total de erros: ${importErrors.length}\n\n`
            
            const errorTypes = {}
            importErrors.forEach(error => {
                const errors = error.erro.split(', ')
                errors.forEach(err => {
                    errorTypes[err] = (errorTypes[err] || 0) + 1
                })
            })
            
            reportContent += "RESUMO DOS ERROS\n"
            reportContent += "-----------------\n"
            Object.entries(errorTypes)
                .sort((a, b) => b[1] - a[1])
                .forEach(([error, count]) => {
                    reportContent += `${error}: ${count} ocorrência(s)\n`
                })
            
            reportContent += "\n\nDETALHES DOS ERROS\n"
            reportContent += "===================\n\n"
            
            importErrors.forEach((error, index) => {
                reportContent += `ERRO #${index + 1} (Linha ${error.linha})\n`
                reportContent += "-----------------\n"
                
                try {
                    const rawData = JSON.parse(error.dados)
                    reportContent += "Dados:\n"
                    Object.entries(rawData).forEach(([key, value]) => {
                        reportContent += `  ${key}: ${value || '(vazio)'}\n`
                    })
                } catch {
                    reportContent += `Dados: ${error.dados}\n`
                }
                
                reportContent += `Erro: ${error.erro}\n\n`
            })
            
            reportContent += "\nSUGESTÕES PARA CORREÇÃO\n"
            reportContent += "=======================\n"
            reportContent += "1. Verifique se o arquivo CSV está usando ponto e vírgula (;) como separador\n"
            reportContent += "2. Certifique-se que os nomes de empresa, setor e cargo correspondem exatamente aos cadastrados no sistema\n"
            reportContent += "3. Verifique se todos os campos obrigatórios estão preenchidos (nome, email, cpf, empresa, setor, cargo)\n"
            reportContent += "4. O CPF deve estar no formato correto, sem pontos ou traços\n"
            reportContent += "5. Baixe o modelo de arquivo CSV e compare com o seu arquivo para identificar diferenças\n"
            
            if (companies.length > 0 || departments.length > 0 || positions.length > 0) {
                reportContent += "\n\nDADOS DISPONÍVEIS NO SISTEMA\n"
                reportContent += "===========================\n"
                
                if (companies.length > 0) {
                    reportContent += "\nEmpresas disponíveis:\n"
                    companies.forEach(company => {
                        reportContent += `- ${company.name}\n`
                    })
                }
                
                if (departments.length > 0) {
                    reportContent += "\nSetores disponíveis:\n"
                    departments.forEach(department => {
                        reportContent += `- ${department.name}\n`
                    })
                }
                
                if (positions.length > 0) {
                    reportContent += "\nCargos disponíveis:\n"
                    positions.forEach(position => {
                        reportContent += `- ${position.name}\n`
                    })
                }
            }
            
            const blob = new Blob([reportContent], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `erros_importacao_${new Date().toISOString().slice(0, 10)}.txt`
            document.body.appendChild(link)
            link.click()
            
            setTimeout(() => {
                document.body.removeChild(link)
                URL.revokeObjectURL(url)
            }, 100)
            
            toast.success('Relatório de erros baixado com sucesso')
        } catch (error) {
            toast.error('Erro ao gerar relatório')
        }
    }

    const downloadErrorReportExcel = () => {
        if (importErrors.length === 0) return
        
        try {
            const excelData = importErrors.map(error => {
                let rawData = {}
                try {
                    rawData = JSON.parse(error.dados)
                } catch {
                    rawData = { dados: error.dados }
                }
                
                return {
                    'Linha': error.linha,
                    'Nome': rawData.nome || '',
                    'Email': rawData.email || '',
                    'CPF': rawData.cpf || '',
                    'Empresa': rawData.empresa || '',
                    'Setor': rawData.setor || '',
                    'Cargo': rawData.cargo || '',
                    'Erro': error.erro
                }
            })
            
            const wb = XLSX.utils.book_new()
            const ws = XLSX.utils.json_to_sheet(excelData)
            
            XLSX.utils.book_append_sheet(wb, ws, 'Erros')
            
            if (companies.length > 0 || departments.length > 0 || positions.length > 0) {
                const referenceData = []
                
                if (companies.length > 0) {
                    referenceData.push({ 'Tipo': 'EMPRESAS DISPONÍVEIS', 'Nome': '' })
                    companies.forEach(company => {
                        referenceData.push({ 'Tipo': 'Empresa', 'Nome': company.name })
                    })
                    referenceData.push({ 'Tipo': '', 'Nome': '' })
                }
                
                if (departments.length > 0) {
                    referenceData.push({ 'Tipo': 'SETORES DISPONÍVEIS', 'Nome': '' })
                    departments.forEach(department => {
                        referenceData.push({ 'Tipo': 'Setor', 'Nome': department.name })
                    })
                    referenceData.push({ 'Tipo': '', 'Nome': '' })
                }
                
                if (positions.length > 0) {
                    referenceData.push({ 'Tipo': 'CARGOS DISPONÍVEIS', 'Nome': '' })
                    positions.forEach(position => {
                        referenceData.push({ 'Tipo': 'Cargo', 'Nome': position.name })
                    })
                }
                
                const wsRef = XLSX.utils.json_to_sheet(referenceData)
                XLSX.utils.book_append_sheet(wb, wsRef, 'Dados Disponíveis')
            }
            
            const suggestionsData = [
                { 'Sugestão': 'SUGESTÕES PARA CORREÇÃO' },
                { 'Sugestão': '' },
                { 'Sugestão': '1. Verifique se o arquivo CSV está usando ponto e vírgula (;) como separador' },
                { 'Sugestão': '2. Certifique-se que os nomes de empresa, setor e cargo correspondem exatamente aos cadastrados no sistema' },
                { 'Sugestão': '3. Verifique se todos os campos obrigatórios estão preenchidos (nome, email, cpf, empresa, setor, cargo)' },
                { 'Sugestão': '4. O CPF deve estar no formato correto, sem pontos ou traços' },
                { 'Sugestão': '5. Baixe o modelo de arquivo CSV e compare com o seu arquivo para identificar diferenças' }
            ]
            
            const wsSuggestions = XLSX.utils.json_to_sheet(suggestionsData)
            XLSX.utils.book_append_sheet(wb, wsSuggestions, 'Sugestões')
            
            XLSX.writeFile(wb, `erros_importacao_${new Date().toISOString().slice(0, 10)}.xlsx`)
            
            toast.success('Relatório de erros em Excel baixado com sucesso')
        } catch (error) {
            toast.error('Erro ao gerar relatório Excel')
        }
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
                                                <div className="mt-2 p-3 bg-orange-50 dark:bg-orange-900/30 rounded-md">
                                                    <h4 className="text-sm font-medium text-orange-700 dark:text-orange-300">Dicas para importação:</h4>
                                                    <ul className="mt-1 text-xs text-orange-600 dark:text-orange-400 list-disc pl-5 space-y-1">
                                                        <li>Os nomes de empresa, setor e cargo devem corresponder exatamente aos cadastrados no sistema</li>
                                                        <li>Verifique se o arquivo não tem linhas vazias ou formatação incorreta</li>
                                                        <li>O CPF deve estar no formato correto, sem pontos ou traços</li>
                                                    </ul>
                                                </div>
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
                                                    {hasErrors && (
                                                        <button
                                                            type="button"
                                                            onClick={downloadErrorReportExcel}
                                                            className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                                                        >
                                                            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                                                            Verificar Erros
                                                        </button>
                                                    )}
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
                                                {hasErrors && (
                                                    <button
                                                        type="button"
                                                        onClick={downloadErrorReportExcel}
                                                        className="inline-flex w-full justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 sm:mt-0 sm:w-auto"
                                                    >
                                                        <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                                                        Verificar Erros
                                                    </button>
                                                )}
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