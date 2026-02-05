'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { Tour, TourStep, tours, pageTourMap } from '@/config/tours'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface OnboardingContextType {
    // Current tour state
    activeTour: Tour | null
    currentStepIndex: number
    currentStep: TourStep | null
    isActive: boolean

    // Tour control
    startTour: (tourId: string) => void
    nextStep: () => void
    prevStep: () => void
    skipTour: () => void
    endTour: () => void

    // Completion tracking
    completedTours: string[]
    isTourCompleted: (tourId: string) => boolean
    resetTour: (tourId: string) => void
    resetAllTours: () => void
}

const OnboardingContext = createContext<OnboardingContextType | null>(null)

const STORAGE_KEY_PREFIX = 'bizops-completed-tours-'

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const pathname = usePathname()
    const { data: session } = useSession()
    const [activeTour, setActiveTour] = useState<Tour | null>(null)
    const [currentStepIndex, setCurrentStepIndex] = useState(0)
    const [completedTours, setCompletedTours] = useState<string[]>([])
    const [hasInitialized, setHasInitialized] = useState(false)

    // Load completed tours from localStorage on mount (when session is available)
    useEffect(() => {
        if (typeof window !== 'undefined' && session?.user?.email) {
            // Use email as stable identifier since ID might differ between providers if not normalized
            const userId = session.user.id || session.user.email
            const storageKey = `${STORAGE_KEY_PREFIX}${userId}`
            const stored = localStorage.getItem(storageKey)
            if (stored) {
                try {
                    setCompletedTours(JSON.parse(stored))
                } catch {
                    setCompletedTours([])
                }
            } else {
                setCompletedTours([])
            }
            setHasInitialized(true)
        }
    }, [session])

    // Save completed tours to localStorage
    useEffect(() => {
        if (hasInitialized && typeof window !== 'undefined' && session?.user?.email) {
            const userId = session.user.id || session.user.email
            const storageKey = `${STORAGE_KEY_PREFIX}${userId}`
            localStorage.setItem(storageKey, JSON.stringify(completedTours))
        }
    }, [completedTours, hasInitialized, session])

    // Auto-start tour for current page if not completed
    useEffect(() => {
        if (!hasInitialized || activeTour) return

        const tourId = pageTourMap[pathname]
        if (tourId && !completedTours.includes(tourId)) {
            // Small delay to ensure page elements are rendered
            const timer = setTimeout(() => {
                startTour(tourId)
            }, 500)
            return () => clearTimeout(timer)
        }
    }, [pathname, hasInitialized, activeTour, completedTours])

    const startTour = useCallback((tourId: string) => {
        const tour = tours[tourId]
        if (tour) {
            setActiveTour(tour)
            setCurrentStepIndex(0)
        }
    }, [])

    const nextStep = useCallback(() => {
        if (!activeTour) return

        if (currentStepIndex < activeTour.steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1)
        } else {
            // Tour completed
            setCompletedTours(prev => [...prev, activeTour.id])
            setActiveTour(null)
            setCurrentStepIndex(0)
        }
    }, [activeTour, currentStepIndex])

    const prevStep = useCallback(() => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1)
        }
    }, [currentStepIndex])

    const skipTour = useCallback(() => {
        if (activeTour) {
            setCompletedTours(prev => [...prev, activeTour.id])
        }
        setActiveTour(null)
        setCurrentStepIndex(0)
    }, [activeTour])

    const endTour = useCallback(() => {
        setActiveTour(null)
        setCurrentStepIndex(0)
    }, [])

    const isTourCompleted = useCallback((tourId: string) => {
        return completedTours.includes(tourId)
    }, [completedTours])

    const resetTour = useCallback((tourId: string) => {
        setCompletedTours(prev => prev.filter(id => id !== tourId))
    }, [])

    const resetAllTours = useCallback(() => {
        setCompletedTours([])
    }, [])

    const currentStep = activeTour?.steps[currentStepIndex] ?? null

    return (
        <OnboardingContext.Provider
            value={{
                activeTour,
                currentStepIndex,
                currentStep,
                isActive: activeTour !== null,
                startTour,
                nextStep,
                prevStep,
                skipTour,
                endTour,
                completedTours,
                isTourCompleted,
                resetTour,
                resetAllTours,
            }}
        >
            {children}
        </OnboardingContext.Provider>
    )
}

export function useOnboarding() {
    const context = useContext(OnboardingContext)
    if (!context) {
        throw new Error('useOnboarding must be used within an OnboardingProvider')
    }
    return context
}
