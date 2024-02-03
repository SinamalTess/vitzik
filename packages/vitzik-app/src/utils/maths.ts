export const isEven = (number: number) => number % 2 === 0

export const isPositive = (number: number) => Math.sign(number) >= 0 && !Object.is(number, -0)

export const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max)
