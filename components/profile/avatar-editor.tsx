"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Palette, Shirt, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AvatarRenderer } from "./avatar-renderer"
import { type AvatarConfig, AVATAR_OPTIONS, DEFAULT_AVATAR } from "@/lib/avatar-config"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AvatarEditor({
  isOpen,
  onClose,
  onSave,
}: { isOpen: boolean; onClose: () => void; onSave: (config: AvatarConfig) => void }) {
  const [tempConfig, setTempConfig] = useState<AvatarConfig>(DEFAULT_AVATAR)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-card border border-white/10 w-full max-w-4xl h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl"
          >
            {/* 3D Preview Area */}
            <div className="relative flex-1 bg-gradient-to-b from-muted/50 to-background h-1/2 md:h-full">
              <AvatarRenderer config={tempConfig} interactive />
              <div className="absolute top-6 left-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-mono tracking-widest uppercase opacity-50">3D Real-time Engine</span>
              </div>
            </div>

            {/* Customization UI */}
            <div className="w-full md:w-[400px] border-l border-white/10 p-8 flex flex-col h-1/2 md:h-full overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black uppercase tracking-tighter">Avatar DNA</h2>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <Tabs defaultValue="appearance" className="flex-1">
                <TabsList className="w-full grid grid-cols-3 mb-8 bg-muted/50 p-1 rounded-2xl">
                  <TabsTrigger value="appearance" className="rounded-xl font-black text-[10px] uppercase">
                    <User className="w-4 h-4 mr-2" /> DNA
                  </TabsTrigger>
                  <TabsTrigger value="outfit" className="rounded-xl font-black text-[10px] uppercase">
                    <Shirt className="w-4 h-4 mr-2" /> GEAR
                  </TabsTrigger>
                  <TabsTrigger value="colors" className="rounded-xl font-black text-[10px] uppercase">
                    <Palette className="w-4 h-4 mr-2" /> VIBE
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="appearance" className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 block">
                      Skin Tone
                    </label>
                    <div className="flex gap-4">
                      {AVATAR_OPTIONS.skinTones.map((tone) => (
                        <button
                          key={tone}
                          onClick={() => setTempConfig({ ...tempConfig, skinTone: tone })}
                          className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${tempConfig.skinTone === tone ? "border-primary scale-110" : "border-transparent"}`}
                          style={{ backgroundColor: tone }}
                        />
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Additional tab contents would go here */}
              </Tabs>

              <div className="pt-8 mt-auto grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="rounded-full font-black uppercase tracking-widest text-[10px] bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => onSave(tempConfig)}
                  className="rounded-full bg-primary font-black uppercase tracking-widest text-[10px]"
                >
                  Evolve Avatar
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
