import TestBase from "../../TestBase";
import {EnvironmentOptions} from "../../../../../src/lib/environment-options";

export default class extends TestBase {
    getDescription() {
        return '"dump" function';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ dump('foo') }}
{{ dump(foo, bar) }}`
        };
    }

    getExpected() {
        return `
string(3) "foo"

string(3) "foo"
string(3) "bar"
`;
    }

    getEnvironmentOptions(): EnvironmentOptions {
        return {
            debug: true,
            autoescape: false
        }
    }

    getContext() {
        return {
            foo: 'foo',
            bar: 'bar'
        }
    }
}
