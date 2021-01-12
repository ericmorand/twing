import TestBase from "../../TestBase";
import {Markup} from "../../../../../src/lib/markup";

export default class extends TestBase {
    getDescription() {
        return '"length" filter';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ string|length }}
{{ markup|length }}`
        };
    }

    getExpected() {
        return `
3
3
`;
    }

    getContext() {
        return {
            string: 'été',
            markup: new Markup('foo', 'UTF-8')
        };
    }
}
