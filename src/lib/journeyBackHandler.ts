/**
 * Global reference to the journey back handler
 * This allows the root component to call journey-specific back behavior
 * when the back button is pressed while on the /journey route.
 */
let journeyBackHandler: (() => void) | null = null;

export function setJourneyBackHandler(handler: (() => void) | null) {
  journeyBackHandler = handler;
}

export function getJourneyBackHandler() {
  return journeyBackHandler;
}
