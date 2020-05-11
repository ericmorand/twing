import * as tape from 'tape';
import {TwingNodeText} from "../../../../../../src/lib/node/text";
import {TwingNodeSandbox, type} from "../../../../../../src/lib/node/sandbox";
import {MockCompiler} from "../../../../../mock/compiler";

tape('node/sandboxed', (test) => {
    test.test('constructor', (test) => {
        let body = new TwingNodeText('foo', 1, 1);
        let node = new TwingNodeSandbox(body, 1, 1);

        test.same(node.getChild('body'), body);
        test.same(node.type, type);
        test.same(node.getTemplateLine(), 1);
        test.same(node.getTemplateColumn(), 1);

        test.end();
    });

    test.test('compile', (test) => {
        let body = new TwingNodeText('foo', 1, 1);
        let node = new TwingNodeSandbox(body, 1, 1);
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
