import { useGameStore } from '../shared/gameStore'
import { cn } from '../shared/utils'

interface ScoreboardProps {
  className?: string
  variant?: 'host' | 'screen'
}

export default function Scoreboard({ className, variant = 'host' }: ScoreboardProps) {
  const { teams, getTeamScore } = useGameStore()

  const isScreen = variant === 'screen'

  return (
    <div className={cn('w-full animate-fade-in', className)}>
      <h2 className={cn(
        'font-bold mb-6 text-center text-shadow animate-slide-up',
        isScreen ? 'text-xl' : 'text-xl'
      )}>
        Счёт команд
      </h2>
      
      <div className={cn(
        'space-y-4',
        isScreen ? 'space-y-6' : 'space-y-3'
      )}>
        {teams.map((team, index) => {
          const score = getTeamScore(team.id)
          
          return (
            <div
              key={team.id}
              className={cn(
                'flex items-center justify-between animate-scale-in',
                isScreen ? 'space-x-6' : 'space-x-3'
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center space-x-3">
                <div className={cn(
                  'rounded-full transition-all duration-300',
                  {
                    'w-3 h-3': !isScreen,
                    'w-6 h-6': isScreen,
                    'bg-red-500': team.order === 1,
                    'bg-blue-500': team.order === 2,
                    'bg-green-500': team.order === 3,
                  }
                )}></div>
                <div className={cn(
                  'font-semibold text-shadow',
                  isScreen ? 'text-lg' : 'text-base'
                )}>
                  {team.name}
                </div>
              </div>
              <div className={cn(
                'font-bold text-jeopardy-gold text-shadow-lg transition-all duration-300',
                isScreen ? 'text-2xl' : 'text-xl'
              )}>
                {score}$
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
