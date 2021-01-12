import * as tape from 'tape';
import * as sinon from 'sinon';

import {Token, TokenType} from "twig-lexer";
import {TwingEnvironment} from "../../../src/lib/environment";
import {TokenParser} from "../../../src/lib/token-parser";
import {PrintNode} from "../../../src/lib/node/print";
import {ConstantExpressionNode} from "../../../src/lib/node/expression/constant";
import {TwingExtension} from "../../../src/lib/extension";
import {Filter} from "../../../src/lib/filter";
import {Function} from "../../../src/lib/function";
import {Test} from "../../../src/lib/test";
import {SandboxSecurityPolicy} from "../../../src/lib/sandbox/security-policy";
import {ArrayLoader} from "../../../src/lib/loader/array";
import {escape} from "../../../src/lib/extension/core/filters/escape";
import {TwingEnvironmentOptions} from "../../../src/lib/environment-options";
import {LoaderInterface} from "../../../src/lib/loader-interface";
import {Template} from "../../../src/lib/template";
import {OutputBuffer} from "../../../src/lib/output-buffer";

class TwingTestTokenParserSection extends TokenParser {
    parse(token: Token) {
        this.parser.getStream().expect(TokenType.TAG_END);

        return new PrintNode(new ConstantExpressionNode('§', -1, -1), -1, -1);
    }

    getTag() {
        return '§';
    }
}

class TwingTestExtension extends TwingExtension {
    static staticCall(value: string) {
        return Promise.resolve(`*${value}*`);
    }

    static __callStatic(method: string, ...arguments_: any[]) {
        if (method !== 'magicStaticCall') {
            throw new Error('Unexpected call to __callStatic');
        }

        return Promise.resolve('static_magic_' + arguments_[0]);
    }

    getTokenParsers() {
        return [
            new TwingTestTokenParserSection()
        ];
    }

    getFilters() {
        return [
            new Filter('escape_and_nl2br', escape_and_nl2br, [], {
                needsTemplate: true,
                isSafe: ['html']
            }),
            // name this filter "nl2br_" to allow the core "nl2br" filter to be tested
            new Filter('nl2br_', nl2br, [], {'preEscape': 'html', 'isSafe': ['html']}),
            new Filter('§', this.sectionFilter, []),
            new Filter('escape_something', escape_something, [], {'isSafe': ['something']}),
            new Filter('preserves_safety', preserves_safety, [], {'preservesSafety': ['html']}),
            new Filter('static_call_string', TwingTestExtension.staticCall, []),
            new Filter('static_call_array', TwingTestExtension.staticCall, []),
            new Filter('magic_call_string', function () {
                return TwingTestExtension.__callStatic('magicStaticCall', arguments);
            }, []),
            new Filter('magic_call_array', function () {
                return TwingTestExtension.__callStatic('magicStaticCall', arguments);
            }, []),
            new Filter('*_path', dynamic_path, []),
            new Filter('*_foo_*_bar', dynamic_foo, []),
            new Filter('anon_foo', function (name: string) {
                return Promise.resolve('*' + name + '*');
            }, []),
        ];
    }

    getFunctions() {
        return [
            new Function('§', this.sectionFunction, []),
            new Function('safe_br', this.br, [], {'isSafe': ['html']}),
            new Function('unsafe_br', this.br, []),
            new Function('static_call_string', TwingTestExtension.staticCall, []),
            new Function('static_call_array', TwingTestExtension.staticCall, []),
            new Function('*_path', dynamic_path, []),
            new Function('*_foo_*_bar', dynamic_foo, []),
            new Function('anon_foo', function (name: string) {
                return Promise.resolve('*' + name + '*');
            }, []),
            new Function('createObject', function (attributes: Map<string, any>) {
                const object: {[p: string]: any} = {};

                for (let [key, value] of attributes) {
                    object[key] = value;
                }

                return Promise.resolve(object);
            }, []),
            new Function('getMacro', function (template: Template, outputBuffer: OutputBuffer, name: string) {
                return template.getMacro(name).then((macroHandler) => {
                    return (...args: Array<any>) => macroHandler(outputBuffer, ...args);
                });
            }, [], {
                needsTemplate: true,
                needsOutputBuffer: true
            }),
        ];
    }

    getTests() {
        return [
            new Test('multi word', this.is_multi_word, []),
            new Test('test_*', this.dynamic_test, [])
        ];
    }

    sectionFilter(value: string) {
        return Promise.resolve(`§${value}§`);
    }

    sectionFunction(value: string) {
        return Promise.resolve(`§${value}§`);
    }

