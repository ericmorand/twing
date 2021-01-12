import * as tape from 'tape';
import {ConstantExpressionNode} from "../../../../../../../../src/lib/node/expression/constant";
import {StartsWithBinaryExpressionNode, type} from "../../../../../../../../src/lib/node/expression/binary/starts-with";
import {MockCompiler} from "../../../../../../../mock/compiler";

tape('node/expression/binary/starts-with', (test) => {
    test.test('constructor', (test) => {
        let left = new ConstantExpressionNode(1, 1, 1);
        let right = new ConstantExpressionNode(2, 1, 1);
        let node = new StartsWithBinaryExpressionNode([left, right], 1, 1);

        test.same(node.getNode('left'), left);
        test.same(node.getNode('right'), right);
        test.same(node.type, type);

        test.end();
    });

    test.test('compile', (test) => {
        let left = new ConstantExpressionNode(1, 1, 1);
        let right = new ConstantExpressionNode(2, 1, 1);
        let node = new StartsWithBinaryExpressionNode([left, right], 1, 1);
        let compiler = new MockCompiler();

        test.same(compiler.compile(node).getSource(), 'await (async () => {let left = 1; let right = 2; return typeof left === \'string\' && typeof right === \'string\' && (right.length < 1 || left.startsWith(right));})()');

        test.end();
    });

    test.end();
});
