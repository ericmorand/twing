import * as tape from 'tape';
import {ConstantExpressionNode} from "../../../../../../../src/lib/node/expression/constant";
import {BinaryExpressionNode} from "../../../../../../../src/lib/node/expression/binary";
import {Compiler} from "../../../../../../../src/lib/compiler";
import {NodeEnvironment} from "../../../../../../../src/lib/environment/node";
import {ArrayLoader} from "../../../../../../../src/lib/loader/array";

class BinaryExpression extends BinaryExpressionNode {

}

tape('node/expression/binary', (test) => {
    test.test('compile', (test) => {
        let expr = new BinaryExpression([new ConstantExpressionNode('foo', 1, 1), new ConstantExpressionNode('bar', 1, 1)], 1, 1);
        let compiler = new Compiler(new NodeEnvironment(new ArrayLoader({})));

        compiler.compile(expr);

        test.same(compiler.getSource(), '(\`foo\`  \`bar\`)');

        test.end();
    });

    test.end();
});
