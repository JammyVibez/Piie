"use client"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Trophy, Target } from "lucide-react"

interface PlayerResult {
  userId: string
  username: string
  avatar: string
  rank: number
  kills?: number
  deaths?: number
  score: number
  team: string
}

interface MatchResultsProps {
  roomTitle: string
  gameIcon: string
  results: PlayerResult[]
  onPublish?: () => void
  onClose?: () => void
}

export function MatchResults({ roomTitle, gameIcon, results, onPublish, onClose }: MatchResultsProps) {
  const teamA = results.filter((r) => r.team === "Team A")
  const teamB = results.filter((r) => r.team === "Team B")

  const getTeamScore = (team: PlayerResult[]) => team.reduce((acc, p) => acc + p.score, 0)

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-card rounded-3xl overflow-hidden flex flex-col max-h-[90vh] glass">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-b border-border/50 p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h2 className="text-2xl font-bold">Match Results</h2>
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-sm text-muted-foreground">{roomTitle}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Team A */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500" />
                <h3 className="font-bold text-lg">Team A</h3>
              </div>
              <div className="text-2xl font-bold text-blue-500">{getTeamScore(teamA)}</div>
            </div>
            <div className="space-y-2">
              {teamA
                .sort((a, b) => b.score - a.score)
                .map((player, index) => (
                  <div
                    key={player.userId}
                    className="p-3 rounded-lg bg-muted border border-border flex items-center gap-3"
                  >
                    <div className="text-sm font-bold text-muted-foreground w-6 text-center">#{index + 1}</div>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={player.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{player.username[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{player.username}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {player.kills !== undefined && (
                        <div className="text-xs">
                          <span className="text-red-500 font-bold">{player.kills}K</span>
                          <span className="text-muted-foreground">/</span>
                          <span className="text-gray-400">{player.deaths}D</span>
                        </div>
                      )}
                      <div className="text-sm font-bold">{player.score}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Team B */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500" />
                <h3 className="font-bold text-lg">Team B</h3>
              </div>
              <div className="text-2xl font-bold text-red-500">{getTeamScore(teamB)}</div>
            </div>
            {teamB.length > 0 ? (
              <div className="space-y-2">
                {teamB
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => (
                    <div
                      key={player.userId}
                      className="p-3 rounded-lg bg-muted border border-border flex items-center gap-3"
                    >
                      <div className="text-sm font-bold text-muted-foreground w-6 text-center">#{index + 1}</div>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={player.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{player.username[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{player.username}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {player.kills !== undefined && (
                          <div className="text-xs">
                            <span className="text-red-500 font-bold">{player.kills}K</span>
                            <span className="text-muted-foreground">/</span>
                            <span className="text-gray-400">{player.deaths}D</span>
                          </div>
                        )}
                        <div className="text-sm font-bold">{player.score}</div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-muted text-center text-muted-foreground text-sm">Team incomplete</div>
            )}
          </div>

          {/* Awards */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3">MVP</p>
            <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 flex items-center gap-3">
              <Target className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="font-bold">{results[0]?.username}</p>
                <p className="text-xs text-muted-foreground">Highest Score: {results[0]?.score} pts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border/50 p-6 flex gap-2 bg-muted/30">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onPublish} className="flex-1">
            Publish to Room
          </Button>
        </div>
      </div>
    </div>
  )
}
