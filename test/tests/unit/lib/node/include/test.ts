import * as tape from 'tape';
import {ConstantExpressionNode} from "../../../../../../src/lib/node/expression/constant";
import {IncludeNode, type} from "../../../../../../src/lib/node/include";
import {ArrayExpressionNode} from "../../../../../../src/lib/node/expression/array";
import {MockCompiler} from "../../../../../mock/compiler";
import {ConditionalExpressionNode} from "../../../../../../src/lib/node/expression/conditional";
import {HashExpressionNode} from "../../../../../../src/lib/node/expression/hash";

tape('node/include', (test) => {
    test.test('constructor', (test) => {
        let expr = new ConstantExpressionNode('foo.twig', 1, 1);
        let node = new IncludeNode(expr, null, false, false, 1, 1);

        test.false(node.hasNode('variables'));
        test.same(node.getNode('expr'), expr);
        test.false(node.getAttribute('only'));

        let arrayNodes = new Map([
            [0, new ConstantExpressionNode('foo', 1, 1)],
            [1, new ConstantExpressionNode(true, 1, 1)]
        ]);

        let vars = new ArrayExpressionNode(arrayNodes, 1, 1);
        node = new IncludeNode(expr, vars, true, false, 1, 1);

        test.same(node.getNode('variables'), vars);
        test.true(node.getAttribute('only'));
        test.same(node.type, type);
        test.same(node.getLine(), 1);
        test.same(node.getColumn(), 1);

        test.end();
    });

    test.test('compile', (test) => {
        let compiler = new MockCompiler();

        test.test('basic', (test) => {
            let expr = new ConstantExpressionNode('foo.twig', 1, 1);
            let node = new IncludeNode(expr, null, false, false, 1, 1);

            test.same(compiler.compile(node).getSource(), `outputBuffer.echo(await this.include(context, outputBuffer, \`foo.twig\`, undefined, true, false, 1));
`);
            test.end();
        });

        test.test('with condition', (test) => {
            let expr = new ConditionalExpressionNode(
                new ConstantExpressionNode(true, 1, 1),
                new ConstantExpressionNode('foo', 1, 1),
                new ConstantExpressionNode('foo', 1, 1),
                0, 1
            );
            let node = new IncludeNode(expr, null, false, false, 1, 1);

            test.same(compiler.compile(node).getSource(), `outputBuffer.echo(await this.include(context, outputBuffer, ((true) ? (\`foo\`) : (\`foo\`)), undefined, true, false, 1));
`);
            test.end();
        });

        test.test('with variables', (test) => {
            let expr = new ConstantExpressionNode('foo.twig', 1, 1);

            let hashNodes = new Map([
                [0, new ConstantExpressionNode('foo', 1, 1)],
                [1, new ConstantExpressionNode(true, 1, 1)]
            ]);

            let vars = new HashExpressionNode(hashNodes, 1, 1);
            let node = new IncludeNode(expr, vars, false, false, 1, 1);

            test.same(compiler.compile(node).getSource(), `outputBuffer.echo(await this.include(context, outputBuffer, \`foo.twig\`, new Map([[\`foo\`, true]]), true, false, 1));
`);
            test.end();
        });

        test.test('with variables only', (test) => {
            let expr = new ConstantExpressionNode('foo.twig', 1, 1);

            let hashNodes = new Map([
                [0, new ConstantExpressionNode('foo', 1, 1)],
                [1, new ConstantExpressionNode(true, 1, 1)]
            ]);

            let vars = new HashExpressionNode(hashNodes, 1, 1);

            let node = new IncludeNode(expr, vars, true, false, 1, 1);

            test.same(compiler.compile(node).getSource(), `outputBuffer.echo(await this.include(context, outputBuffer, \`foo.twig\`, new Map([[\`foo\`, true]]), false, false, 1));
`);
            test.end();
        });

        test.test('with only and no variables', (test) => {
            let expr = new ConstantExpressionNode('foo.twig', 1, 1);
            let node = new IncludeNode(expr, null, true, false, 1, 1);

            test.same(compiler.compile(node).getSource(), `outputBuffer.echo(await this.include(context, outputBuffer, \`foo.twig\`, undefined, false, false, 1));
`);
            test.end();
        });

        test.test('with ignore missing', (test) => {
            let expr = new ConstantExpressionNode('foo.twig', 1, 1);

            let hashNodes = new Map([
                [0, new ConstantExpressionNode('foo', 1, 1)],
                [1, new ConstantExpressionNode(true, 1, 1)]
            ]);

            let vars = new HashExpressionNode(hashNodes, 1, 1);

            let node = new IncludeNode(expr, vars, true, true, 1, 1);

            test.same(compiler.compile(node).getSource(), `outputBuffer.echo(await this.include(context, outputBuffer, \`foo.twig\`, new Map([[\`foo\`, true]]), false, true, 1));
`);
            test.end();
        });

        test.end();
    });

    test.end();
});
