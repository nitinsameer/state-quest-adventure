# State Explorer Quest

https://github.com/nitinsameer/exploria-indica , this is my app created by Lovable in another session , can u see if u can get the entier context and build the remaining one 

The learning-to-quiz flow is incomplete. Please fix:

1. Add routes /state/$slug/quiz, /state/$slug/complete, /state/$slug/unlock 

using QuizScreen, StateCompletedScreen, StateUnlockScreen from screens.tsx.

2. Wire navigation: StateIntroScreen's Continue button → /state/$slug/learn. 

LearningHubScreen's "Take the Quiz!" button → /state/$slug/quiz. 

LearningCardScreen's "Got it! Next" button should advance through all 6 

learning cards, then go to the quiz. After the 3rd correct quiz answer, 

navigate to /state/$slug/complete, which after a moment navigates to 

/state/$slug/unlock (showing the next locked state), then "Continue 

Adventure" goes to /home.

3. Fix StateIntroScreen's Back button to navigate back correctly (the route 

isn't currently passing onBack/onContinue handlers).

4. Make the RowLink items on the Profile screen (My Passport, Achievements, 

Daily Goals, Parent Zone) real Links to /passport, /achievements, and /parent, 

and pull their numbers (stamps collected, achievements unlocked, streak) from 

useProgress() instead of hardcoded text.

5. Test the full loop yourself: Home → pick a state → Intro → Learning Hub → 

all 6 cards → Quiz (3 questions) → State Complete → State Unlock → back to 

Home showing updated XP/streak, and the next state now unlocked on the 

Journey Map. Fix anything that doesn't flow.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://state-quest-adventure.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1fa70934-4185-4fde-acd3-ef63537a3b4f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
