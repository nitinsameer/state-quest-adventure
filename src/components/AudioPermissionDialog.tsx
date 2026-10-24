/**
 * Audio Permission Dialog - REMOVED
 * 
 * Audio now works without permission dialogs.
 * Users can manage audio preferences in settings using the AudioSettingToggle.
 * This component is kept as a no-op for backwards compatibility.
 */

export interface AudioPermissionDialogProps {
  onAccept?: () => void;
  onReject?: () => void;
  open?: boolean;
  forceShow?: boolean;
  context?: "profile-creation" | "profile-settings" | "first-load";
}

export function AudioPermissionDialog({}: AudioPermissionDialogProps): null {
  // Audio works without permission dialogs now
  return null;
}
