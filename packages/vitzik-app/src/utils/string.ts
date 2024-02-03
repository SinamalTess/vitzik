export const isLowerCaseCharacter = (character: string) =>
    // @ts-ignore
    isNaN(character) && character === character.toLowerCase()
