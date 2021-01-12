import * as tape from 'tape';
import {BlockReferenceNode, type} from "../../../../../../src/lib/node/block-reference";
import {MockCompiler} from "../../../../../mock/compiler";

tape('node/block-reference', (test) => {
    test.test('constructor', (test) => {
        let node = new BlockReferenceNode('foo', 1, 1);

        test.same(node.getAttribute('name'), 'foo');
        test.same(node.type, type);

        test.end();
    });

    test.test('compile', (test) => {
        let node = new BlockReferenceNode('foo', 1, 1);
        let compiler = new MockCompiler();

        test.same(compiler.compile(node).getSource(), `outputBuffer.echo(await this.traceableRenderBlock(1, this.source)(\'foo\', context.clone(), outputBuffer, blocks));
`);

        test.end();
    });

    test.end();
});
