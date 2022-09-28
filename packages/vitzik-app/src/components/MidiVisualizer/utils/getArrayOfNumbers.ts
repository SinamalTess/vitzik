export const getArrayOfNumbers = (length: number) =>
    Array.apply(null, Array(length)).map((x, i) => i)
