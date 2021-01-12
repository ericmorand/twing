import * as tape from 'tape';
import {VerbatimNode, type} from "../../../../../../src/lib/node/verbatim";
import {MockCompiler} from "../../../../../mock/compiler";

tape('node/verbatim', (test) => {
    test.test('constructor', (test) => {
        let node = new VerbatimNode('foo', 1, 1, 'verbatim');

        test.same(node.getAttribute('data'), 'foo');
        test.same(node.type, type);
        test.same(node.getLine(), 1);
        test.same(node.getColumn(), 1);
        test.same(node.getTag(), 'verbatim');

        test.end();
    });

    test.test('compile', (test) => {
        let node = new VerbatimNode('foo', 1, 1, 'verbatim');
        let compiler = new MockCompiler();

        test.same(compiler.compile(node).getSource(), `outputBuffer.echo(\`foo\`);
`);

        test.end();
    });

    test.end();
});
