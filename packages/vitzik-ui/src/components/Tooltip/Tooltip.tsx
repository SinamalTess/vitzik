import React, { ReactNode, useState } from 'react'
import { usePopper } from 'react-popper'
import './Tooltip.scss'
import clsx from 'clsx'
import { useClickOutside } from '../../hooks/useClickOutside'
import { PresentationalComponentBasicProps } from '../../types'
import { isArrayOfChildren } from '../../utils/isArrayOfChildren'
import { Placement } from '@popperjs/core'

interface TooltipProps extends PresentationalComponentBasicProps {
    children: ReactNode
    arrow?: boolean
    referenceWidth?: boolean
    show?: boolean
    showOnHover?: boolean
    onShow?: () => void
    onHide?: () => void
    placement?: Placement
    offset?: [number, number]
}

const BASE_CLASS = 'tooltip'

export function Tooltip({
    style,
    className,
    children,
    arrow = true,
    referenceWidth = false,
    show = false,
    showOnHover = false,
    onShow = () => {},
    onHide = () => {},
    placement = 'bottom',
    offset = [0, 8],
}: TooltipProps) {
    /*
        We have to use useMemo to define a custom modifier 
        See this : https://popper.js.org/react-popper/v2/faq/

        This custom modifier makes sure that the Tooltip gets the same width as its container (the reference)
    */
    const referenceWidthModifier = React.useMemo(
        () => ({
            name: 'sameWidth',
            enabled: true,
            fn: ({ state }: any) => {
                state.styles.popper.width = `${state.rects.reference.width}px`
            },
            phase: 'beforeWrite',
            requires: ['computeStyles'],
        }),
        []
    )

    const [referenceElement, setReferenceElement] = useState<HTMLSpanElement | null>(null)
    const [popperElement, setPopperElement] = useState<HTMLSpanElement | null>(null)
    const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null)
    const [isOpen, setOpen] = useState(false)
    const isVisible = isOpen || show

    let modifiers = [{ name: 'arrow', options: { element: arrowElement } }]

    if (referenceWidth) {
        // @ts-ignore
        modifiers.push(referenceWidthModifier)
    }

    const { styles, attributes } = usePopper(referenceElement, popperElement, {
        modifiers,
        placement,
    })

    function onClickOutside() {
        onHide()
    }

    useClickOutside([referenceElement], onClickOutside, show)

    if (!isArrayOfChildren(children, Tooltip.name)) return null

    const referenceChild = children[0]
    const tooltipChild = children[1]

    const props = showOnHover
        ? {
              onMouseEnter: () => {
                  setOpen(true)
                  onShow()
              },
              onMouseLeave: () => {
                  setOpen(false)
                  onHide()
              },
          }
        : {}

    const classNames = clsx(BASE_CLASS, { [`${BASE_CLASS}--active`]: isVisible }, className)

    const styleTooltip = {
        ...styles.popper,
        ...{ style },
    }

    return (
        <>
            {React.cloneElement(referenceChild, { ref: setReferenceElement, ...props })}

            {isVisible ? (
                <span
                    className={classNames}
                    role="tooltip"
                    ref={setPopperElement}
                    style={styleTooltip}
                    {...attributes.popper}
                    {...props}
                >
                    <div
                        className={`${BASE_CLASS}__content`}
                        style={{ margin: `${offset[1]}px ${offset[0]}px` }}
                    >
                        {arrow ? (
                            <div
                                ref={setArrowElement}
                                style={styles.arrow}
                                className={`${BASE_CLASS}__arrow`}
                            />
                        ) : null}
                        {tooltipChild}
                    </div>
                </span>
            ) : null}
        </>
    )
}
