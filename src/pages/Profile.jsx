import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import useAuthStore from '../store/authStore'

function Profile() {
  const { user, setAuth } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  const onSubmit = async (data) => {
    try {
      // Simulação de API - Substituir por chamada real
      const updatedUser = {
        ...user,
        name: data.name,
        email: data.email
      }
      
      setAuth(updatedUser, user.token)
      toast.success(
        <div>
          <span className="font-medium text-green-600">Sucesso!</span>
          <br />
          <span className="text-sm text-green-950">Perfil atualizado com sucesso</span>
        </div>
      )
      setIsEditing(false)
      reset({
        ...data,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      toast.error(
        <div>
          <span className="font-medium text-red-600">Erro ao atualizar perfil</span>
          <br />
          <span className="text-sm text-red-950">Tente novamente mais tarde</span>
        </div>
      )
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
            Perfil do Usuário
          </h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nome
              </label>
              <input
                type="text"
                {...register('name', { required: 'Nome é obrigatório' })}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-700 dark:text-gray-300"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                {...register('email', {
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido'
                  }
                })}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-700 dark:text-gray-300"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {isEditing && (
              <>
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Senha Atual
                  </label>
                  <input
                    type="password"
                    {...register('currentPassword')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-gray-300"
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    {...register('newPassword', {
                      minLength: {
                        value: 6,
                        message: 'A senha deve ter no mínimo 6 caracteres'
                      }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-gray-300"
                  />
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    {...register('confirmPassword', {
                      validate: (value, formValues) => 
                        !formValues.newPassword || value === formValues.newPassword || 
                        'As senhas não coincidem'
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-gray-300"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </>
            )}

            <div className="flex justify-end gap-3">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="btn-primary"
                >
                  Editar Perfil
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false)
                      reset()
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Salvar Alterações
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile