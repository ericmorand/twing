import TestBase from "../../../TestBase";
import {EnvironmentOptions} from "../../../../../../src/lib/environment-options";

export default class extends TestBase {
    getDescription() {
        return '"macro" tag';
    }

    getTemplates() {
        return {
            'index.twig': `
{% import _self as macros %}

{{ macros.input('username') }}
{{ macros.input('password', null, 'password', 1) }}

{% macro input(name, value, type, size) %}
  <input type="{{ type|default("text") }}" name="{{ name }}" value="{{ value|e|default('') }}" size="{{ size|default(20) }}">
{% endmacro %}`
        };
    }

    getExpected() {
        return `
  <input type="text" name="username" value="" size="20">

  <input type="password" name="password" value="" size="1">
`;
    }

    getEnvironmentOptions(): EnvironmentOptions {
        return {
            cache: 'tmp/test/tags/macro/basic'
        };
    }
}
