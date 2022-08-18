import React from 'react'
import { IconName, PresentationalComponentBasicProps } from '../../types'
import { Icon } from '../Icon'
import './Link.scss'

interface LinkProps extends PresentationalComponentBasicProps {
    children: string
    href: string
    icon?: IconName
}

const BASE_CLASS = 'link'

export function Link({ href, children, style, icon }: LinkProps) {
    return (
        <a href={href} style={style} target="_blank" rel="noreferrer" className={BASE_CLASS}>
            {icon ? <Icon className={'mg-sm'} name={icon} /> : null}
            {children}
        </a>
    )
}
