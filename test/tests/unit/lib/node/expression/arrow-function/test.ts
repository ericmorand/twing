import * as tape from 'tape';
import {Node} from "../../../../../../../src/lib/node";
import {AssignNameExpressionNode} from "../../../../../../../src/lib/node/expression/assign-name";
import {ArrowFunctionExpressionNode} from "../../../../../../../src/lib/node/expression/arrow-function";
import {ConstantExpressionNode} from "../../../../../../../src/lib/node/expression/constant";
import {MockCompiler} from "../../../../../../mock/compiler";

tape('node/expression/arrow-function', (test) => {
    test.test('constructor', (test) => {
        let names = new Node(new Map([[0 ,new AssignNameExpressionNode('a', 1, 1)]]));
        let node = new ArrowFunctionExpressionNode(new ConstantExpressionNode('foo', 1, 1), names, 1, 1);

        test.same(node.getNode('names'), names);

        test.end();
    });

    test.test('compile', (test) => {
        let compiler = new MockCompiler();
        let expected = `async ($__a__, $__b__) => {context.proxy['a'] = $__a__; context.proxy['b'] = $__b__; return \`foo\`;}`;

        let names = new Node(new Map([
            [0 ,new AssignNameExpressionNode('a', 1, 1)],
            [1 ,new AssignNameExpressionNode('b', 1, 1)]
        ]));
        let node = new ArrowFunctionExpressionNode(new ConstantExpressionNode('foo', 1, 1), names, 1, 1);

        test.same(compiler.compile(node).getSource(), expected);
        test.end();
    });

    test.end();
});
