import * as tape from 'tape';
import {ConstantExpressionNode} from "../../../../../../src/lib/node/expression/constant";
import {DeprecatedNode, type} from "../../../../../../src/lib/node/deprecated";
import {MockCompiler} from "../../../../../mock/compiler";
import {NameExpressionNode} from "../../../../../../src/lib/node/expression/name";

tape('node/deprecated', (test) => {
    test.test('constructor', (test) => {
        let expr = new ConstantExpressionNode('foo', 1, 1);
        let node = new DeprecatedNode(expr, 1, 1);

        test.same(node.getNode('expr'), expr);
        test.same(node.type, type);

        test.end();
    });

    test.test('compile', (test) => {
        test.test('with constant', (test) => {
            let expr = new ConstantExpressionNode('foo', 1, 1);
            let node = new DeprecatedNode(expr, 1, 1);
            let compiler = new MockCompiler();

            node.setTemplateName('bar');

            test.same(compiler.compile(node).getSource(), `{
    console.warn(\`foo\` + \` ("bar" at line 1)\`);
}
`);

            test.end();
        });

        test.test('with variable', (test) => {
            let expr = new NameExpressionNode('foo', 1, 1);
            let node = new DeprecatedNode(expr, 1, 1);
            let compiler = new MockCompiler();

            node.setTemplateName('bar');

            test.same(compiler.compile(node).getSource(), `{
    let message = (context.has(\`foo\`) ? context.get(\`foo\`) : null);
    console.warn(message + \` ("bar" at line 1)\`);
}
`);

            test.end();
        });

        test.end();
    });

    test.end();
});
