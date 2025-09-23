import { RolePermissions } from './types'

// Роли и их права доступа
export const ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  Owner: {
    canManageUsers: true,
    canManageGames: true,
    canManagePacks: true,
    canManageBilling: true,
    canViewAnalytics: true,
    canHostGames: true,
    canViewScreen: true,
  },
  Admin: {
    canManageUsers: true,
    canManageGames: true,
    canManagePacks: true,
    canManageBilling: false,
    canViewAnalytics: true,
    canHostGames: true,
    canViewScreen: true,
  },
  Host: {
    canManageUsers: false,
    canManageGames: true,
    canManagePacks: false,
    canManageBilling: false,
    canViewAnalytics: false,
    canHostGames: true,
    canViewScreen: true,
  },
  Viewer: {
    canManageUsers: false,
    canManageGames: false,
    canManagePacks: false,
    canManageBilling: false,
    canViewAnalytics: false,
    canHostGames: false,
    canViewScreen: true,
  },
}

// Проверка прав доступа
export function hasPermission(
  role: string | null,
  permission: keyof RolePermissions
): boolean {
  if (!role) return false
  return ROLE_PERMISSIONS[role]?.[permission] || false
}

// Проверка множественных прав
export function hasAnyPermission(
  role: string | null,
  permissions: (keyof RolePermissions)[]
): boolean {
  return permissions.some(permission => hasPermission(role, permission))
}

// Проверка всех прав
export function hasAllPermissions(
  role: string | null,
  permissions: (keyof RolePermissions)[]
): boolean {
  return permissions.every(permission => hasPermission(role, permission))
}

// Получение всех прав для роли
export function getRolePermissions(role: string | null): RolePermissions | null {
  if (!role) return null
  return ROLE_PERMISSIONS[role] || null
}

// Проверка, может ли пользователь управлять организацией
export function canManageOrganization(role: string | null): boolean {
  return hasPermission(role, 'canManageUsers') && hasPermission(role, 'canManageBilling')
}

// Проверка, может ли пользователь создавать игры
export function canCreateGames(role: string | null): boolean {
  return hasPermission(role, 'canManageGames')
}

// Проверка, может ли пользователь проводить игры
export function canHostGames(role: string | null): boolean {
  return hasPermission(role, 'canHostGames')
}

// Проверка, может ли пользователь просматривать экран
export function canViewScreen(role: string | null): boolean {
  return hasPermission(role, 'canViewScreen')
}

// Получение иерархии ролей (для проверки, может ли одна роль управлять другой)
export const ROLE_HIERARCHY: Record<string, number> = {
  Owner: 4,
  Admin: 3,
  Host: 2,
  Viewer: 1,
}

// Проверка, может ли роль управлять другой ролью
export function canManageRole(managerRole: string | null, targetRole: string | null): boolean {
  if (!managerRole || !targetRole) return false
  
  const managerLevel = ROLE_HIERARCHY[managerRole] || 0
  const targetLevel = ROLE_HIERARCHY[targetRole] || 0
  
  return managerLevel > targetLevel
}

// Получение доступных ролей для назначения
export function getAssignableRoles(managerRole: string | null): string[] {
  if (!managerRole) return []
  
  const managerLevel = ROLE_HIERARCHY[managerRole] || 0
  
  return Object.keys(ROLE_HIERARCHY).filter(role => 
    (ROLE_HIERARCHY[role] || 0) < managerLevel
  )
}
