/**
 * Journey motivational messaging system
 * Provides milestone-based encouragement messages for the Journey screen
 */

export function getJourneyMotivationalMessage(completed: number): { line1: string; line2: string } {
  if (completed === 0) {
    return { line1: "🚀 Start exploring!", line2: "🌱 Next milestone: 5 states" };
  } else if (completed < 5) {
    return { line1: "🌱 Great start! Keep going!", line2: `🌱 ${5 - completed} more states to unlock the next milestone` };
  } else if (completed === 5) {
    return { line1: "🎉 5-state milestone unlocked!", line2: "🌿 Next milestone: 10 states" };
  } else if (completed < 10) {
    return { line1: "🌿 Keep exploring!", line2: `🌿 ${10 - completed} more states to next milestone` };
  } else if (completed === 10) {
    return { line1: "🎉 10-state milestone unlocked!", line2: "🌳 Next milestone: 15 states" };
  } else if (completed < 15) {
    return { line1: "🌳 Keep going!", line2: `🌳 ${15 - completed} more states to next milestone` };
  } else if (completed === 15) {
    return { line1: "🎉 Great progress!", line2: "🏆 Next milestone: 20 states" };
  } else if (completed < 20) {
    return { line1: "🏆 Halfway there!", line2: `🏆 ${20 - completed} more states to next milestone` };
  } else if (completed === 20) {
    return { line1: "🎉 20-state milestone unlocked!", line2: "🏆 Next milestone: 25 states" };
  } else if (completed < 25) {
    return { line1: "🏆 Great progress!", line2: `🏆 ${25 - completed} more states to next milestone` };
  } else if (completed === 25) {
    return { line1: "🎉 25-state milestone unlocked!", line2: "👑 Next milestone: 30 states" };
  } else if (completed < 30) {
    return { line1: "👑 Almost there!", line2: `👑 ${30 - completed} more states to next milestone` };
  } else if (completed === 30) {
    return { line1: "🎉 30-state milestone unlocked!", line2: "👑 Next milestone: 36 states" };
  } else if (completed === 35) {
    return { line1: "👑 Almost there!", line2: "👑 1 more state to become India Master!" };
  } else if (completed < 36) {
    return { line1: "👑 Almost there!", line2: `👑 ${36 - completed} more states to become India Master!` };
  } else {
    return { line1: "👑 India Master!", line2: "🎉 You explored all 36 destinations!" };
  }
}
