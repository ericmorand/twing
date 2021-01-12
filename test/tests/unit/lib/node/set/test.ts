import * as tape from 'tape';
import {ConstantExpressionNode} from "../../../../../../src/lib/node/expression/constant";
import {AssignNameExpressionNode} from "../../../../../../src/lib/node/expression/assign-name";
import {Node} from "../../../../../../src/lib/node";
import {SetNode, type} from "../../../../../../src/lib/node/set";
import {MockCompiler} from "../../../../../mock/compiler";
import {PrintNode} from "../../../../../../src/lib/node/print";
import {TextNode} from "../../../../../../src/lib/node/text";

tape('node/set', (test) => {
    test.test('constructor', (test) => {
        let namesNodes = new Map([
            [0, new AssignNameExpressionNode('foo', 1, 1)]
        ]);

        let namesNode = new Node(namesNodes, new Map(), 1, 1);

        let valuesNodes = new Map([
            [0, new ConstantExpressionNode('foo', 1, 1)]
        ]);

        let valuesNode = new Node(valuesNodes, new Map(), 1, 1);

        let node = new SetNode(false, namesNode, valuesNode, 1, 1);

        test.same(node.getNode('names'), namesNode);
        test.same(node.getNode('values'), valuesNode);
        test.false(node.getAttribute('capture'));
        test.same(node.type, type);
        test.same(node.getLine(), 1);
        test.same(node.getColumn(), 1);

        test.end();
    });

    test.test('compile', (test) => {
        let compiler = new MockCompiler();

        test.test('basic', (test) => {
            let namesNodes = new Map([
                [0, new AssignNameExpressionNode('foo', 1, 1)]
            ]);

            let namesNode = new Node(namesNodes, new Map(), 1, 1);

            let valuesNodes = new Map([
                [0, new ConstantExpressionNode('foo', 1, 1)]
            ]);

            let valuesNode = new Node(valuesNodes, new Map(), 1, 1);

            let node = new SetNode(false, namesNode, valuesNode, 1, 1);

            test.same(compiler.compile(node).getSource(), `context.proxy[\`foo\`] = \`foo\`;
`);

            test.end();
        });

        test.test('with capture', (test) => {
            let namesNodes = new Map([
                [0, new AssignNameExpressionNode('foo', 1, 1)]
            ]);

            let namesNode = new Node(namesNodes, new Map(), 1, 1);

            let valuesNodes = new Map([
                [0, new PrintNode(new ConstantExpressionNode('foo', 1, 1), 1, 1)]
            ]);

            let valuesNode = new Node(valuesNodes, new Map(), 1, 1);

            let node = new SetNode(true, namesNode, valuesNode, 1, 1);

            test.same(compiler.compile(node).getSource(), `outputBuffer.start();
outputBuffer.echo(\`foo\`);
context.proxy[\`foo\`] = (() => {let tmp = outputBuffer.getAndClean(); return tmp === '' ? '' : new this.Markup(tmp, this.environment.getCharset());})();
`);

            test.end();
        });

        test.test('with capture and text', (test) => {
            let namesNodes = new Map([
                [0, new AssignNameExpressionNode('foo', 1, 1)]
            ]);

            let namesNode = new Node(namesNodes, new Map(), 1, 1);
            let valuesNode = new TextNode('foo', 1, 1);

            let node = new SetNode(true, namesNode, valuesNode, 1, 1);

            test.same(compiler.compile(node).getSource(), `context.proxy[\`foo\`] = await (async () => {let tmp = \`foo\`; return tmp === '' ? '' : new this.Markup(tmp, this.environment.getCharset());})();
`);

            test.end();
        });

        test.test('with multiple names and values', (test) => {
            let namesNodes = new Map([
                [0, new AssignNameExpressionNode('foo', 1, 1)],
                [1, new AssignNameExpressionNode('bar', 1, 1)]
            ]);

            let namesNode = new Node(namesNodes, new Map(), 1, 1);

            let valuesNodes = new Map([
                [0, new ConstantExpressionNode('foo', 1, 1)],
                [1, new ConstantExpressionNode('bar', 1, 1)]
            ]);

            let valuesNode = new Node(valuesNodes, new Map(), 1, 1);

            let node = new SetNode(false, namesNode, valuesNode, 1, 1);

            test.same(compiler.compile(node).getSource(), `[context.proxy[\`foo\`], context.proxy[\`bar\`]] = [\`foo\`, \`bar\`];
`);

            test.end();
        });

        test.end();
    });

    test.end();
});
