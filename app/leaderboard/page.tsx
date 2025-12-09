import { LeftSidebar } from "@/components/left-sidebar"
import { RightSidebar } from "@/components/right-sidebar"
import { LeaderboardView } from "@/components/leaderboard-view"
import { Header } from "@/components/header"

export default function LeaderboardPage() {
  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 md:p-6">
            <LeaderboardView />
          </div>
        </main>
        <RightSidebar />
      </div>
    </div>
  )
}
