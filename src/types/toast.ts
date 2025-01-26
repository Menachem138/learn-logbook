import * as React from "react"

export interface ToastProps {
  id?: string
  className?: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export type ToastActionElement = React.ReactElement<{
  className?: string
  altText?: string
}>
