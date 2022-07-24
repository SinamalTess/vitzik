import React, { useEffect, useRef } from 'react'

interface WithParentDimensionsProps {
    height: number
    width: number
}

/*
    HOC component that passes the "width" and "height" of the parent container to its children as props.
*/
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

        useEffect(() => {
            if (ref.current) {
                setDimensions({
                    height: ref.current.clientHeight,
                    width: ref.current.clientWidth,
                })
            }
        }, [ref])

        useEffect(() => {
            function handleResize() {
                if (ref.current) {
                    setDimensions({
                        height: ref.current.clientHeight,
                        width: ref.current.clientWidth,
                    })
                }
            }

            window.addEventListener('resize', handleResize)

            return function cleanup() {
                window.removeEventListener('resize', handleResize)
            }
        }, [])

        return (
            <div ref={ref} style={{ height: '100%', width: '100%' }}>
                <WrappedComponent {...props} height={height} width={width} />
            </div>
        )
    }

    return ComponentWithContainerDimensions
}
