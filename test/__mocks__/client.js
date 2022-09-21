const { JSDOM } = require('jsdom');

const dom = new JSDOM(`...`, { url: "https://example.org/" });

global.document = dom.window.document
global.window = dom.window
global.localStorage = dom.window.localStorage