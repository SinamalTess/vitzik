export const isEven = (number: number) => number % 2 === 0

export const largestNum = (arr: number[]) =>
    arr.reduce((accValue, currentValue) => Math.max(accValue, currentValue), 0)
