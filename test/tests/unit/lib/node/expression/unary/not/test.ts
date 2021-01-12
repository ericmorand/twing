import * as tape from 'tape';
import {ConstantExpressionNode} from "../../../../../../../../src/lib/node/expression/constant";
import {NotUnaryExpressionNode, type} from "../../../../../../../../src/lib/node/expression/unary/not";
import {MockCompiler} from "../../../../../../../mock/compiler";

tape('node/expression/unary/not', (test) => {
    test.test('constructor', (test) => {
        let expr = new ConstantExpressionNode(1, 1, 1);
        let node = new NotUnaryExpressionNode(expr, 1, 1);

        test.same(node.getNode('node'), expr);
        test.same(node.type, type);

        test.end();
    });

    test.test('compile', (test) => {
        let compiler = new MockCompiler();
        let expr = new ConstantExpressionNode(1, 1, 1);
        let node = new NotUnaryExpressionNode(expr, 1, 1);

        test.same(compiler.compile(node).getSource(), '!(1)');

        test.end();

    });

    test.end();
});
