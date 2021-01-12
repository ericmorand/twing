import * as tape from 'tape';
import {ConstantExpressionNode} from "../../../../../../../src/lib/node/expression/constant";
import {TestExpressionNode, type} from "../../../../../../../src/lib/node/expression/test";
import {Node} from "../../../../../../../src/lib/node";
import {MockLoader} from "../../../../../../mock/loader";
import {MockEnvironment} from "../../../../../../mock/environment";
import {Test} from "../../../../../../../src/lib/test";
import {MockCompiler} from "../../../../../../mock/compiler";

function twig_tests_test_barbar(string: string, arg1: any = null, arg2: any = null, args: any[] = []) {
    return Promise.resolve(true);
}

function createTest(node: Node, name: string, args: Map<any, any> = new Map()) {
    return new TestExpressionNode(node, name, new Node(args), 1, 1);
}

tape('node/expression/test', (test) => {
    test.test('constructor', (test) => {
        let expr = new ConstantExpressionNode('foo', 1, 1);
        let name = new ConstantExpressionNode('null', 1, 1);
        let args = new Node();
        let node = new TestExpressionNode(expr, name, args, 1, 1);

        test.same(node.getNode('node'), expr);
        test.same(node.getNode('arguments'), args);
        test.same(node.getAttribute('name'), name);
        test.same(node.type, type);

        test.end();
    });

    test.test('compile', (test) => {
        let loader = new MockLoader();
        let environment = new MockEnvironment(loader);

        environment.addTest(new Test('barbar', twig_tests_test_barbar, [
            {name: 'arg1', defaultValue: null},
            {name: 'arg2', defaultValue: null}
        ], {
            isVariadic: true,
            needsContext: true
        }));
        environment.addTest(new Test('anonymous', () => Promise.resolve(true), []));

        let compiler = new MockCompiler(environment);

        test.test('test as an anonymous function', (test) => {
            let node = createTest(new ConstantExpressionNode('foo', 1, 1), 'anonymous', new Map([
                [0, new ConstantExpressionNode('foo', 1, 1)]
            ]));

            test.same(compiler.compile(node).getSource(), 'await this.environment.getTest(\'anonymous\').traceableCallable(1, this.source)(...[\`foo\`, \`foo\`])');

            test.end();
        });

        test.test('arbitrary named arguments', (test) => {
            let string = new ConstantExpressionNode('abc', 1, 1);

            let node = createTest(string, 'barbar');

            test.same(compiler.compile(node).getSource(), 'await this.environment.getTest(\'barbar\').traceableCallable(1, this.source)(...[\`abc\`])');

            node = createTest(string, 'barbar', new Map([
                ['foo', new ConstantExpressionNode('bar', 1, 1)]
            ]));

            test.same(compiler.compile(node).getSource(), 'await this.environment.getTest(\'barbar\').traceableCallable(1, this.source)(...[\`abc\`, null, null, new Map([[\`foo\`, \`bar\`]])])');

            node = createTest(string, 'barbar', new Map<any, Node>([
                [0, new ConstantExpressionNode('1', 1, 1)],
                [1, new ConstantExpressionNode('2', 1, 1)],
                [2, new ConstantExpressionNode('3', 1, 1)],
                ['foo', new ConstantExpressionNode('bar', 1, 1)]
            ]));

            test.same(compiler.compile(node).getSource(), 'await this.environment.getTest(\'barbar\').traceableCallable(1, this.source)(...[\`abc\`, \`1\`, \`2\`, new Map([[0, \`3\`], [\`foo\`, \`bar\`]])])');

            test.end();
        });

        test.end();
    });

    test.end();
});
