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
  token: string | null
}

const initialState: AuthState = {
  user: null,
  token: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ user: AuthUser; token: string | null }>,
    ) {
      state.user = action.payload.user
      state.token = action.payload.token
    },
    logout(state) {
      state.user = null
      state.token = null
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer

