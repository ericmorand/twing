import * as tape from 'tape';
import {TextNode} from "../../../../../../src/lib/node/text";
import {SandboxNode, type} from "../../../../../../src/lib/node/sandbox";
import {MockCompiler} from "../../../../../mock/compiler";

tape('node/sandboxed', (test) => {
    test.test('constructor', (test) => {
        let body = new TextNode('foo', 1, 1);
        let node = new SandboxNode(body, 1, 1);

        test.same(node.getNode('body'), body);
        test.same(node.type, type);
        test.same(node.getLine(), 1);
        test.same(node.getColumn(), 1);

        test.end();
    });

    test.test('compile', (test) => {
        let body = new TextNode('foo', 1, 1);
        let node = new SandboxNode(body, 1, 1);
        let compiler = new MockCompiler();

        test.same(compiler.compile(node).getSource(), `await (async () => {
    let alreadySandboxed = this.environment.isSandboxed();
    if (!alreadySandboxed) {
        this.environment.enableSandbox();
    }
    outputBuffer.echo(\`foo\`);
    if (!alreadySandboxed) {
        this.environment.disableSandbox();
    }
})();
`);

        test.end();
    });

    test.end();
});
