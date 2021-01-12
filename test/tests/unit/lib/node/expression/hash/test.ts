import * as tape from 'tape';
import {ConstantExpressionNode} from "../../../../../../../src/lib/node/expression/constant";
import {HashExpressionNode} from "../../../../../../../src/lib/node/expression/hash";
import {MockCompiler} from "../../../../../../mock/compiler";

tape('node/expression/hash', (test) => {
    test.test('constructor', (test) => {
        let barNode = new ConstantExpressionNode('bar', 1, 1);

        let elements = new Map([
            ['0', new ConstantExpressionNode('foo', 1, 1)],
            ['1', barNode]
        ]);

        let node = new HashExpressionNode(elements, 1, 1);

        test.same(node.getNode('1'), barNode);
        test.same(node.getLine(), 1);
        test.same(node.getColumn(), 1);

        test.end();
    });

    test.test('compile', (test) => {
        let compiler = new MockCompiler();

        let elements = new Map([
            ['0', new ConstantExpressionNode('foo', 1, 1)],
            ['1', new ConstantExpressionNode('bar', 1, 1)],
            ['2', new ConstantExpressionNode('bar', 1, 1)],
            ['3', new ConstantExpressionNode('foo', 1, 1)]
        ]);

        let node = new HashExpressionNode(elements, 1, 1);

        test.same(compiler.compile(node).getSource(), 'new Map([[\`foo\`, \`bar\`], [\`bar\`, \`foo\`]])');

        test.end();
    });

    test.end();
});
