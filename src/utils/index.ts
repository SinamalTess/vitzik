/*
Take any input and try its best to convert it to a px value.
For example :
100% --> '100px'
120 --> '120px'
*/

export function formatToPixelValue(input: any) : string { // type 'any' is on purpose here :p
    const numberValue = Number(input);
    const pixelPattern = /^\d*(px)$/; // checks if the value is any number immediately followed by 'px'
    const percentagePattern = /^\d*%$/; // checks if the value is a percentage

    if (pixelPattern.test(input)) {
        return input
    } else if (percentagePattern.test(input)) {
        return input?.replace('%', 'px')
    } else if (!Number.isNaN(numberValue)) {
        return numberValue + 'px';
    } else {
        console.error(`Couldn't convert ${input} of type ${typeof input} to pixel value`);
        return '0px';
    }
}