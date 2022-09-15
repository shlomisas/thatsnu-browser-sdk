export default {
    getItem(key: string) {
        return JSON.parse(localStorage.getItem(key));
    },
    setItem(key: string, data: any) {
        return localStorage.setItem(key, JSON.stringify(data));
    },
    removeItem(key: string) {
        return localStorage.removeItem(key);
    }
};