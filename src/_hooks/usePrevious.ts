import { useEffect, useRef } from 'react'

export const usePrevious = <T>(value: T): T | undefined => {
    const ref = useRef()
    useEffect(() => {
        // @ts-ignore
        ref.current = value
    })
    return ref.current
}
