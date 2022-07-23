export const spaceOutCapitalLetters = (str: string) =>
    str.replace(/([A-Z])/g, " $1").trim();

export const capitalizeFirstLetters = (str: string) => {
    return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });
}