import { useAuth } from '../shared/useAuthSimple'
import { OrgSelector } from '../components'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui'
import { useNavigate } from 'react-router-dom'

export default function AdminPage() {
  const navigate = useNavigate()
  const { 
    user, 
    isLoading, 
    isAuthenticated, 
    currentOrg, 
    currentRole, 
    signOut, 
    switchOrganization,
    hasPermission 
  } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jeopardy-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Доступ запрещён</CardTitle>
            <CardDescription>
              Необходимо войти в систему для доступа к админке
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/login'}>
              Войти в систему
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleCreateOrg = () => {
    // TODO: Implement organization creation
    alert('Создание организации будет реализовано в следующих версиях')
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = '/login'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Jeopardy Admin</h1>
              {currentOrg && (
                <OrgSelector
                  organizations={user.organizations}
                  currentOrg={currentOrg}
                  onSelectOrg={switchOrganization}
                  onCreateOrg={handleCreateOrg}
                />
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {user.name || user.email}
                {currentRole && (
                  <span className="ml-2 px-2 py-1 bg-jeopardy-blue text-white text-xs rounded-full">
                    {currentRole === 'Owner' ? 'Владелец' :
                     currentRole === 'Admin' ? 'Администратор' :
                     currentRole === 'Host' ? 'Ведущий' : 'Наблюдатель'}
                  </span>
                )}
              </div>
              <Button variant="secondary" onClick={handleSignOut}>
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Welcome Card */}
          <Card>
            <CardHeader>
              <CardTitle>Добро пожаловать в админку!</CardTitle>
              <CardDescription>
                Управляйте играми, пользователями и настройками организации
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-gray-600">Игр создано</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-sm text-gray-600">Пакетов вопросов</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">1</div>
                  <div className="text-sm text-gray-600">Пользователей</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Management - временно отключено */}
          {/* {hasPermission('canManageUsers') && currentOrg && (
            <UserManagement
              orgId={currentOrg.id}
              currentUserRole={currentRole || ''}
            />
          )} */}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Быстрые действия</CardTitle>
              <CardDescription>
                Основные функции админки
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {hasPermission('canManageGames') && currentOrg && (
                  <Button 
                    variant="primary" 
                    className="h-20 flex flex-col items-center justify-center"
                    onClick={() => navigate(`/org/${currentOrg.id}/admin/games`)}
                  >
                    <div className="text-2xl mb-1">🎮</div>
                    <div className="text-sm">Управление играми</div>
                  </Button>
                )}
                
                {hasPermission('canManagePacks') && (
                  <Button variant="secondary" className="h-20 flex flex-col items-center justify-center">
                    <div className="text-2xl mb-1">📚</div>
                    <div className="text-sm">Библиотека пакетов</div>
                  </Button>
                )}
                
                {hasPermission('canHostGames') && (
                  <Button variant="secondary" className="h-20 flex flex-col items-center justify-center">
                    <div className="text-2xl mb-1">🎯</div>
                    <div className="text-sm">Провести игру</div>
                  </Button>
                )}
                
                {hasPermission('canViewAnalytics') && (
                  <Button variant="secondary" className="h-20 flex flex-col items-center justify-center">
                    <div className="text-2xl mb-1">📊</div>
                    <div className="text-sm">Аналитика</div>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
