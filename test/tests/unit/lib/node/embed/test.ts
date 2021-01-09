import * as tape from 'tape';
import {TwingNodeEmbed, type} from "../../../../../../src/lib/node/embed";
import {TwingNodeExpressionConstant} from "../../../../../../src/lib/node/expression/constant";
import {Compiler} from "../../../../../../src/lib/compiler";
import {TwingEnvironmentNode} from "../../../../../../src/lib/environment/node";
import {TwingLoaderArray} from "../../../../../../src/lib/loader/array";

tape('node/embed', (test) => {
    test.test('constructor', (test) => {
        let variables = new TwingNodeExpressionConstant('foo', 1, 1);
        let node = new TwingNodeEmbed('foo', 1, variables, false, false, 1, 1, 'embed');

        test.same(node.getNode('variables'), variables);
        test.same(node.type, type);

        test.end();
    });

    test.test('compile', (test) => {
        let node = new TwingNodeEmbed('foo', 1, new TwingNodeExpressionConstant('bar', 1, 1), false, false, 1, 1, 'embed');
        let compiler = new Compiler(new TwingEnvironmentNode(new TwingLoaderArray({})));

        test.same(compiler.compile(node).getSource(), `outputBuffer.echo(await this.include(context, outputBuffer, await this.loadTemplate(\`foo\`, 1, 1), \`bar\`, true, false, 1));
`);

        test.end();
    });

    test.end();
});
