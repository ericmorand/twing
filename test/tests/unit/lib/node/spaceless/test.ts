import * as tape from 'tape';
import {TwingNodeText} from "../../../../../../src/lib/node/text";
import {Node} from "../../../../../../src/lib/node";
import {TwingNodeSpaceless, type} from "../../../../../../src/lib/node/spaceless";
import {MockCompiler} from "../../../../../mock/compiler";

tape('node/spaceless', (test) => {
    test.test('constructor', (test) => {
        let bodyNodes = new Map([
            [0, new TwingNodeText('<div>   <div>   foo   </div>   </div>', 1, 1)]
        ]);

        let body = new Node(bodyNodes);
        let node = new TwingNodeSpaceless(body, 1, 1);

        test.same(node.getNode('body'), body);
        test.same(node.type, type);
        test.same(node.getLine(), 1);
        test.same(node.getColumn(), 1);

        test.end();
    });

    test.test('compile', (test) => {
        let bodyNodes = new Map([
            [0, new TwingNodeText('<div>   <div>   foo   </div>   </div>', 1, 1)]
        ]);

        let body = new Node(bodyNodes);
        let node = new TwingNodeSpaceless(body, 1, 1);
        let compiler = new MockCompiler();

        test.same(compiler.compile(node).getSource(), `outputBuffer.start();
outputBuffer.echo(\`<div>   <div>   foo   </div>   </div>\`);
outputBuffer.echo(outputBuffer.getAndClean().replace(/>\\s+</g, '><').trim());
`);

        test.end();
    });

    test.end();
});
