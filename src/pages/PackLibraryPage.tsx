import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../shared/useAuthSimple'
import { usePacks, usePackTags } from '../shared/usePacks'
import { useGames } from '../shared/useGames'
import { QuestionPack, PackFilters } from '../shared/types'
import Button from '../ui/Button'
import { Card } from '../ui/Card'
import Modal from '../ui/Modal'
import { PackCard, PackPreview, PackImporter } from '../components'

function PackLibraryPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const navigate = useNavigate()
  const { hasPermission, isLoading: authLoading } = useAuth()
  
  const { 
    packs, 
    isLoading: packsLoading, 
    error: packsError, 
    deletePack, 
    duplicatePack,
    importPackToGame
  } = usePacks(orgId || null)

  const { games } = useGames(null)
  const { tags } = usePackTags(orgId || null)

  const [filters, setFilters] = useState<PackFilters>({})
  const [showPackPreview, setShowPackPreview] = useState(false)
  const [showPackImporter, setShowPackImporter] = useState(false)
  const [previewingPack, setPreviewingPack] = useState<QuestionPack | null>(null)

  // Проверяем права доступа
  useEffect(() => {
    if (authLoading) return
    
    if (!hasPermission('canManagePacks')) {
      navigate('/admin')
    }
  }, [hasPermission, navigate, authLoading])


  const handleDeletePack = async (pack: QuestionPack) => {
    if (window.confirm(`Are you sure you want to delete pack "${pack.title}"?`)) {
      try {
        await deletePack(pack.id)
      } catch (err) {
        console.error('Failed to delete pack:', err)
        alert(`Failed to delete pack: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }
  }

  const handleDuplicatePack = async (pack: QuestionPack) => {
    try {
      await duplicatePack(pack.id)
    } catch (err) {
      console.error('Failed to duplicate pack:', err)
      alert(`Failed to duplicate pack: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }


  const handleViewPack = (pack: QuestionPack) => {
    setPreviewingPack(pack)
    setShowPackPreview(true)
  }

  const handleImportPack = (packId: string, gameId: string) => {
    importPackToGame({ packId, gameId }).then(() => {
      setShowPackImporter(false)
      alert('Pack imported successfully!')
    }).catch(err => {
      console.error('Failed to import pack:', err)
      alert(`Failed to import pack: ${err instanceof Error ? err.message : 'Unknown error'}`)
    })
  }


  const handleClosePreview = () => {
    setShowPackPreview(false)
    setPreviewingPack(null)
  }

  const handleSearch = (search: string) => {
    const newFilters = { ...filters }
    if (search) {
      newFilters.search = search
    } else {
      delete newFilters.search
    }
    setFilters(newFilters)
  }

  const handleTagFilter = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags?.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...(prev.tags || []), tag]
    }))
  }

  if (authLoading || packsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading packs...</p>
        </div>
      </div>
    )
  }

  if (packsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error loading packs</div>
          <p className="text-gray-600">{packsError.message}</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Pack Library</h1>
              <p className="mt-2 text-gray-600">Manage and reuse question packs</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/admin')}
                className="bg-gray-600 hover:bg-gray-700 text-white"
              >
                Back to Admin
              </Button>
              <Button
                onClick={() => alert('Create Pack functionality will be implemented in the next iteration')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create Pack
              </Button>
              <Button
                onClick={() => setShowPackImporter(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Import Pack
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <Card className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-64">
                <input
                  type="text"
                  placeholder="Search packs..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagFilter(tag)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      filters.tags?.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Packs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packs.length === 0 ? (
            <div className="col-span-full">
              <Card className="p-8 text-center">
                <div className="text-gray-500">
                  <p className="text-lg mb-2">No packs yet</p>
                  <p className="text-sm">Create your first pack to get started</p>
                </div>
              </Card>
            </div>
          ) : (
            packs.map((pack) => (
              <PackCard
                key={pack.id}
                pack={pack}
                onView={() => handleViewPack(pack)}
                onEdit={() => alert('Edit Pack functionality will be implemented in the next iteration')}
                onDelete={() => handleDeletePack(pack)}
                onDuplicate={() => handleDuplicatePack(pack)}
                showImportButton={true}
                onImport={() => setShowPackImporter(true)}
              />
            ))
          )}
        </div>

        {/* Pack Preview Modal */}
        <Modal
          isOpen={showPackPreview}
          onClose={handleClosePreview}
          title="Pack Preview"
        >
          {previewingPack && (
            <div className="max-h-96 overflow-y-auto">
              <PackPreview
                preview={{
                  pack: previewingPack,
                  categories: [],
                  questions: [],
                  stats: {
                    categoriesCount: 0,
                    questionsCount: 0,
                    totalValue: 0,
                    averageValue: 0
                  }
                }}
                onClose={handleClosePreview}
              />
            </div>
          )}
        </Modal>

        {/* Pack Importer Modal */}
        <PackImporter
          isOpen={showPackImporter}
          onClose={() => setShowPackImporter(false)}
          onImport={handleImportPack}
          availablePacks={packs}
          availableGames={games.map(game => ({ id: game.id, title: game.title }))}
          isLoading={false}
        />
      </div>
    </div>
  )
}

export default PackLibraryPage
