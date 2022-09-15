import * as Rusha from 'rusha';

export default {
    parseLevel(id: string) {
        const parts = id?.split('.');

        if (!parts?.[0]) {
            throw new Error('Invalid level');
        }

        return { firstLevel: parts?.[0], secondLevel: parts?.[1], level: id };
    },
    generateColor() {
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += Math.floor(Math.random() * 10);
        }
        return color;
    },
    getSha1(text: string) {
        return Rusha.createHash()
            .update(text)
            .digest('hex');
    }
}