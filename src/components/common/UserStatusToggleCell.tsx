import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toggleUserStatus } from "@/features/users/api/toggleUserStatus"

type UserStatus = "active" | "suspended" | string | undefined

function labelFor(status: UserStatus) {
  if (status === "active") return "Active"
  if (status === "suspended") return "Suspended"
  return "Unknown"
}

export function UserStatusToggleCell(props: {
  userId: string
  status?: UserStatus
  onToggled?: () => void
}) {
  const [submitting, setSubmitting] = useState(false)

  const current = labelFor(props.status)
  const nextAction = props.status === "suspended" ? "Activate" : "Suspend"

  return (
    <div className="flex items-center justify-end gap-2">
      <span className="text-xs text-muted-foreground ">{current}</span>
      <AlertDialog>
        <AlertDialogTrigger render={<Button variant="outline" size="sm" disabled={submitting} />}>
          {nextAction}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm status change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {nextAction.toLowerCase()} this user?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={submitting}
              onClick={() => {
                setSubmitting(true)
                void toggleUserStatus(props.userId)
                  .then(() => {
                    toast.success("User status updated")
                    props.onToggled?.()
                  })
                  .catch((e) => {
                    toast.error(e instanceof Error ? e.message : "Failed to update status")
                  })
                  .finally(() => {
                    setSubmitting(false)
                  })
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

