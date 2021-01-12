import * as tape from 'tape';
import {ConstantExpressionNode} from "../../../../../../../../src/lib/node/expression/constant";
import {NotEqualBinaryExpressionNode, type} from "../../../../../../../../src/lib/node/expression/binary/not-equal";
import {MockCompiler} from "../../../../../../../mock/compiler";

tape('node/expression/binary/not-equal', (test) => {
    test.test('constructor', (test) => {
        let left = new ConstantExpressionNode(1, 1, 1);
        let right = new ConstantExpressionNode(2, 1, 1);
        let node = new NotEqualBinaryExpressionNode([left, right], 1, 1);

        test.same(node.getNode('left'), left);
        test.same(node.getNode('right'), right);
        test.same(node.type, type);

        test.end();
    });

    test.test('compile', (test) => {
        let left = new ConstantExpressionNode(1, 1, 1);
        let right = new ConstantExpressionNode(2, 1, 1);
        let node = new NotEqualBinaryExpressionNode([left, right], 1, 1);
        let compiler = new MockCompiler();

        test.same(compiler.compile(node).getSource(), '!this.compare(1, 2)');

        test.end();
    });

    test.end();
});
