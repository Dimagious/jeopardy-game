import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../shared/useAuthSimple'
import { useGames, usePlanLimits } from '../shared/useGames'
import { GamesApi } from '../shared/gamesApi'
import { GameListFilters, CreateGameRequest, Game } from '../shared/types'
import Button from '../ui/Button'
import { Card } from '../ui/Card'
import Modal from '../ui/Modal'
import { GameCard, GameForm } from '../components'

function GamesListPage() {
  const navigate = useNavigate()
  const { currentOrg, hasPermission } = useAuth()
  const { games, isLoading, error, loadGames, createGame, deleteGame, duplicateGame } = useGames(currentOrg?.id || null)
  const { limits, checkLimits } = usePlanLimits(currentOrg?.id || null)
  
  const [filters, setFilters] = useState<GameListFilters>({})
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Проверяем права доступа
  const canManageGames = hasPermission('canManageGames')

  // Обработка поиска
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    const newFilters = { ...filters, search: value || undefined }
    setFilters(newFilters)
    loadGames(newFilters)
  }

  // Обработка создания игры
  const handleCreateGame = async (gameData: CreateGameRequest) => {
    try {
      if (!currentOrg?.id) throw new Error('Organization not selected')
      
      await createGame(currentOrg.id, gameData)
      setShowCreateModal(false)
      await checkLimits() // Обновляем лимиты
    } catch (err) {
      console.error('Failed to create game:', err)
    }
  }

  // Обработка дублирования игры
  const handleDuplicateGame = async (game: Game) => {
    try {
      await duplicateGame(game.id, `${game.title} (Copy)`)
      await checkLimits() // Обновляем лимиты
    } catch (err) {
      console.error('Failed to duplicate game:', err)
    }
  }

  // Обработка удаления игры
  const handleDeleteGame = async (game: Game) => {
    if (window.confirm(`⚠️ PERMANENT DELETE ⚠️\n\nAre you sure you want to permanently delete "${game.title}"?\n\nThis will delete:\n• All categories\n• All questions\n• All teams\n• The game itself\n\nThis action CANNOT be undone!`)) {
      try {
        await deleteGame(game.id)
        await checkLimits() // Обновляем лимиты
      } catch (err) {
        console.error('Failed to delete game:', err)
        alert(`Failed to delete game: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }
  }

  // Обработка фильтров
  const handleFilterChange = (newFilters: Partial<GameListFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    loadGames(updatedFilters)
  }

  if (!canManageGames) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to manage games.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Games</h1>
              <p className="mt-2 text-gray-600">
                Manage your games and create new ones
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {limits && (
                <div className="text-sm text-gray-600">
                  {limits.currentGames} / {limits.maxGames} games used
                </div>
              )}
              <Button
                onClick={() => setShowCreateModal(true)}
                disabled={limits ? !limits.canCreate : false}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create Game
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={filters.status?.[0] || ''}
                onChange={(e) => handleFilterChange({ 
                  status: e.target.value ? [e.target.value as Game['status']] : undefined 
                })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
              <select
                value={filters.sortBy || 'createdAt'}
                onChange={(e) => handleFilterChange({ 
                  sortBy: e.target.value as 'title' | 'createdAt' | 'updatedAt'
                })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Created Date</option>
                <option value="updatedAt">Updated Date</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Games List */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading games...</p>
          </div>
        ) : error ? (
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
            <Button 
              onClick={() => loadGames(filters)}
              className="mt-4 bg-blue-600 hover:bg-blue-700"
            >
              Try Again
            </Button>
          </Card>
        ) : games.length === 0 ? (
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Games Found</h2>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'No games match your search criteria.' : 'Create your first game to get started.'}
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              disabled={limits ? !limits.canCreate : false}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Game
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onView={() => navigate(`/org/${currentOrg?.id}/admin/games/${game.id}/view`)}
                onEdit={() => navigate(`/org/${currentOrg?.id}/admin/games/${game.id}/edit`)}
                onDuplicate={() => handleDuplicateGame(game)}
                onDelete={() => handleDeleteGame(game)}
              />
            ))}
          </div>
        )}

        {/* Create Game Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Game"
        >
          <GameForm
            onSubmit={handleCreateGame}
            onCancel={() => setShowCreateModal(false)}
            limits={limits}
          />
        </Modal>
      </div>
    </div>
  )
}

export default GamesListPage
