// State management setup
// This file will be used for Zustand or Redux store configuration
// Example with Zustand:

import { create } from 'zustand'

interface AppState {
  // Add your global state here
}

export const useAppStore = create<AppState>()(() => ({
  // Initial state
}))

