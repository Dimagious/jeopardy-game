import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../shared/useAuthSimple'
import { useTeams } from '../shared/useTeams'
import { Team, CreateTeamRequest, UpdateTeamRequest } from '../shared/types'
import Button from '../ui/Button'
import { Card } from '../ui/Card'
import Modal from '../ui/Modal'
import { TeamCard, TeamForm } from '../components'

function TeamsPage() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const { hasPermission, isLoading: authLoading } = useAuth()
  
  const { 
    teams, 
    isLoading: teamsLoading, 
    error: teamsError, 
    limits,
    createTeam, 
    updateTeam, 
    deleteTeam, 
    duplicateTeam,
    reorderTeams 
  } = useTeams(gameId || null)

  const [showTeamForm, setShowTeamForm] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Проверяем права доступа
  React.useEffect(() => {
    if (authLoading) return
    
    if (!hasPermission('canManageGames')) {
      navigate('/admin')
    }
  }, [hasPermission, navigate, authLoading])

  const handleCreateTeam = async (data: CreateTeamRequest | UpdateTeamRequest) => {
    if (!gameId) return

    setIsSubmitting(true)
    try {
      await createTeam(data as CreateTeamRequest)
      setShowTeamForm(false)
    } catch (err) {
      console.error('Failed to create team:', err)
      alert(`Failed to create team: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateTeam = async (data: CreateTeamRequest | UpdateTeamRequest) => {
    if (!editingTeam) return

    setIsSubmitting(true)
    try {
      await updateTeam(editingTeam.id, data as UpdateTeamRequest)
      setEditingTeam(null)
    } catch (err) {
      console.error('Failed to update team:', err)
      alert(`Failed to update team: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTeam = async (team: Team) => {
    if (window.confirm(`Are you sure you want to delete team "${team.name}"?`)) {
      try {
        await deleteTeam(team.id)
      } catch (err) {
        console.error('Failed to delete team:', err)
        alert(`Failed to delete team: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }
  }

  const handleDuplicateTeam = async (team: Team) => {
    try {
      await duplicateTeam(team.id)
    } catch (err) {
      console.error('Failed to duplicate team:', err)
      alert(`Failed to duplicate team: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleMoveTeam = (team: Team, direction: 'up' | 'down') => {
    const currentIndex = teams.findIndex(t => t.id === team.id)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= teams.length) return

    const newOrder = [...teams]
    const [movedTeam] = newOrder.splice(currentIndex, 1)
    if (!movedTeam) return
    newOrder.splice(newIndex, 0, movedTeam)

    const teamIds = newOrder.map(t => t.id)
    reorderTeams({ teamIds }).catch(err => {
      console.error('Failed to reorder teams:', err)
      alert(`Failed to reorder teams: ${err instanceof Error ? err.message : 'Unknown error'}`)
    })
  }

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team)
  }

  const handleCancelForm = () => {
    setShowTeamForm(false)
    setEditingTeam(null)
  }

  if (authLoading || teamsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading teams...</p>
        </div>
      </div>
    )
  }

  if (teamsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error loading teams</div>
          <p className="text-gray-600">{teamsError.message}</p>
        </div>
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
              <h1 className="text-3xl font-bold text-gray-900">Manage Teams</h1>
              <p className="mt-2 text-gray-600">Create and manage teams for your game</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/admin')}
                className="bg-gray-600 hover:bg-gray-700 text-white"
              >
                Back to Admin
              </Button>
              <Button
                onClick={() => setShowTeamForm(true)}
                disabled={limits ? !limits.canCreate : false}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add Team
              </Button>
            </div>
          </div>
        </div>

        {/* Limits Info */}
        {limits && (
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Teams: {limits.current} / {limits.max}
                </div>
                {!limits.canCreate && (
                  <div className="text-sm text-red-600 font-medium">
                    Team limit reached
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Teams List */}
        <div className="space-y-4">
          {teams.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-gray-500">
                <p className="text-lg mb-2">No teams yet</p>
                <p className="text-sm">Create your first team to get started</p>
              </div>
            </Card>
          ) : (
            teams.map((team, index) => {
              const baseProps = {
                key: team.id,
                team,
                onEdit: () => handleEditTeam(team),
                onDelete: () => handleDeleteTeam(team),
                onDuplicate: () => handleDuplicateTeam(team),
                isFirst: index === 0,
                isLast: index === teams.length - 1,
              }

              const teamCardProps = {
                ...baseProps,
                ...(index > 0 && { onMoveUp: () => handleMoveTeam(team, 'up') }),
                ...(index < teams.length - 1 && { onMoveDown: () => handleMoveTeam(team, 'down') }),
              }

              return <TeamCard {...teamCardProps} />
            })
          )}
        </div>

        {/* Team Form Modal */}
        <Modal
          isOpen={showTeamForm || editingTeam !== null}
          onClose={handleCancelForm}
          title={editingTeam ? 'Edit Team' : 'Create Team'}
        >
          <TeamForm
            initialData={editingTeam}
            onSubmit={editingTeam ? handleUpdateTeam : handleCreateTeam}
            onCancel={handleCancelForm}
            isLoading={isSubmitting}
            disabled={limits ? !limits.canCreate : false}
          />
        </Modal>
      </div>
    </div>
  )
}

export default TeamsPage
