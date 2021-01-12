import * as tape from 'tape';
import {ConstantExpressionNode} from "../../../../../../../src/lib/node/expression/constant";
import {ArrayExpressionNode, type} from "../../../../../../../src/lib/node/expression/array";
import {MockCompiler} from "../../../../../../mock/compiler";

tape('node/expression/array', (test) => {
    test.test('constructor', (test) => {
        let foo = new ConstantExpressionNode('bar', 1, 1);

        let elements = new Map<any, any>([
            [0, new ConstantExpressionNode('foo', 1, 1)],
            [1, foo]
        ]);

        let node = new ArrayExpressionNode(elements, 1, 1);

        test.same(node.getNode(1), foo);
        test.same(node.type, type);
        test.end();
    });

    test.test('compile', (test) => {
        let compiler = new MockCompiler();

        let elements = new Map<any, any>([
            [0, new ConstantExpressionNode(0, 1, 1)],
            [1, new ConstantExpressionNode('bar', 1, 1)],
            [2, new ConstantExpressionNode(1, 1, 1)],
            [3, new ConstantExpressionNode('foo', 1, 1)]
        ]);

        let node = new ArrayExpressionNode(elements, 1, 1);

        test.same(compiler.compile(node).getSource(), 'new Map([[0, \`bar\`], [1, \`foo\`]])');
        test.end();
    });

    test.end();
});
