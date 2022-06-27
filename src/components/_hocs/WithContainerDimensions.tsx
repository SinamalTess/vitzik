import React, { useRef } from 'react'

interface WithParentDimensionsProps {
    height: number
    width: number
}

export function WithContainerDimensions<P>(
    WrappedComponent: React.ComponentType<P & WithParentDimensionsProps>
) {
    const ComponentWithContainerDimensions = (props: P) => {
        const [dimensions, setDimensions] = React.useState({
            height: window.innerHeight,
            width: window.innerWidth,
        })

        const ref = useRef<HTMLDivElement>(null)

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
        // At this point, the props being passed in are the original props the component expects.
        return (
            <div ref={ref} style={{ height: '100%', width: '100%' }}>
                <WrappedComponent {...props} height={height} width={width} />
            </div>
        )
    }

    return ComponentWithContainerDimensions
}
