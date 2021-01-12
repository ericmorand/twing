import * as tape from 'tape';
import {ConstantExpressionNode} from "../../../../../../src/lib/node/expression/constant";
import {TwingNodeText} from "../../../../../../src/lib/node/text";
import {NameExpressionNode} from "../../../../../../src/lib/node/expression/name";
import {Node} from "../../../../../../src/lib/node";
import {MacroNode, type} from "../../../../../../src/lib/node/macro";
import {MockCompiler} from "../../../../../mock/compiler";

tape('node/macro', (test) => {
    test.test('constructor', (test) => {
        let body = new TwingNodeText('foo', 1, 1);

        let argumentsNode = new Map([
            [0, new NameExpressionNode('foo', 1, 1)]
        ]);

        let arguments_ = new Node(argumentsNode, new Map(), 1, 1);
        let node = new MacroNode('foo', body, arguments_, 1, 1);

        test.same(node.getNode('body'), body);
        test.same(node.getNode('arguments'), arguments_);
        test.same(node.getAttribute('name'), 'foo');
        test.same(node.type, type);
        test.same(node.getLine(), 1);
        test.same(node.getColumn(), 1);

        test.end();
    });

    test.test('compile', (test) => {
        let body = new TwingNodeText('foo', 1, 1);

        let arguments_ = new Node(new Map([
            ['foo', new ConstantExpressionNode(null, 1, 1)],
            ['bar', new ConstantExpressionNode('Foo', 1, 1)]
        ]), new Map(), 1, 1);
        let node = new MacroNode('foo', body, arguments_, 1, 1);
        let compiler = new MockCompiler();

        test.same(compiler.compile(node).getSource(), `async (outputBuffer, __foo__ = null, __bar__ = \`Foo\`, ...__varargs__) => {
    let aliases = this.aliases.clone();
    let context = new this.Context(this.environment.mergeGlobals(new Map([
        [\`foo\`, __foo__],
        [\`bar\`, __bar__],
        [\`varargs\`, __varargs__]
    ])));

    let blocks = new Map();
    let result;
    let error;

    outputBuffer.start();
    try {
        outputBuffer.echo(\`foo\`);

        let tmp = outputBuffer.getContents();
        result = (tmp === '') ? '' : new this.Markup(tmp, this.environment.getCharset());
    }
    catch (e) {
        error = e;
    }

    outputBuffer.endAndClean();

    if (error) {
        throw error;
    }
    return result;
}`);

        test.end();
    });

    test.end();
});
