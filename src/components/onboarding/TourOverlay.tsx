'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useOnboarding } from './OnboardingContext'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'

interface TargetRect {
    top: number
    left: number
    width: number
    height: number
}

export function TourOverlay() {
    const {
        isActive,
        currentStep,
        currentStepIndex,
        activeTour,
        nextStep,
        prevStep,
        skipTour,
    } = useOnboarding()

    const [targetRect, setTargetRect] = useState<TargetRect | null>(null)
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })

    const updatePosition = useCallback(() => {
        if (!currentStep || currentStep.position === 'center') {
            setTargetRect(null)
            return
        }

        const element = document.querySelector(currentStep.target)
        if (element) {
            const rect = element.getBoundingClientRect()
            setTargetRect({
                top: rect.top + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
                height: rect.height,
            })

            // Calculate tooltip position based on step.position
            const padding = 16
            const tooltipWidth = 320
            const tooltipHeight = 180

            let top = 0
            let left = 0

            switch (currentStep.position) {
                case 'top':
                    top = rect.top + window.scrollY - tooltipHeight - padding
                    left = rect.left + window.scrollX + (rect.width / 2) - (tooltipWidth / 2)
                    break
                case 'bottom':
                    top = rect.top + window.scrollY + rect.height + padding
                    left = rect.left + window.scrollX + (rect.width / 2) - (tooltipWidth / 2)
                    break
                case 'left':
                    top = rect.top + window.scrollY + (rect.height / 2) - (tooltipHeight / 2)
                    left = rect.left + window.scrollX - tooltipWidth - padding
                    break
                case 'right':
                    top = rect.top + window.scrollY + (rect.height / 2) - (tooltipHeight / 2)
                    left = rect.left + window.scrollX + rect.width + padding
                    break
            }

            // Keep tooltip within viewport
            left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding))
            top = Math.max(padding, top)

            setTooltipPosition({ top, left })
        } else {
            setTargetRect(null)
        }
    }, [currentStep])

    useEffect(() => {
        updatePosition()

        const handleResize = () => updatePosition()
        const handleScroll = () => updatePosition()

        window.addEventListener('resize', handleResize)
        window.addEventListener('scroll', handleScroll)

        return () => {
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('scroll', handleScroll)
        }
    }, [updatePosition])

    // Handle keyboard navigation
    useEffect(() => {
        if (!isActive) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                skipTour()
            } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
                nextStep()
            } else if (e.key === 'ArrowLeft') {
                prevStep()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isActive, nextStep, prevStep, skipTour])

    if (!isActive || !currentStep || !activeTour) return null

    const isFirstStep = currentStepIndex === 0
    const isLastStep = currentStepIndex === activeTour.steps.length - 1
    const isCentered = currentStep.position === 'center'

    return (
        <AnimatePresence>
            <motion.div
                key="tour-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-[9999]"
                style={{ pointerEvents: 'none' }}
            >
                {/* SVG Overlay with cutout for spotlight */}
                <svg
                    className="absolute inset-0 w-full h-full"
                    style={{ pointerEvents: 'auto' }}
                    onClick={skipTour}
                >
                    <defs>
                        <mask id="spotlight-mask">
                            {/* White = visible, Black = hidden */}
                            <rect x="0" y="0" width="100%" height="100%" fill="white" />
                            {targetRect && !isCentered && (
                                <motion.rect
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    x={targetRect.left - 8}
                                    y={targetRect.top - 8}
                                    width={targetRect.width + 16}
                                    height={targetRect.height + 16}
                                    rx="8"
                                    fill="black"
                                />
                            )}
                        </mask>
                    </defs>
                    {/* Dark overlay with mask cutout */}
                    <rect
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                        fill="rgba(0, 0, 0, 0.6)"
                        mask="url(#spotlight-mask)"
                    />
                </svg>

                {/* Spotlight border/ring effect */}
                {targetRect && !isCentered && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="absolute rounded-lg ring-4 ring-blue-500 ring-offset-2 ring-offset-transparent"
                        style={{
                            top: targetRect.top - 8,
                            left: targetRect.left - 8,
                            width: targetRect.width + 16,
                            height: targetRect.height + 16,
                            pointerEvents: 'none',
                        }}
                    />
                )}

                {/* Tooltip */}
                <motion.div
                    key={currentStep.id}
                    initial={{ opacity: 0, y: isCentered ? 20 : 0, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className={`absolute bg-white rounded-2xl shadow-2xl p-6 w-80 ${isCentered ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''
                        }`}
                    style={!isCentered ? { top: tooltipPosition.top, left: tooltipPosition.left, pointerEvents: 'auto' } : { pointerEvents: 'auto' }}
                >
                    {/* Close button */}
                    <button
                        onClick={skipTour}
                        className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Close tour"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {/* Content */}
                    <div className="pr-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {currentStep.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {currentStep.description}
                        </p>
                    </div>

                    {/* Progress and Navigation */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                        {/* Progress dots */}
                        <div className="flex gap-1.5">
                            {activeTour.steps.map((_, index) => (
                                <div
                                    key={index}
                                    className={`w-2 h-2 rounded-full transition-colors ${index === currentStepIndex
                                        ? 'bg-blue-600'
                                        : index < currentStepIndex
                                            ? 'bg-blue-300'
                                            : 'bg-gray-200'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Navigation buttons */}
                        <div className="flex gap-2">
                            {!isFirstStep && (
                                <button
                                    onClick={prevStep}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Back
                                </button>
                            )}
                            <button
                                onClick={nextStep}
                                className="flex items-center gap-1 px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                            >
                                {isLastStep ? 'Finish' : 'Next'}
                                {!isLastStep && <ChevronRight className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
