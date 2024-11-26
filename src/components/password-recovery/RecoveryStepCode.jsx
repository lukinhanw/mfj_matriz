import { useForm } from 'react-hook-form'

export default function RecoveryStepCode({ onSubmit, isLoading, email, onResend }) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data.code))} className="mt-4 space-y-6">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Um código de recuperação foi enviado para {email}
        </p>
        
        <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Código de Recuperação
        </label>
        <input
          id="code"
          type="text"
          {...register('code', {
            required: 'Código é obrigatório',
            minLength: {
              value: 6,
              message: 'Código deve ter 6 dígitos'
            },
            maxLength: {
              value: 6,
              message: 'Código deve ter 6 dígitos'
            }
          })}
          className="mt-1 block w-full px-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 shadow-sm 
                    focus:ring-2 focus:ring-orange-500 focus:border-transparent 
                    dark:bg-gray-700 dark:text-white
                    transition-transform transform hover:scale-105"
          disabled={isLoading}
          maxLength={6}
        />
        {errors.code && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.code.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white 
                bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-transform transform hover:scale-105"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Verificando...
          </>
        ) : (
          'Verificar código'
        )}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={onResend}
          disabled={isLoading}
          className="text-sm text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
        >
          Reenviar código
        </button>
      </div>
    </form>
  )
}