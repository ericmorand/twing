import * as tape from 'tape';
import {ConstantExpressionNode} from "../../../../../../../src/lib/node/expression/constant";
import {Node} from "../../../../../../../src/lib/node";
import {FilterExpressionNode} from "../../../../../../../src/lib/node/expression/filter";
import {MockLoader} from "../../../../../../mock/loader";
import {MockCompiler} from "../../../../../../mock/compiler";
import {Filter} from "../../../../../../../src/lib/filter";
import {MockEnvironment} from "../../../../../../mock/environment";

function twig_tests_filter_dummy() {
    return Promise.resolve();
}

function twig_tests_filter_barbar(context: any, string: string, arg1: any = null, arg2: any = null, args: any[] = []) {
    return Promise.resolve();
}

function createFilter(node: Node, name: string, args: Map<any, any> = new Map()) {
    let nameNode = new ConstantExpressionNode(name, 1, 1);
    let argumentsNode = new Node(args);

    return new FilterExpressionNode(node, nameNode, argumentsNode, 1, 1);
}

tape('node/expression/filter', (test) => {
    test.test('constructor', (test) => {
        let expr = new ConstantExpressionNode('foo', 1, 1);
        let name = new ConstantExpressionNode('upper', 1, 1);
        let args = new Node();
        let node = new FilterExpressionNode(expr, name, args, 1, 1);

        test.same(node.getNode('node'), expr);
        test.same(node.getNode('filter'), name);
        test.same(node.getNode('arguments'), args);

        test.end();
    });

    test.test('compile', (test) => {
        let loader = new MockLoader();
        let environment = new MockEnvironment(loader);

        environment.addFilter(new Filter('bar', twig_tests_filter_dummy, [], {needsTemplate: true}));
        environment.addFilter(new Filter('barbar', twig_tests_filter_barbar, [
            {name: 'arg1', defaultValue: null},
            {name: 'arg2', defaultValue: null}
        ], {
            needsContext: true,
            isVariadic: true
        }));
        environment.addFilter(new Filter('anonymous', () => Promise.resolve(), []));

        let compiler = new MockCompiler(environment);

        test.test('basic', (test) => {
            let expr = new ConstantExpressionNode('foo', 1, 1);
            let node = createFilter(expr, 'upper');

            let argsNodes = new Map([
                [0, new ConstantExpressionNode(2, 1, 1)],
                [1, new ConstantExpressionNode('.', 1, 1)],
                [2, new ConstantExpressionNode(',', 1, 1)]
            ]);

            node = createFilter(node, 'number_format', argsNodes);

            test.same(compiler.compile(node).getSource(), 'await this.environment.getFilter(\'number_format\').traceableCallable(1, this.source)(...[this, await this.environment.getFilter(\'upper\').traceableCallable(1, this.source)(...[\`foo\`]), 2, \`.\`, \`,\`])');

            test.end();
        });

        test.test('named arguments', (test) => {
            let date = new ConstantExpressionNode(0, 1, 1);
            let node = createFilter(date, 'date', new Map([
                ['timezone', new ConstantExpressionNode('America/Chicago', 1, 1)],
                ['format', new ConstantExpressionNode('d/m/Y H:i:s P', 1, 1)]
            ]));

            test.same(compiler.compile(node).getSource(), 'await this.environment.getFilter(\'date\').traceableCallable(1, this.source)(...[this, 0, \`d/m/Y H:i:s P\`, \`America/Chicago\`])');

            test.end();
        });

        test.test('skip an optional argument', (test) => {
            let date = new ConstantExpressionNode(0, 1, 1);
            let node = createFilter(date, 'date', new Map([
                ['timezone', new ConstantExpressionNode('America/Chicago', 1, 1)]
            ]));

            test.same(compiler.compile(node).getSource(), 'await this.environment.getFilter(\'date\').traceableCallable(1, this.source)(...[this, 0, null, \`America/Chicago\`])');

            test.end();
        });

        test.test('underscores vs camelCase for named arguments', (test) => {
            let string = new ConstantExpressionNode('abc', 1, 1);
            let node = createFilter(string, 'reverse', new Map([
                ['preserve_keys', new ConstantExpressionNode(true, 1, 1)]
            ]));

            test.same(compiler.compile(node).getSource(), 'await this.environment.getFilter(\'reverse\').traceableCallable(1, this.source)(...[\`abc\`, true])');

            string = new ConstantExpressionNode('abc', 1, 1);
            node = createFilter(string, 'reverse', new Map([
                ['preserveKeys', new ConstantExpressionNode(true, 1, 1)]
            ]));

            test.same(compiler.compile(node).getSource(), 'await this.environment.getFilter(\'reverse\').traceableCallable(1, this.source)(...[\`abc\`, true])');

            test.end();
        });

        test.test('filter as an anonymous function', (test) => {
            let node = createFilter(new ConstantExpressionNode('foo', 1, 1), 'anonymous');

            test.same(compiler.compile(node).getSource(), 'await this.environment.getFilter(\'anonymous\').traceableCallable(1, this.source)(...[\`foo\`])');

            test.end();
        });

        test.test('needs environment', (test) => {
            let string = new ConstantExpressionNode('abc', 1, 1);
            let node = createFilter(string, 'bar');

            test.same(compiler.compile(node).getSource(), 'await this.environment.getFilter(\'bar\').traceableCallable(1, this.source)(...[this, \`abc\`])');

            let argsNodes = new Map([
                [0, new ConstantExpressionNode('bar', 1, 1)]
            ]);

            node = createFilter(string, 'bar', argsNodes);

            test.same(compiler.compile(node).getSource(), 'await this.environment.getFilter(\'bar\').traceableCallable(1, this.source)(...[this, \`abc\`, \`bar\`])');

            test.end();
        });

        test.test('arbitrary named arguments', (test) => {
            let string = new ConstantExpressionNode('abc', 1, 1);
            let node = createFilter(string, 'barbar');

            test.same(compiler.compile(node).getSource(), 'await this.environment.getFilter(\'barbar\').traceableCallable(1, this.source)(...[context, \`abc\`])');

            node = createFilter(string, 'barbar', new Map([['foo', new ConstantExpressionNode('bar', 1, 1)]]));

            test.same(compiler.compile(node).getSource(), 'await this.environment.getFilter(\'barbar\').traceableCallable(1, this.source)(...[context, \`abc\`, null, null, new Map([[\`foo\`, \`bar\`]])])');

            node = createFilter(string, 'barbar', new Map([['arg2', new ConstantExpressionNode('bar', 1, 1)]]));

            test.same(compiler.compile(node).getSource(), 'await this.environment.getFilter(\'barbar\').traceableCallable(1, this.source)(...[context, \`abc\`, null, \`bar\`])');

            node = createFilter(string, 'barbar', new Map<any, any>([
                [0, new ConstantExpressionNode('1', 1, 1)],
                [1, new ConstantExpressionNode('2', 1, 1)],
                [2, new ConstantExpressionNode('3', 1, 1)],
                ['foo', new ConstantExpressionNode('bar', 1, 1)]
            ]));

            test.same(compiler.compile(node).getSource(), 'await this.environment.getFilter(\'barbar\').traceableCallable(1, this.source)(...[context, \`abc\`, \`1\`, \`2\`, new Map([[0, \`3\`], [\`foo\`, \`bar\`]])])');

            test.end();
        });

        test.test('compileWithWrongNamedArgumentName', (test) => {
            let value = new ConstantExpressionNode(0, 1, 1);
            let node = createFilter(value, 'date', new Map([
                ['foobar', new ConstantExpressionNode('America/Chicago', 1, 1)]
            ]));

            try {
                compiler.compile(node);

                test.fail();
            } catch (e) {
                test.same(e.message, 'Unknown argument "foobar" for filter "date(format, timezone)" at line 1.');
            }

            test.end();
        });

        test.test('compileWithMissingNamedArgument', (test) => {
            let value = new ConstantExpressionNode(0, 1, 1);
            let node = createFilter(value, 'replace', new Map([
                ['to', new ConstantExpressionNode('foo', 1, 1)]
            ]));

            try {
                compiler.compile(node);

                test.fail();
            } catch (e) {
                test.same(e.message, 'Value for argument "from" is required for filter "replace" at line 1.');
            }

            test.end();
        });

        test.end();
    });

    test.end();
});
