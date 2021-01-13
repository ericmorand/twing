import * as tape from 'tape';
import {ConstantExpressionNode} from "../../../../../../../src/lib/node/expression/constant";
import {UnaryExpressionNode} from "../../../../../../../src/lib/node/expression/unary";
import {Compiler} from "../../../../../../../src/lib/compiler";
import {NodeEnvironment} from "../../../../../../../src/lib/environment/node";
import {ArrayLoader} from "../../../../../../../src/lib/loader/array";

class UnaryExpression extends UnaryExpressionNode {

}

tape('node/expression/unary', (test) => {
    test.test('compile', (test) => {
        let expr = new UnaryExpression(new ConstantExpressionNode('foo', 1, 1), 1, 1);
        let compiler = new Compiler(new NodeEnvironment(new ArrayLoader({})));

        compiler.compile(expr);

        test.same(compiler.getSource(), '(\`foo\`)');

        test.end();
    });

    test.end();
});
