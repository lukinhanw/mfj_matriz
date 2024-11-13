import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
	persist(
		(set) => ({
			user: null,
			token: null,
			rememberMe: false,
			setAuth: ({ user, token, rememberMe }) => set({ user, token, rememberMe }),
			logout: () => set({ user: null, token: null, rememberMe: false }),
		}),
		{
			name: 'auth-storage',
			partialize: (state) => ({
				// Only persist auth data if rememberMe is true
				user: state.rememberMe ? state.user : null,
				token: state.rememberMe ? state.token : null,
				rememberMe: state.rememberMe
			})
		}
	)
)

export default useAuthStore