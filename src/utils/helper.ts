import wcmatch from 'wildcard-match';

export default {
    getGroupFromId(id: string): string {
        const parts = id?.split('.');
        if (!parts?.[0]) {
            throw new Error('Invalid level');
        }
        return parts[0];
    },
    toCamelCase(str: string): string {
        return str?.replace(/(-.)/g, (x) => {
            return x[1].toUpperCase()
        });
    },
    isMatchWildcard(pattern: string, text: string): boolean {
        return wcmatch(pattern)(text);
    }
}