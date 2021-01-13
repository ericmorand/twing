import * as tape from 'tape';
import {EmbedNode, type} from "../../../../../../src/lib/node/embed";
import {ConstantExpressionNode} from "../../../../../../src/lib/node/expression/constant";
import {Compiler} from "../../../../../../src/lib/compiler";
import {NodeEnvironment} from "../../../../../../src/lib/environment/node";
import {ArrayLoader} from "../../../../../../src/lib/loader/array";

tape('node/embed', (test) => {
    test.test('constructor', (test) => {
        let variables = new ConstantExpressionNode('foo', 1, 1);
        let node = new EmbedNode('foo', 1, variables, false, false, 1, 1, 'embed');

        test.same(node.getNode('variables'), variables);
        test.same(node.type, type);

        test.end();
    });

    test.test('compile', (test) => {
        let node = new EmbedNode('foo', 1, new ConstantExpressionNode('bar', 1, 1), false, false, 1, 1, 'embed');
        let compiler = new Compiler(new NodeEnvironment(new ArrayLoader({})));

        test.same(compiler.compile(node).getSource(), `outputBuffer.echo(await this.include(context, outputBuffer, await this.loadTemplate(\`foo\`, 1, 1), \`bar\`, true, false, 1));
`);

        test.end();
    });

    test.end();
});
