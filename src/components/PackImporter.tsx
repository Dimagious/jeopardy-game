import React, { useState } from 'react'
import { QuestionPack } from '../shared/types'
import { Card } from '../ui/Card'
import Button from '../ui/Button'
import Modal from '../ui/Modal'

interface PackImporterProps {
  isOpen: boolean
  onClose: () => void
  onImport: (packId: string, gameId: string) => void
  availablePacks: QuestionPack[]
  availableGames: Array<{ id: string; title: string }>
  isLoading?: boolean
}

export const PackImporter: React.FC<PackImporterProps> = ({
  isOpen,
  onClose,
  onImport,
  availablePacks,
  availableGames,
  isLoading = false,
}) => {
  const [selectedPackId, setSelectedPackId] = useState<string>('')
  const [selectedGameId, setSelectedGameId] = useState<string>('')

  const handleImport = () => {
    if (selectedPackId && selectedGameId) {
      onImport(selectedPackId, selectedGameId)
      setSelectedPackId('')
      setSelectedGameId('')
    }
  }

  const handleClose = () => {
    setSelectedPackId('')
    setSelectedGameId('')
    onClose()
  }

  const selectedPack = availablePacks.find(pack => pack.id === selectedPackId)
  const selectedGame = availableGames.find(game => game.id === selectedGameId)

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Pack to Game"
    >
      <div className="space-y-6">
        {/* Pack Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Pack
          </label>
          <select
            value={selectedPackId}
            onChange={(e) => setSelectedPackId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            <option value="">Choose a pack...</option>
            {availablePacks.map((pack) => (
              <option key={pack.id} value={pack.id}>
                {pack.title} {pack.isPublic ? '(Public)' : ''}
              </option>
            ))}
          </select>
          {selectedPack && (
            <div className="mt-2 text-sm text-gray-600">
              <p><strong>Description:</strong> {selectedPack.description || 'No description'}</p>
              <p><strong>Tags:</strong> {selectedPack.tags.join(', ') || 'No tags'}</p>
            </div>
          )}
        </div>

        {/* Game Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Game
          </label>
          <select
            value={selectedGameId}
            onChange={(e) => setSelectedGameId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            <option value="">Choose a game...</option>
            {availableGames.map((game) => (
              <option key={game.id} value={game.id}>
                {game.title}
              </option>
            ))}
          </select>
          {selectedGame && (
            <div className="mt-2 text-sm text-gray-600">
              <p><strong>Game:</strong> {selectedGame.title}</p>
            </div>
          )}
        </div>

        {/* Import Summary */}
        {selectedPack && selectedGame && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Import Summary</h4>
            <p className="text-sm text-blue-800">
              This will import all categories and questions from <strong>"{selectedPack.title}"</strong> 
              into <strong>"{selectedGame.title}"</strong>.
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Note: This will add new categories and questions to the game. Existing content will not be modified.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t">
          <Button
            onClick={handleClose}
            className="bg-gray-600 hover:bg-gray-700 text-white"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            disabled={!selectedPackId || !selectedGameId || isLoading}
          >
            {isLoading ? 'Importing...' : 'Import Pack'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}