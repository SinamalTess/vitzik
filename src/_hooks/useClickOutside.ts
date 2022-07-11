import React, { useEffect, useState } from 'react'

const isRefObject = (
    element: React.RefObject<HTMLElement> | HTMLElement | null
): element is React.RefObject<HTMLElement> => element !== null && 'current' in element

export const useClickOutside = (
    elements: (React.RefObject<HTMLElement> | HTMLElement | null)[],
    callback: Function,
    condition: boolean = true
) => {
    const [listening, setListening] = useState(false)
    const events = ['click', 'touchstart']

    useEffect(() => {
        function onClick(event: Event) {
            const { target } = event
            const isInsideClick = elements.some((element) => {
                const isRef = isRefObject(element)
                if (isRef) {
                    return element.current?.contains(target as Node)
                } else {
                    return element?.contains?.(target as Node)
                }
            })
            if (isInsideClick) return
            callback()
        }

        function listenForOutsideClicks() {
            events.forEach((type) => {
                if (listening) return
                if (elements.every((element) => !element)) return
                setListening(true)
                document.addEventListener(type, onClick)
            })
        }

        if (condition) {
            listenForOutsideClicks()
        }

        return function cleanup() {
            events.forEach((type) => {
                document.removeEventListener(type, onClick)
            })
            setListening(false)
        }
    }, [condition])
}
