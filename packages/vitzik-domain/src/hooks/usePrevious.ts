import { useEffect, useRef } from 'react'

/*
    Custom hook that keeps the previous value of a variable.
    Useful when you need to store and reuse the previous value of a state or prop.
*/
export const usePrevious = <T>(value: T): T => {
    const ref = useRef<T>(value)
    useEffect(() => {
        ref.current = value
    })
    return ref.current
}
