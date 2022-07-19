import React, { useEffect, useState } from 'react'

type Element = HTMLElement | React.RefObject<HTMLElement> | null

const isRefObject = (element: Element): element is React.RefObject<HTMLElement> =>
    element !== null && 'current' in element

const isClickInside = (elements: Element[], target: Node) =>
    elements.some((element) => {
        const isRef = isRefObject(element)
        if (isRef) {
            return element.current?.contains(target)
        } else {
            return element?.contains?.(target)
        }
    })

/*
    Custom hook to check if a click is made outside a provided array of elements.
    The listener is only set if the passed condition is true.
*/

export const useClickOutside = (
    elements: Element[],
    callback: Function,
    condition: boolean = true
) => {
    const [listening, setListening] = useState(false)
    const events = ['click', 'touchstart']

    useEffect(() => {
        function onClick(event: Event) {
            const { target } = event
            if (isClickInside(elements, target as Node)) return
            callback()
        }

        function listenForOutsideClicks() {
            events.forEach((eventType) => {
                if (listening) return
                if (elements.every((element) => !element)) return // if all elements are null/undefined we stop here
                setListening(true)
                document.addEventListener(eventType, onClick)
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