    br() {
        return Promise.resolve('<br />');
    }

    is_multi_word(value: string) {
        return Promise.resolve(value.indexOf(' ') > -1);
    }

    dynamic_test(element: any, item: any) {
        return Promise.resolve(element === item);
    }
}

type EnvironmentConstructor = new (l: LoaderInterface, o: TwingEnvironmentOptions) => TwingEnvironment;

export default abstract class {
    private _env: TwingEnvironment;
    private readonly _environmentConstructor: EnvironmentConstructor;
    private readonly _name: string;

    constructor(environmentConstructor: EnvironmentConstructor, name: string) {
        this._environmentConstructor = environmentConstructor;
        this._name = name;
    }

    protected get env() {
        return this._env;
    }

    setEnvironment(env: TwingEnvironment) {
        this._env = env;
    }

    getSandboxSecurityPolicyFilters(): string[] {
        return [];
    }

    getSandboxSecurityPolicyFunctions(): string[] {
        return [];
    }

    getSandboxSecurityPolicyTags(): string[] {
        return [];
    }

    getDescription(): string {
        return '<no description provided>';
    }

    getTemplates(): { [k: string]: string } {
        return {};
    }

    getExpected(): string {
        return '';
    }

    getGlobals(): { [k: string]: string } {
        return {};
    }

    getContext(): any {
        return {};
    }

    getEnvironmentOptions(): TwingEnvironmentOptions {
        return {};
    }

    getExpectedErrorMessage(): string {
        return null;
    }

    getExpectedDeprecationMessages(): string[] {
        return null;
    }

    async run(): Promise<void> {
        tape(`${this._name}`, async (test) => {
            // templates
            let templates = this.getTemplates();

            // options
            let loader = new ArrayLoader(templates);
            let environment = new this._environmentConstructor(loader, Object.assign({}, {
                cache: false,
                debug: false,
                sandbox_policy: new SandboxSecurityPolicy(this.getSandboxSecurityPolicyTags(), this.getSandboxSecurityPolicyFilters(), new Map(), new Map(), this.getSandboxSecurityPolicyFunctions()),
                strict_variables: true
            } as TwingEnvironmentOptions, this.getEnvironmentOptions()));

            environment.addExtension(new TwingTestExtension(), 'TwingTestExtension');

            this.setEnvironment(environment);

            // globals
            let globals = this.getGlobals();

            for (let key in this.getGlobals()) {
                this.env.addGlobal(key, globals[key]);
            }

            this.env.addGlobal('global', 'global');

            let context = await this.getContext();
            let expected = this.getExpected();
            let expectedErrorMessage = this.getExpectedErrorMessage();
            let expectedDeprecationMessages = this.getExpectedDeprecationMessages();
            let consoleStub = null;
            let consoleData: string[] = [];

            if (expectedDeprecationMessages) {
                consoleStub = sinon.stub(console, 'warn').callsFake((data: string, ...args: any[]) => {
                    consoleData.push(data);
                });
            }

            if (!expectedErrorMessage) {
                try {
                    let actual = await this.env.render('index.twig', context);

                    test.same(actual.trim(), expected.trim(), `${this.getDescription()} renders as expected`);

                    if (consoleStub) {
                        consoleStub.restore();

                        test.same(consoleData, expectedDeprecationMessages, `${this.getDescription()} outputs deprecation warnings`);
                    }
                } catch (e) {
                    console.error(e);

                    test.fail(`${this.getDescription()} should not throw an error (${e})`);
                }
            } else {
                try {
                    await this.env.render('index.twig', context);

                    test.fail(`${this.getDescription()} should throw an error`);
                } catch (e) {
                    test.same(e.toString(), expectedErrorMessage, `${this.getDescription()} throws error`);
                }
            }

            test.end();
        });
    }
}

/**
 * nl2br which also escapes, for testing escaper filters.
 */
function escape_and_nl2br(template: Template, value: string, sep = '<br />') {
    return escape(template, value, 'html').then((result) => {
        return nl2br(result, sep);
    });
}

/**
 * nl2br only, for testing filters with pre_escape.
 */
function nl2br(value: string, sep = '<br />') {
    return Promise.resolve(value.replace('\n', `${sep}\n`));
}

function escape_something(value: string) {
    return Promise.resolve(value.toUpperCase());
}

function preserves_safety(value: string) {
    return Promise.resolve(value.toUpperCase());
}

function dynamic_path(element: string, item: string) {
    return Promise.resolve(element + '/' + item);
}

function dynamic_foo(foo: string, bar: string, item: string) {
    return Promise.resolve(foo + '/' + bar + '/' + item);
}
