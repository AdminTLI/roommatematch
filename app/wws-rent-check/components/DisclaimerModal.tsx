'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface DisclaimerModalProps {
  open: boolean
  onAccept: () => void
}

export function DisclaimerModal({ open, onAccept }: DisclaimerModalProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-brand-text">
            Important Legal Disclaimer
          </DialogTitle>
          <DialogDescription className="text-brand-muted pt-4">
            <div className="space-y-4 text-sm leading-relaxed">
              <p>
                This calculation uses the 'Wet betaalbare huur' (2025) standards. However, official rulings can vary based on measurement precision.
              </p>
              <p>
                <strong>Use this result to negotiate, not as a legal verdict.</strong>
              </p>
              <p>
                Domu Match is not liable for legal actions taken based on this result. For a legally binding ruling, please contact the Huurcommissie or a legal expert.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={onAccept}
            className="w-full h-12 bg-brand-primary hover:bg-brand-primaryHover text-white font-semibold rounded-xl shadow-lg shadow-brand-primary/20"
          >
            I understand, show my score
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}



