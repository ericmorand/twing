import * as tape from 'tape';
import {ConstantExpressionNode} from "../../../../../../src/lib/node/expression/constant";
import {PrintNode, type} from "../../../../../../src/lib/node/print";
import {MockCompiler} from "../../../../../mock/compiler";

tape('node/print', (test) => {
    test.test('constructor', (test) => {
        let expr = new ConstantExpressionNode('foo', 1, 1);
        let node = new PrintNode(expr, 1, 1);

        test.same(node.getNode('expr'), expr);
        test.same(node.type, type);
        test.same(node.getLine(), 1);
        test.same(node.getColumn(), 1);

        test.end();
    });

    test.test('compile', (test) => {
        let node = new PrintNode(new ConstantExpressionNode('foo', 1, 1), 1, 1);
        let compiler = new MockCompiler();

        test.same(compiler.compile(node).getSource(), `outputBuffer.echo(\`foo\`);
`);

        test.end();
    });

    test.end();
});
