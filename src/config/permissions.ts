export type Role = 'admin' | 'manager' | 'viewer'

export const permissions = {
  canManageProducts: (role: Role) => role === 'admin' || role === 'manager',
  canViewReports: (role: Role) => role === 'admin',
} as const

