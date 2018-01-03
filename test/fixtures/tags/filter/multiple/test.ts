import TwingTestCaseIntegration = require("../../../../../src/test-case/integration");

export = class extends TwingTestCaseIntegration {
    getDescription() {
        return '"filter" tags accept multiple chained filters';
    }

    getTemplates() {
        let templates = super.getTemplates();

        templates.set('index.twig', require('./index.twig'));

        return templates;
    }

    getExpected() {
        return require('./expected.html');
    }

    getData() {
        return {
            var: 'VAR'
        }
    }
};