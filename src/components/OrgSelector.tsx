import { useState } from 'react'
import { Organization } from '../shared/types'
import { Button } from '../ui'

interface OrgSelectorProps {
  organizations: Organization[]
  currentOrg: Organization | null
  onSelectOrg: (orgId: string) => void
  onCreateOrg: () => void
  className?: string
}

export default function OrgSelector({ 
  organizations, 
  currentOrg, 
  onSelectOrg, 
  onCreateOrg,
  className 
}: OrgSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="secondary"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <span>{currentOrg?.name || 'Выберите организацию'}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-2">
            <div className="px-3 py-2 text-sm font-medium text-gray-500 border-b border-gray-100">
              Организации
            </div>
            
            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => {
                  onSelectOrg(org.id)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50 transition-colors ${
                  currentOrg?.id === org.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                <div className="font-medium">{org.name}</div>
                {org.description && (
                  <div className="text-xs text-gray-500 mt-1">{org.description}</div>
                )}
              </button>
            ))}
            
            <div className="border-t border-gray-100 mt-2 pt-2">
              <button
                onClick={() => {
                  onCreateOrg()
                  setIsOpen(false)
                }}
                className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
                + Создать организацию
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
