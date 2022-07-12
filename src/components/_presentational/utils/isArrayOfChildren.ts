import { ReactElement, ReactNode } from 'react'

export const isArrayOfChildren = (
    children: ReactNode,
    componentName: string
): children is ReactElement[] => {
    if (!children) {
        console.error(`<${componentName}> was not passed any children`)
        return false
    }
    if (!Array.isArray(children)) {
        console.error(`<${componentName}> expected an array of children`)
        return false
    }
    return true
}
