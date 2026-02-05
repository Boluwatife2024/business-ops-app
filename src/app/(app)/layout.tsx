import { ReactNode } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { OnboardingProvider, TourOverlay } from '@/components/onboarding'

export default function AppLayout({ children }: { children: ReactNode }) {
    return (
        <OnboardingProvider>
            <div className="h-screen flex overflow-hidden bg-gray-50">
                <div data-tour="sidebar">
                    <Sidebar />
                </div>
                <div className="flex-1 flex flex-col ml-64">
                    {children}
                </div>
            </div>
            <TourOverlay />
        </OnboardingProvider>
    )
}
