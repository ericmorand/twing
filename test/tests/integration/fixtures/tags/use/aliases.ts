import TestBase from "../../../TestBase";

export default class extends TestBase {
    getDescription() {
        return '"use" tag with alias';
    }

    getTemplates() {
        return {
            'blocks.twig': `
{% block content 'foo' %}`,
            'index.twig': `
{% use "blocks.twig" with content as foo %}
{% use "blocks.twig" with content as bar %}

{{ block('foo') }}
{{ block('bar') }}`
        };
    }

    getExpected() {
        return `
foo
foo
`;
    }
}
