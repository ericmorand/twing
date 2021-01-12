import * as tape from 'tape';
import {ConstantExpressionNode} from "../../../../../../../src/lib/node/expression/constant";
import {NameExpressionNode} from "../../../../../../../src/lib/node/expression/name";
import {ArrayExpressionNode} from "../../../../../../../src/lib/node/expression/array";
import {GetAttributeExpressionNode} from "../../../../../../../src/lib/node/expression/get-attribute";
import {TwingTemplate} from "../../../../../../../src/lib/template";
import {MockCompiler} from "../../../../../../mock/compiler";

tape('node/expression/get-attribute', (test) => {
    test.test('constructor', (test) => {
        let expr = new NameExpressionNode({value: 'foo'}, 1, 1);
        let attr = new ConstantExpressionNode('bar', 1, 1);
        let args = new ArrayExpressionNode([
            new NameExpressionNode({value: 'foo'}, 1, 1),
            new ConstantExpressionNode('bar', 1, 1)
        ], 1, 1);
        let node = new GetAttributeExpressionNode(expr, attr, args, TwingTemplate.ARRAY_CALL, 1, 1);

        test.same(node.getNode('node'), expr);
        test.same(node.getNode('attribute'), attr);
        test.same(node.getNode('arguments'), args);
        test.same(node.getAttribute('type'), TwingTemplate.ARRAY_CALL);
        test.same(node.getLine(), 1);
        test.same(node.getColumn(), 1);

        test.end();
    });

    test.test('compile', (test) => {
        let compiler = new MockCompiler();

        let expr = new NameExpressionNode({value: 'foo'}, 1, 1);
        let attr = new ConstantExpressionNode('bar', 1, 1);
        let args = new ArrayExpressionNode([], 1, 1);
        let node = new GetAttributeExpressionNode(expr, attr, args, TwingTemplate.ANY_CALL, 1, 1);

        test.same(compiler.compile(node).getSource(), `await this.traceableMethod(this.getAttribute, 1, this.source)(this.environment, (context.has(\`foo\`) ? context.get(\`foo\`) : null), \`bar\`, new Map([]), \`any\`, false, false, false)`);

        node = new GetAttributeExpressionNode(expr, attr, args, TwingTemplate.ARRAY_CALL, 1, 1);

        test.same(compiler.compile(node).getSource(), `await (async () => {let object = (context.has(\`foo\`) ? context.get(\`foo\`) : null); return this.get(object, \`bar\`);})()`);

        args = new ArrayExpressionNode([
            new NameExpressionNode({value: 'foo'}, 1, 1),
            new NameExpressionNode({value: 'bar'}, 1, 1)
        ], 1, 1);
        node = new GetAttributeExpressionNode(expr, attr, args, TwingTemplate.METHOD_CALL, 1, 1);

        test.same(compiler.compile(node).getSource(), `await this.traceableMethod(this.getAttribute, 1, this.source)(this.environment, (context.has(\`foo\`) ? context.get(\`foo\`) : null), \`bar\`, new Map([[0, (context.has(\`foo\`) ? context.get(\`foo\`) : null)], [1, \`bar\`]]), \`method\`, false, false, false)`);

        test.end();
    });

    test.end();
});
