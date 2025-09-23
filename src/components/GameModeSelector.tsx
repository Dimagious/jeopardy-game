import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, CardContent, CardHeader, CardTitle } from '../ui'
import { cn } from '../shared/utils'

interface GameModeSelectorProps {
  gameId: string
  onModeSelect?: (mode: GameMode) => void
}

export type GameMode = 'jeopardy' | 'buzzer'

const GAME_MODES = [
  {
    id: 'jeopardy' as GameMode,
    title: 'Классический Jeopardy',
    description: 'Традиционный формат игры. Ведущий управляет всем процессом, участники отвечают устно.',
    features: [
      'Ведущий выбирает вопросы',
      'Участники отвечают устно',
      'Подходит для больших аудиторий',
      'Простое управление'
    ],
    icon: '🎯',
    color: 'bg-blue-600 hover:bg-blue-700',
    textColor: 'text-blue-100'
  },
  {
    id: 'buzzer' as GameMode,
    title: 'Buzzer Mode',
    description: 'Интерактивный режим. Участники подключаются по PIN и соревнуются, кто первый нажмет кнопку.',
    features: [
      'Участники подключаются по PIN',
      'Гонка "кто первый нажал"',
      'Интерактивное участие',
      'Современный формат'
    ],
    icon: '⚡',
    color: 'bg-green-600 hover:bg-green-700',
    textColor: 'text-green-100'
  }
]

export default function GameModeSelector({ gameId, onModeSelect }: GameModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null)
  const navigate = useNavigate()

  const handleModeSelect = (mode: GameMode) => {
    setSelectedMode(mode)
    
    // Сохраняем выбор в localStorage
    localStorage.setItem(`jeopardy-game-mode-${gameId}`, mode)
    
    // Вызываем callback если есть
    onModeSelect?.(mode)
    
    // Переходим к выбранному режиму
    navigate(`/host/${gameId}/${mode}`)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Выберите режим игры
          </h1>
          <p className="text-xl text-gray-300">
            Какой формат игры вы хотите провести?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {GAME_MODES.map((mode) => (
            <Card
              key={mode.id}
              className={cn(
                'cursor-pointer transition-all duration-300 transform hover:scale-105',
                'border-2 hover:border-yellow-400',
                selectedMode === mode.id && 'border-yellow-400 scale-105'
              )}
              onClick={() => handleModeSelect(mode.id)}
            >
              <CardHeader className="text-center">
                <div className="text-6xl mb-4">{mode.icon}</div>
                <CardTitle className="text-2xl text-white">
                  {mode.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-300 text-center">
                  {mode.description}
                </p>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">Особенности:</h4>
                  <ul className="space-y-1">
                    {mode.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-400 flex items-center">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button
                  className={cn(
                    'w-full mt-6 transition-all duration-300',
                    mode.color,
                    mode.textColor,
                    'hover:shadow-lg hover:shadow-yellow-400/25'
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleModeSelect(mode.id)
                  }}
                >
                  Выбрать {mode.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Выбор можно изменить позже в настройках игры
          </p>
        </div>
      </div>
    </div>
  )
}
