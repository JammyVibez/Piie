import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserX, Home, Search } from "lucide-react"

export default function ProfileNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
          <UserX size={48} className="text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">User Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The profile you are looking for does not exist or may have been removed.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="gap-2 w-full sm:w-auto">
              <Home size={16} />
              Go Home
            </Button>
          </Link>
          <Link href="/explore">
            <Button variant="outline" className="gap-2 w-full sm:w-auto bg-transparent">
              <Search size={16} />
              Explore Users
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
