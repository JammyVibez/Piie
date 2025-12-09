
"use client"

import { useState } from "react"
import { ArrowLeft, ShoppingCart, Star, Sparkles, Crown, Zap, Heart, Coins } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"

const shopItems = [
  {
    id: "1",
    name: "XP Booster",
    description: "Double your XP gains for 24 hours",
    price: 500,
    category: "boosters",
    icon: "⚡",
    rarity: "rare",
  },
  {
    id: "2",
    name: "Premium Badge",
    description: "Exclusive premium member badge",
    price: 1000,
    category: "badges",
    icon: "👑",
    rarity: "epic",
  },
  {
    id: "3",
    name: "Custom Theme",
    description: "Unlock custom theme editor",
    price: 750,
    category: "cosmetics",
    icon: "🎨",
    rarity: "rare",
  },
  {
    id: "4",
    name: "Profile Frame",
    description: "Legendary animated profile frame",
    price: 2000,
    category: "cosmetics",
    icon: "✨",
    rarity: "legendary",
  },
  {
    id: "5",
    name: "Story Boost",
    description: "Boost your story to the top for 2 hours",
    price: 300,
    category: "boosters",
    icon: "🚀",
    rarity: "common",
  },
  {
    id: "6",
    name: "Verified Badge",
    description: "Get the verified checkmark",
    price: 5000,
    category: "badges",
    icon: "✓",
    rarity: "legendary",
  },
]

const rarityColors = {
  common: "border-slate-500/30 bg-slate-500/5",
  rare: "border-blue-500/30 bg-blue-500/5",
  epic: "border-purple-500/30 bg-purple-500/5",
  legendary: "border-yellow-500/30 bg-yellow-500/5",
}

export default function ShopPage() {
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [userCoins, setUserCoins] = useState(user?.xp || 0)

  const filteredItems = selectedCategory === "all" 
    ? shopItems 
    : shopItems.filter(item => item.category === selectedCategory)

  const handlePurchase = (item: typeof shopItems[0]) => {
    if (userCoins < item.price) {
      alert("Not enough coins!")
      return
    }
    
    if (confirm(`Purchase ${item.name} for ${item.price} coins?`)) {
      setUserCoins(prev => prev - item.price)
      alert(`Successfully purchased ${item.name}!`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 rounded-full hover:bg-muted/50 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <ShoppingCart className="text-primary" />
                P!!E Shop
              </h1>
              <p className="text-sm text-muted-foreground">Enhance your experience</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full border border-yellow-500/30">
            <Coins className="text-yellow-500" size={20} />
            <span className="font-bold text-lg">{userCoins.toLocaleString()}</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Categories */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="w-full justify-start bg-card border border-border">
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="boosters">Boosters</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="cosmetics">Cosmetics</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Featured Banner */}
        <Card className="mb-8 p-6 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Sparkles className="text-yellow-500" />
                Special Offer!
              </h2>
              <p className="text-muted-foreground">Get 50% off all boosters this week!</p>
            </div>
            <div className="text-right">
              <Badge className="bg-red-500 text-white mb-2">Limited Time</Badge>
              <p className="text-sm text-muted-foreground">Ends in 3 days</p>
            </div>
          </div>
        </Card>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card 
              key={item.id} 
              className={`p-6 border-2 ${rarityColors[item.rarity as keyof typeof rarityColors]} hover:shadow-lg transition-all hover:-translate-y-1`}
            >
              <div className="text-center mb-4">
                <div className="text-6xl mb-3">{item.icon}</div>
                <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                <Badge variant="outline" className="capitalize mb-4">
                  {item.rarity}
                </Badge>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xl font-bold text-yellow-500">
                  <Coins size={20} />
                  {item.price.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  4.8
                </div>
              </div>

              <Button 
                onClick={() => handlePurchase(item)}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-lg"
                disabled={userCoins < item.price}
              >
                {userCoins < item.price ? "Not Enough Coins" : "Purchase"}
              </Button>
            </Card>
          ))}
        </div>

        {/* How to Earn Coins */}
        <Card className="mt-12 p-6 bg-muted/30 border-border">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Zap className="text-primary" />
            How to Earn Coins
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Heart className="text-primary" size={20} />
              </div>
              <div>
                <p className="font-semibold mb-1">Daily Login</p>
                <p className="text-sm text-muted-foreground">+50 coins per day</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <Star className="text-secondary" size={20} />
              </div>
              <div>
                <p className="font-semibold mb-1">Create Posts</p>
                <p className="text-sm text-muted-foreground">+10 coins per post</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Crown className="text-accent" size={20} />
              </div>
              <div>
                <p className="font-semibold mb-1">Complete Challenges</p>
                <p className="text-sm text-muted-foreground">+100 coins per challenge</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
