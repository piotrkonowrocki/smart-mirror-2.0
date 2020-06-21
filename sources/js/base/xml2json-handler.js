import xml2js from 'xml2js';

class Xml2jsonHandler {
    parse(xml) {
        return new Promise(resolve => {
            xml2js.parseString(xml, (errXml, result) => {
                resolve(result.rss);
            });
        });
    }
}

const xml2jsonHandler = new Xml2jsonHandler();

export default xml2jsonHandler;
