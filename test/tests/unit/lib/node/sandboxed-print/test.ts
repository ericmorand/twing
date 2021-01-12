import * as tape from 'tape';
import {ConstantExpressionNode} from "../../../../../../src/lib/node/expression/constant";
import {SandboxedPrintNode, type} from "../../../../../../src/lib/node/sandboxed-print";
import {MockCompiler} from "../../../../../mock/compiler";

tape('node/sandboxed-print', (test) => {
    test.test('constructor', (test) => {
        let expr = new ConstantExpressionNode('foo', 1, 1);
        let node = new SandboxedPrintNode(expr, 1, 1);

        test.same(node.getNode('expr'), expr);
        test.same(node.type, type);
        test.same(node.getLine(), 1);
        test.same(node.getColumn(), 1);

        test.end();
    });

    test.test('compile', (test) => {
        let node = new SandboxedPrintNode(new ConstantExpressionNode('foo', 1, 1), 1, 1);
        let compiler = new MockCompiler();

        test.same(compiler.compile(node).getSource(), `outputBuffer.echo(this.environment.ensureToStringAllowed(\`foo\`));
`);

        test.end();
    });

    test.end();
});
