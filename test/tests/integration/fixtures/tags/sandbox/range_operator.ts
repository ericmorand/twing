import TestBase from "../../../TestBase";
import {EnvironmentOptions} from "../../../../../../src/lib/environment-options";

export default class extends TestBase {
    getDescription() {
        return '"sandbox" tag considers the "range" operator as an alias of the "range" function';
    }

    getTemplates() {
        return {
            'index.twig': `
{% sandbox %}
    {% include "foo.twig" %}
{% endsandbox %}
`,
            'foo.twig': `
{{ 1..5 }}
`
        };
    }

    getExpectedErrorMessage(): string {
        return 'TwingSandboxSecurityNotAllowedFunctionError: Function "range" is not allowed in "foo.twig" at line 2.';
    }

    getEnvironmentOptions(): EnvironmentOptions {
        return {
            autoescape: false
        }
    }
}
