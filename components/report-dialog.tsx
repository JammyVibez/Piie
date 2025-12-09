"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Flag, Loader2, CheckCircle, AlertTriangle } from "lucide-react"
import type { ReportReason } from "@/components/types"
import { cn } from "@/lib/utils"

const reportReasons: { value: ReportReason; label: string; description: string }[] = [
  { value: "spam", label: "Spam", description: "Unwanted promotional content or repetitive posts" },
  { value: "harassment", label: "Harassment", description: "Bullying, threats, or targeted attacks" },
  { value: "hate_speech", label: "Hate Speech", description: "Content promoting hatred against groups" },
  { value: "violence", label: "Violence", description: "Graphic violence or threats of harm" },
  { value: "nudity", label: "Nudity/Sexual Content", description: "Inappropriate sexual content" },
  { value: "false_info", label: "False Information", description: "Misleading or fake content" },
  { value: "copyright", label: "Copyright Violation", description: "Stolen or unauthorized content" },
  { value: "other", label: "Other", description: "Something else not listed above" },
]

interface ReportDialogProps {
  targetType: "user" | "post" | "message" | "comment"
  targetId: string
  targetName?: string
  trigger?: React.ReactNode
}

export function ReportDialog({ targetType, targetId, targetName, trigger }: ReportDialogProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"reason" | "details" | "success">("reason")
  const [reason, setReason] = useState<ReportReason | "">("")
  const [details, setDetails] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!reason) return

    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setStep("success")
    setIsSubmitting(false)
  }

  const handleClose = () => {
    setOpen(false)
    // Reset after animation
    setTimeout(() => {
      setStep("reason")
      setReason("")
      setDetails("")
    }, 200)
  }

  const targetTypeLabels = {
    user: "User",
    post: "Post",
    message: "Message",
    comment: "Comment",
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Flag size={16} />
            Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {step === "reason" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="text-destructive" size={20} />
                Report {targetTypeLabels[targetType]}
              </DialogTitle>
              <DialogDescription>
                {targetName ? `Report "${targetName}"` : "Why are you reporting this content?"}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <RadioGroup value={reason} onValueChange={(v) => setReason(v as ReportReason)}>
                <div className="space-y-2">
                  {reportReasons.map((item) => (
                    <label
                      key={item.value}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                        reason === item.value
                          ? "border-destructive bg-destructive/5"
                          : "border-border/50 hover:border-destructive/50",
                      )}
                    >
                      <RadioGroupItem value={item.value} className="mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={() => setStep("details")}
                disabled={!reason}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Continue
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "details" && (
          <>
            <DialogHeader>
              <DialogTitle>Provide Additional Details</DialogTitle>
              <DialogDescription>Help us understand the issue better (optional)</DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <p className="text-sm text-muted-foreground">Reporting for:</p>
                <p className="font-medium text-foreground">{reportReasons.find((r) => r.value === reason)?.label}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">Additional information</Label>
                <Textarea
                  id="details"
                  placeholder="Describe the issue in more detail..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="min-h-[120px] resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">{details.length}/500</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setStep("reason")}>
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "success" && (
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Report Submitted</h3>
            <p className="text-muted-foreground mb-6">
              Thank you for helping keep P!!E safe. We will review your report and take appropriate action.
            </p>
            <Button onClick={handleClose} className="bg-primary">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
