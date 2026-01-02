"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, Mic, FileText, X, Check, Sparkles } from "lucide-react"

interface Permission {
  type: "location" | "microphone" | "files"
  status: "pending" | "granted" | "denied"
  label: string
  description: string
  icon: React.ReactNode
}

interface PermissionsManagerProps {
  onPermissionsUpdate?: (permissions: Record<string, boolean>) => void
}

export function PermissionsManager({ onPermissionsUpdate }: PermissionsManagerProps) {
  const [showNotification, setShowNotification] = useState(false)
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      type: "location",
      status: "pending",
      label: "Location",
      description: "For location-aware searches and relevant results",
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      type: "microphone",
      status: "pending",
      label: "Microphone",
      description: "For voice-to-text input",
      icon: <Mic className="w-4 h-4" />,
    },
    {
      type: "files",
      status: "pending",
      label: "File Access",
      description: "For saving downloads and uploading files",
      icon: <FileText className="w-4 h-4" />,
    },
  ])

  useEffect(() => {
    // Check if permissions have been requested before
    const permissionsRequested = localStorage.getItem("aria_permissions_requested")
    if (!permissionsRequested) {
      setShowNotification(true)
    } else {
      // Load saved permission states
      loadSavedPermissions()
    }
  }, [])

  const loadSavedPermissions = async () => {
    const savedPerms = localStorage.getItem("aria_permissions_state")
    if (savedPerms) {
      const parsed = JSON.parse(savedPerms)
      setPermissions((prev) =>
        prev.map((p) => ({
          ...p,
          status: parsed[p.type] || "pending",
        }))
      )
    }

    // Check actual browser permissions
    if (navigator.permissions) {
      try {
        const locationStatus = await navigator.permissions.query({ name: "geolocation" as PermissionName })
        updatePermissionStatus("location", locationStatus.state === "granted" ? "granted" : "denied")

        const micStatus = await navigator.permissions.query({ name: "microphone" as PermissionName })
        updatePermissionStatus("microphone", micStatus.state === "granted" ? "granted" : "denied")
      } catch (error) {
        console.log("Permission query not supported")
      }
    }
  }

  const updatePermissionStatus = (type: string, status: "granted" | "denied") => {
    setPermissions((prev) =>
      prev.map((p) => (p.type === type ? { ...p, status } : p))
    )
    
    // Save to localStorage
    const permState = permissions.reduce(
      (acc, p) => ({ ...acc, [p.type]: p.status }),
      {}
    )
    localStorage.setItem("aria_permissions_state", JSON.stringify(permState))
  }

  const requestPermission = async (type: "location" | "microphone" | "files") => {
    try {
      if (type === "location") {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            updatePermissionStatus("location", "granted")
            localStorage.setItem("aria_location_enabled", "true")
            notifyParent()
          },
          (error) => {
            updatePermissionStatus("location", "denied")
            localStorage.setItem("aria_location_enabled", "false")
            notifyParent()
          }
        )
      } else if (type === "microphone") {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach((track) => track.stop()) // Stop the stream immediately
        updatePermissionStatus("microphone", "granted")
        localStorage.setItem("aria_microphone_enabled", "true")
        notifyParent()
      } else if (type === "files") {
        // Files API doesn't need explicit permission, just mark as granted
        updatePermissionStatus("files", "granted")
        localStorage.setItem("aria_files_enabled", "true")
        notifyParent()
      }
    } catch (error) {
      updatePermissionStatus(type, "denied")
      localStorage.setItem(`aria_${type}_enabled`, "false")
      notifyParent()
    }
  }

  const notifyParent = () => {
    const permState = permissions.reduce(
      (acc, p) => ({ ...acc, [p.type]: p.status === "granted" }),
      {}
    )
    onPermissionsUpdate?.(permState)
  }

  const requestAllPermissions = async () => {
    localStorage.setItem("aria_permissions_requested", "true")
    
    for (const perm of permissions) {
      if (perm.status === "pending") {
        await requestPermission(perm.type)
      }
    }
    
    // Don't auto-hide, let user dismiss
  }

  const dismissNotification = () => {
    localStorage.setItem("aria_permissions_requested", "true")
    setShowNotification(false)
  }

  if (!showNotification) {
    return null
  }

  const allGranted = permissions.every((p) => p.status === "granted")
  const anyDenied = permissions.some((p) => p.status === "denied")

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full mx-4 sm:mx-0">
      <div className="bg-card border border-border rounded-xl shadow-2xl p-4 animate-in slide-in-from-top-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#208299] to-[#1a6b7a] rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Enable Enhanced Features</h3>
              <p className="text-xs text-muted-foreground">Optional permissions for better experience</p>
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={dismissNotification} className="h-6 w-6 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2 mb-4">
          {permissions.map((perm) => (
            <div
              key={perm.type}
              className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-2 flex-1">
                <div className="text-[#208299]">{perm.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{perm.label}</p>
                  <p className="text-xs text-muted-foreground">{perm.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {perm.status === "granted" && (
                  <Check className="w-4 h-4 text-green-600" />
                )}
                {perm.status === "denied" && (
                  <X className="w-4 h-4 text-destructive" />
                )}
                {perm.status === "pending" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => requestPermission(perm.type)}
                    className="h-7 px-2 text-xs"
                  >
                    Allow
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          {!allGranted && (
            <Button
              size="sm"
              onClick={requestAllPermissions}
              className="flex-1 bg-[#208299] hover:bg-[#1a6b7a] text-xs"
            >
              Enable All
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={dismissNotification}
            className="flex-1 text-xs"
          >
            {allGranted ? "Done" : "Maybe Later"}
          </Button>
        </div>

        {anyDenied && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            You can enable these later in browser settings
          </p>
        )}
      </div>
    </div>
  )
}
