import * as tape from 'tape';
import {TwingNodeExpressionConstant} from "../../../../../../../src/lib/node/expression/constant";
import {TwingNodeExpressionFunction} from "../../../../../../../src/lib/node/expression/function";
import {TwingNode} from "../../../../../../../src/lib/node";
import {MockLoader} from "../../../../../../mock/loader";
import {MockEnvironment} from "../../../../../../mock/environment";
import {TwingFunction} from "../../../../../../../src/lib/function";
import {MockCompiler} from "../../../../../../mock/compiler";

function twig_tests_function_dummy() {
    return Promise.resolve();
}

function twig_tests_function_barbar(arg1: any = null, arg2: any = null, args: any[] = []) {
    return Promise.resolve();
}

function twig_tests_function_needs_source() {
    return Promise.resolve();
}

function createFunction(name: string, args = new Map()) {
    return new TwingNodeExpressionFunction(name, new TwingNode(args), 1, 1);
}

tape('node/expression/function', (test) => {
    test.test('constructor', (test) => {
        let name = 'function';
        let args = new TwingNode();
        let node = new TwingNodeExpressionFunction(name, args, 1, 1);

        test.same(node.getAttribute('name'), name);
        test.same(node.getChild('arguments'), args);

        test.end();
    });

    test.test('compile', (test) => {
        let loader = new MockLoader();
        let environment = new MockEnvironment(loader);
        environment.addFunction(new TwingFunction('foo', twig_tests_function_dummy, [], {}));
        environment.addFunction(new TwingFunction('bar', twig_tests_function_dummy, [], {needs_template: true}));
        environment.addFunction(new TwingFunction('foofoo', twig_tests_function_dummy, [], {needs_context: true}));
        environment.addFunction(new TwingFunction('foobar', twig_tests_function_dummy, [], {
            needs_template: true,
            needs_context: true
        }));
        environment.addFunction(new TwingFunction('barbar', twig_tests_function_barbar, [
            {name: 'arg1', defaultValue: null},
            {name: 'arg2', defaultValue: null}
        ], {is_variadic: true}));
        environment.addFunction(new TwingFunction('anonymous', () => Promise.resolve(), []));
        environment.addFunction(new TwingFunction('needs_source', twig_tests_function_needs_source, [], {
            needs_template: true,
        }));

        let compiler = new MockCompiler(environment);

        test.test('basic', (test) => {
            let node = createFunction('foo');

            test.same(compiler.compile(node).getSource(), 'await this.environment.getFunction(\'foo\').traceableCallable(1, this.source)(...[])');

            node = createFunction('foo', new Map([
                [0, new TwingNodeExpressionConstant('bar', 1, 1)],
                [1, new TwingNodeExpressionConstant('foobar', 1, 1)]
            ]));

            test.same(compiler.compile(node).getSource(), 'await this.environment.getFunction(\'foo\').traceableCallable(1, this.source)(...[\`bar\`, \`foobar\`])');

            node = createFunction('bar');

            test.same(compiler.compile(node).getSource(), 'await this.environment.getFunction(\'bar\').traceableCallable(1, this.source)(...[this])');

            node = createFunction('bar', new Map([
                [0, new TwingNodeExpressionConstant('bar', 1, 1)]
            ]));

            test.same(compiler.compile(node).getSource(), 'await this.environment.getFunction(\'bar\').traceableCallable(1, this.source)(...[this, \`bar\`])');

            node = createFunction('foofoo');

            test.same(compiler.compile(node).getSource(), 'await this.environment.getFunction(\'foofoo\').traceableCallable(1, this.source)(...[context])');

            node = createFunction('foofoo', new Map([
                [0, new TwingNodeExpressionConstant('bar', 1, 1)]
            ]));

            test.same(compiler.compile(node).getSource(), 'await this.environment.getFunction(\'foofoo\').traceableCallable(1, this.source)(...[context, \`bar\`])');

            node = createFunction('foobar');

            test.same(compiler.compile(node).getSource(), 'await this.environment.getFunction(\'foobar\').traceableCallable(1, this.source)(...[this, context])');

            node = createFunction('foobar', new Map([
                [0, new TwingNodeExpressionConstant('bar', 1, 1)]
            ]));

            test.same(compiler.compile(node).getSource(), 'await this.environment.getFunction(\'foobar\').traceableCallable(1, this.source)(...[this, context, \`bar\`])');

            node = createFunction('needs_source');

            test.same(compiler.compile(node).getSource(), 'await this.environment.getFunction(\'needs_source\').traceableCallable(1, this.source)(...[this])');

            test.test('named arguments', (test) => {
                let node = createFunction('date', new Map([
                    ['timezone', new TwingNodeExpressionConstant('America/Chicago', 1, 1)],
                    ['date', new TwingNodeExpressionConstant(0, 1, 1)]
                ]));

                test.same(compiler.compile(node).getSource(), 'await this.environment.getFunction(\'date\').traceableCallable(1, this.source)(...[this, 0, \`America/Chicago\`])');

                test.end();
            });

            test.test('arbitrary named arguments', (test) => {
                let node = createFunction('barbar');

                test.same(compiler.compile(node).getSource(), 'await this.environment.getFunction(\'barbar\').traceableCallable(1, this.source)(...[])');

                node = createFunction('barbar', new Map([
                    ['foo', new TwingNodeExpressionConstant('bar', 1, 1)]
                ]));

                test.same(compiler.compile(node).getSource(), 'await this.environment.getFunction(\'barbar\').traceableCallable(1, this.source)(...[null, null, new Map([[\`foo\`, \`bar\`]])])');

                node = createFunction('barbar', new Map([
                    ['arg2', new TwingNodeExpressionConstant('bar', 1, 1)]
                ]));

                test.same(compiler.compile(node).getSource(), 'await this.environment.getFunction(\'barbar\').traceableCallable(1, this.source)(...[null, \`bar\`])');

                node = createFunction('barbar', new Map<any, any>([
                    [0, new TwingNodeExpressionConstant('1', 1, 1)],
                    [1, new TwingNodeExpressionConstant('2', 1, 1)],
                    [2, new TwingNodeExpressionConstant('3', 1, 1)],
                    ['foo', new TwingNodeExpressionConstant('bar', 1, 1)]
                ]));

                test.same(compiler.compile(node).getSource(), 'await this.environment.getFunction(\'barbar\').traceableCallable(1, this.source)(...[\`1\`, \`2\`, new Map([[0, \`3\`], [\`foo\`, \`bar\`]])])');

                test.end();
            });

            test.test('function as an anonymous function', (test) => {
                let node = createFunction('anonymous', new Map([
                    [0, new TwingNodeExpressionConstant('foo', 1, 1)]
                ]));

                test.same(compiler.compile(node).getSource(), 'await this.environment.getFunction(\'anonymous\').traceableCallable(1, this.source)(...[\`foo\`])');

                test.end();
            });

            test.end();
        });

        test.end();
    });

    test.end();
});
