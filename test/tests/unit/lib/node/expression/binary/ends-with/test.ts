import * as tape from 'tape';
import {ConstantExpressionNode} from "../../../../../../../../src/lib/node/expression/constant";
import {EndsWithBinaryExpressionNode, type} from "../../../../../../../../src/lib/node/expression/binary/ends-with";
import {MockCompiler} from "../../../../../../../mock/compiler";

tape('node/expression/binary/ends-with', (test) => {
    test.test('constructor', (test) => {
        let left = new ConstantExpressionNode(1, 1, 1);
        let right = new ConstantExpressionNode(2, 1, 1);
        let node = new EndsWithBinaryExpressionNode([left, right], 1, 1);

        test.same(node.getNode('left'), left);
        test.same(node.getNode('right'), right);
        test.same(node.type, type);

        test.end();
    });

    test.test('compile', (test) => {
        let left = new ConstantExpressionNode(1, 1, 1);
        let right = new ConstantExpressionNode(2, 1, 1);
        let node = new EndsWithBinaryExpressionNode([left, right], 1, 1);
        let compiler = new MockCompiler();

        test.same(compiler.compile(node).getSource(), 'await (async () => {let left = 1; let right = 2; return typeof left === \'string\' && typeof right === \'string\' && (right.length < 1 || left.endsWith(right));})()');

        test.end();
    });

    test.end();
});
