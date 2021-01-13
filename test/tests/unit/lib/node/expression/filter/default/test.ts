import * as tape from 'tape';
import {ConstantExpressionNode} from "../../../../../../../../src/lib/node/expression/constant";
import {DefaultFilterExpressionNode} from "../../../../../../../../src/lib/node/expression/filter/default";
import {NameExpressionNode} from "../../../../../../../../src/lib/node/expression/name";
import {Node} from "../../../../../../../../src/lib/node";
import {Compiler} from "../../../../../../../../src/lib/compiler";
import {NodeEnvironment} from "../../../../../../../../src/lib/environment/node";
import {ArrayLoader} from "../../../../../../../../src/lib/loader/array";

tape('node/expression/filter/default', (test) => {
    test.test('compile', (test) => {
        test.test('when filter is \`default\` and \`EXPRESSION_NAME\` or \`EXPRESSION_GET_ATTR\` node', (test) => {
            let node = new DefaultFilterExpressionNode(
                new NameExpressionNode('foo', 1, 1),
                new ConstantExpressionNode('default', 1, 1),
                new Node(),
                1, 1
            );

            let compiler = new Compiler(new NodeEnvironment(new ArrayLoader({})));

            test.same(compiler.compile(node).getSource(), `(((context.has(\`foo\`))) ? (await this.environment.getFilter('default').traceableCallable(1, this.source)(...[(context.has(\`foo\`) ? context.get(\`foo\`) : null)])) : (\`\`))`);

            test.end();
        });

        test.end();
    });

    test.end();
});
