import * as tape from 'tape';
import {ConstantExpressionNode} from "../../../../../../../../src/lib/node/expression/constant";
import {NegUnaryExpressionNode, type} from "../../../../../../../../src/lib/node/expression/unary/neg";
import {MockCompiler} from "../../../../../../../mock/compiler";

tape('node/expression/unary/neg', (test) => {
    test.test('constructor', (test) => {
        let expr = new ConstantExpressionNode(1, 1, 1);
        let node = new NegUnaryExpressionNode(expr, 1, 1);

        test.same(node.getNode('node'), expr);
        test.same(node.type, type);

        test.end();
    });

    test.test('compile', (test) => {
        let compiler = new MockCompiler();

        test.test('basic', (test) => {
            let expr = new ConstantExpressionNode(1, 1, 1);
            let node = new NegUnaryExpressionNode(expr, 1, 1);

            test.same(compiler.compile(node).getSource(), '-(1)');

            test.end();
        });

        test.test('with unary neg as body', (test) => {
            let expr = new ConstantExpressionNode(1, 1, 1);
            let node = new NegUnaryExpressionNode(new NegUnaryExpressionNode(expr, 1, 1), 1, 1);

            test.same(compiler.compile(node).getSource(), '-(-(1))');

            test.end();
        });

        test.end();
    });

    test.end();
});
