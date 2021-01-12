import * as tape from 'tape';
import {ConstantExpressionNode} from "../../../../../../../src/lib/node/expression/constant";
import {MockCompiler} from "../../../../../../mock/compiler";

tape('node/expression/constant', (test) => {
    test.test('constructor', (test) => {
        let node = new ConstantExpressionNode('foo', 1, 1);

        test.same(node.getAttribute('value'), 'foo');

        test.end();
    });

    test.test('compile', (test) => {
        let compiler = new MockCompiler();

        let node = new ConstantExpressionNode('foo', 1, 1);

        test.same(compiler.compile(node).getSource(), '\`foo\`');
        test.end();
    });

    test.end();
});
