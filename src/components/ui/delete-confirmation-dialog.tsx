"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Loader2Icon, AlertTriangleIcon } from "lucide-react"
import { useState } from "react"

interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  title: string
  description: string
  isDeleting?: boolean
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  isDeleting = false,
}: DeleteConfirmationDialogProps) {
  const [isPending, setIsPending] = useState(false)

  const handleConfirm = async () => {
    try {
      setIsPending(true)
      await onConfirm()
    } finally {
      setIsPending(false)
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[400px] bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangleIcon className="h-5 w-5" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-500">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel
            disabled={isPending}
            className="border-gray-200 hover:bg-gray-100"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault()
              handleConfirm()
            }}
            className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
          >
            {isPending ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}