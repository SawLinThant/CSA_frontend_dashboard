import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type Role = 'admin' | 'manager' | 'viewer'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
}

export interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{
        user: AuthUser
        accessToken: string
        refreshToken: string | null
      }>,
    ) {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
    },
    logout(state) {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer

