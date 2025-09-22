import { useEffect } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '../ui'
import { useGameStore } from '../shared/gameStore'
import { cn } from '../shared/utils'

interface HostPanelProps {
  className?: string
}

export default function HostPanel({ className }: HostPanelProps) {
  const {
    gameState,
    teams,
    selectTeam,
    toggleAnswer,
    judgeAnswer,
    getTeamScore,
    exportResults,
  } = useGameStore()

  const selectedTeam = gameState?.selectedTeam

  // Горячие клавиши
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameState?.currentQuestion) return

      switch (e.key.toLowerCase()) {
        case 'a':
          e.preventDefault()
          toggleAnswer()
          break
        case 'c':
          e.preventDefault()
          if (selectedTeam) {
            judgeAnswer(selectedTeam, true)
          }
          break
        case 'x':
          e.preventDefault()
          if (selectedTeam) {
            judgeAnswer(selectedTeam, false)
          }
          break
        case 'escape':
          e.preventDefault()
          // Сброс выбора команды
          if (selectedTeam) {
            selectTeam('')
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameState, selectedTeam, toggleAnswer, judgeAnswer, selectTeam])

  const handleTeamSelect = (teamId: string) => {
    selectTeam(teamId)
  }

  const handleCorrect = () => {
    if (selectedTeam) {
      judgeAnswer(selectedTeam, true)
    }
  }

  const handleIncorrect = () => {
    if (selectedTeam) {
      judgeAnswer(selectedTeam, false)
    }
  }

  const handleExport = () => {
    exportResults()
  }

  return (
    <div className={className}>
      {/* Отображение текущего вопроса */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Вопрос</CardTitle>
        </CardHeader>
        <CardContent>
          {gameState?.currentQuestion ? (
            <div className="space-y-4 animate-fade-in">
              <div className="jeopardy-question min-h-[200px] flex flex-col justify-center animate-scale-in glow-effect">
                <div className="text-lg font-semibold mb-2 text-shadow animate-slide-up">
                  ${gameState.currentQuestion.value}
                </div>
                <div className="text-xl mb-4 text-shadow animate-slide-up">
                  {gameState.currentQuestion.text}
                </div>
                {gameState.currentQuestion.showAnswer && (
                  <div className="jeopardy-answer mt-4 animate-fade-in glow-effect-gold">
                    <div className="text-lg font-semibold mb-2 text-shadow">Ответ:</div>
                    <div className="text-xl text-shadow">
                      {gameState.currentQuestion.answer}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-sm text-gray-400">
                Горячие клавиши: <kbd className="px-2 py-1 bg-gray-700 rounded">A</kbd> - ответ,{' '}
                <kbd className="px-2 py-1 bg-gray-700 rounded">C</kbd> - верно,{' '}
                <kbd className="px-2 py-1 bg-gray-700 rounded">X</kbd> - неверно,{' '}
                <kbd className="px-2 py-1 bg-gray-700 rounded">Esc</kbd> - назад
              </div>
            </div>
          ) : (
            <div className="jeopardy-question min-h-[200px] flex items-center justify-center">
              <p className="text-gray-300">Выберите ячейку на поле</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Управление */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Управление</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="success"
            className="w-full"
            onClick={toggleAnswer}
            disabled={!gameState?.currentQuestion}
          >
            {gameState?.currentQuestion?.showAnswer ? 'Скрыть ответ' : 'Показать ответ'}
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="primary"
              onClick={handleCorrect}
              disabled={!selectedTeam || !gameState?.currentQuestion}
            >
              Верно
            </Button>
            <Button
              variant="danger"
              onClick={handleIncorrect}
              disabled={!selectedTeam || !gameState?.currentQuestion}
            >
              Неверно
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Выбор команды */}
      <Card>
        <CardHeader>
          <CardTitle>Выберите команду</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teams.map((team) => {
              const score = getTeamScore(team.id)
              const isSelected = selectedTeam === team.id
              
              return (
                <button
                  key={team.id}
                  onClick={() => handleTeamSelect(team.id)}
                  className={cn(
                    'w-full p-3 rounded-lg border-2 transition-all duration-200',
                    'flex items-center justify-between',
                    {
                      'border-yellow-400 bg-yellow-400/10': isSelected,
                      'border-gray-600 hover:border-gray-500': !isSelected,
                    }
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      'w-3 h-3 rounded-full',
                      {
                        'bg-red-500': team.order === 1,
                        'bg-blue-500': team.order === 2,
                        'bg-green-500': team.order === 3,
                      }
                    )}></div>
                    <span className="font-medium">{team.name}</span>
                  </div>
                  <span className="font-bold text-jeopardy-gold">
                    ${score}
                  </span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Экспорт результатов */}
      <Card>
        <CardHeader>
          <CardTitle>Экспорт результатов</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleExport}
          >
            📊 Экспорт в CSV
          </Button>
          <p className="text-sm text-gray-400 mt-2 text-center">
            Скачать результаты игры в формате CSV
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
