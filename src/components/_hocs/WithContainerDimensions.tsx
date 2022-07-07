import React, { useEffect, useRef } from 'react'

interface WithParentDimensionsProps {
    height: number
    width: number
}

export function WithContainerDimensions<P>(
    WrappedComponent: React.ComponentType<P & WithParentDimensionsProps>
) {
    const ComponentWithContainerDimensions = (props: P) => {
        const ref = useRef<HTMLDivElement>(null)

        const [dimensions, setDimensions] = React.useState({
            height: 0,
            width: 0,
        })

        const { width, height } = dimensions

        React.useEffect(() => {
            function handleResize() {
                setDimensions({
                    height: ref?.current?.clientHeight ?? 0,
                    width: ref?.current?.clientWidth ?? 0,
                })
            }

            window.addEventListener('resize', handleResize)

            return function cleanup() {
                window.removeEventListener('resize', handleResize)
            }
        }, [])

        useEffect(() => {
            if (ref.current) {
                setDimensions({
                    height: ref.current.clientHeight,
                    width: ref.current.clientWidth,
                })
            }
        }, [ref])

        return (
            <div ref={ref} style={{ height: '100%', width: '100%' }}>
                <WrappedComponent {...props} height={height} width={width} />
            </div>
        )
    }

    return ComponentWithContainerDimensions
}
