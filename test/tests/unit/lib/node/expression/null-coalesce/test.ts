import * as tape from 'tape';
import {ConstantExpressionNode} from "../../../../../../../src/lib/node/expression/constant";
import {NameExpressionNode} from "../../../../../../../src/lib/node/expression/name";
import {NullCoalesceExpressionNode, type} from "../../../../../../../src/lib/node/expression/null-coalesce";
import {MockCompiler} from "../../../../../../mock/compiler";

tape('node/expression/null-coalesce', (test) => {
    test.test('constructor', function(test) {
        let left = new NameExpressionNode('foo', 1, 1);
        let right = new ConstantExpressionNode(2, 1, 1);
        let node = new NullCoalesceExpressionNode([left, right], 1, 1);

        test.same(node.getLine(), 1);
        test.same(node.getColumn(),1);

        test.end();
    });

    test.test('compile', (test) => {
        let compiler = new MockCompiler();

        let left = new NameExpressionNode('foo', 1, 1);
        let right = new ConstantExpressionNode(2, 1, 1);
        let node = new NullCoalesceExpressionNode([left, right], 1, 1);

        test.same(compiler.compile(node).getSource(), `((!!((context.has(\`foo\`)) && !(await this.environment.getTest(\'null\').traceableCallable(1, this.source)(...[context.get(\`foo\`)])))) ? (context.get(\`foo\`)) : (2))`);
        test.same(node.type, type);
        test.end();
    });

    test.end();
});
