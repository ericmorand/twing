import * as tape from 'tape';
import {ConstantExpressionNode} from "../../../../../../../src/lib/node/expression/constant";
import {ConditionalExpressionNode} from "../../../../../../../src/lib/node/expression/conditional";
import {MockCompiler} from "../../../../../../mock/compiler";

tape('node/expression/conditional', (test) => {
    test.test('constructor', (test) => {
        let expr1 = new ConstantExpressionNode(1, 1, 1);
        let expr2 = new ConstantExpressionNode(2, 1, 1);
        let expr3 = new ConstantExpressionNode(3, 1, 1);
        let node = new ConditionalExpressionNode(expr1, expr2, expr3, 1, 1);

        test.same(node.getNode('expr1'), expr1);
        test.same(node.getNode('expr2'), expr2);
        test.same(node.getNode('expr3'), expr3);

        test.end();
    });

    test.test('compile', (test) => {
        let compiler = new MockCompiler();

        let expr1 = new ConstantExpressionNode(1, 1, 1);
        let expr2 = new ConstantExpressionNode(2, 1, 1);
        let expr3 = new ConstantExpressionNode(3, 1, 1);
        let node = new ConditionalExpressionNode(expr1, expr2, expr3, 1, 1);

        test.same(compiler.compile(node).getSource(), '((1) ? (2) : (3))');
        test.end();
    });

    test.end();
});
