import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import api from '../utils/api'
import useAuthStore from '../store/authStore'

export function useNotifications() {
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const { token } = useAuthStore()

    useEffect(() => {
        fetchNotifications()
    }, [token])

    const fetchNotifications = async () => {
        try {
            const headers = {
                Authorization: `Bearer ${token}`
            }
            const response = await api.get('/admin/obterNotificacoes', { headers })
            setNotifications(response.data)
            updateUnreadCount(response.data)
        } catch (error) {
            console.error('Erro ao buscar notificações:', error)
        }
    }

    const updateUnreadCount = (notifs) => {
        const count = notifs.filter(n => !n.checked).length
        setUnreadCount(count)
    }

    const markAsRead = async (id) => {
        try {
            const headers = {
                Authorization: `Bearer ${token}`
            }
            await api.put('/admin/marcarNotificacaoLida', { id }, { headers })
            
            // Atualiza o estado local e recalcula o contador
            const updatedNotifications = notifications.map(n => 
                n.id === id ? { ...n, checked: true } : n
            )
            setNotifications(updatedNotifications)
            updateUnreadCount(updatedNotifications)
            
        } catch (error) {
            console.error('Erro ao marcar notificação como lida:', error)
        }
    }

    const markAllAsRead = async () => {
        try {
            const headers = {
                Authorization: `Bearer ${token}`
            }
            // Atualizado para o endpoint correto
            await api.put('/admin/marcarTodasNotificacoesLida', null, { headers })
            setNotifications(prev => prev.map(n => ({ ...n, checked: true })))
            setUnreadCount(0)
        } catch (error) {
            console.error('Erro ao marcar todas notificações como lidas:', error)
        }
    }

    const formatDate = (dateString) => {
        return format(new Date(dateString), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })
    }

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        formatDate
    }
}