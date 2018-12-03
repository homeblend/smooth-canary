/**
 * Helper function to verify if a given set of parameters are defined
 * @param params items to verify if they're defined
 * @returns whether all given parameters are defined
 */
export function isDefined(...params: any[]) {
    if (params instanceof Array) {
        return params.every((item) => {
            return typeof item !== 'undefined' && item !== null;
        });
    } else {
        return typeof params !== 'undefined' && params !== null;
    }
}
