import React from 'react'
import './Loader.scss'

const BASE_CLASS = 'loader'

export function Loader() {
    return (
        <div className={BASE_CLASS}>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
        </div>
    )
}
