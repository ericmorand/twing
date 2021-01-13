import TestBase from "../../TestBase";
import {EnvironmentOptions} from "../../../../../src/lib/environment-options";

export default class extends TestBase {
    getDescription() {
        return '"join" filter on undefined variable';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ foo|join(', ') }}
`
        };
    }

    getExpected() {
        return `
`;
    }

    getEnvironmentOptions(): EnvironmentOptions {
        return {
            strict_variables: false
        };
    }
}
