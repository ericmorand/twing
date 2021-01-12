import * as tape from 'tape';
import {ConstantExpressionNode} from "../../../../../../../../src/lib/node/expression/constant";
import {ModuloBinaryExpressionNode, type} from "../../../../../../../../src/lib/node/expression/binary/mod";
import {MockCompiler} from "../../../../../../../mock/compiler";

tape('node/expression/binary/mod', (test) => {
    test.test('constructor', (test) => {
        let left = new ConstantExpressionNode(1, 1, 1);
        let right = new ConstantExpressionNode(2, 1, 1);
        let node = new ModuloBinaryExpressionNode([left, right], 1, 1);

        test.same(node.getNode('left'), left);
        test.same(node.getNode('right'), right);
        test.same(node.type, type);

        test.end();
    });

    test.test('compile', (test) => {
        let left = new ConstantExpressionNode(1, 1, 1);
        let right = new ConstantExpressionNode(2, 1, 1);
        let node = new ModuloBinaryExpressionNode([left, right], 1, 1);
        let compiler = new MockCompiler();

        test.same(compiler.compile(node).getSource(), '(1 % 2)');

        test.end();
    });

    test.end();
});
