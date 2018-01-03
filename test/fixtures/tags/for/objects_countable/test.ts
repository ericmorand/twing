import TwingTestCaseIntegration = require("../../../../../src/test-case/integration");

let itemsIterator = {
    [Symbol.iterator]: function* () {
        yield ['foo', 'bar'];
        yield ['bar', 'foo'];
    }
};

export = class extends TwingTestCaseIntegration {
    getDescription() {
        return '"for" tag iterates over iterable and countable objects';
    }

    getTemplates() {
        let templates = super.getTemplates();

        templates.set('index.twig', require('./index.twig'));

        return templates;
    }

    getExpected() {
        return `
  * bar
  * 1/0
  * 2/1
  * 1//2

  * foo
  * 2/1
  * 1/0
  * /1/2


  * foo/bar
  * bar/foo

  * foo
  * bar
`;
    }

    getData() {
        return {
            items: itemsIterator
        };
    }
};