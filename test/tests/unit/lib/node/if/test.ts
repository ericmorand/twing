import * as tape from 'tape';
import {ConstantExpressionNode} from "../../../../../../src/lib/node/expression/constant";
import {PrintNode} from "../../../../../../src/lib/node/print";
import {NameExpressionNode} from "../../../../../../src/lib/node/expression/name";
import {Node} from "../../../../../../src/lib/node";
import {IfNode, type} from "../../../../../../src/lib/node/if";
import {MockCompiler} from "../../../../../mock/compiler";

tape('node/if', (test) => {
    test.test('constructor', (test) => {
        let tNodes = new Map([
            [0, new ConstantExpressionNode(true, 1, 1)],
            [1, new PrintNode(new NameExpressionNode('foo', 1, 1), 1, 1)]
        ]);

        let t = new Node(tNodes, new Map(), 1, 1);
        let else_ = null;
        let node = new IfNode(t, else_, 1, 1);

        test.same(node.getNode('tests'), t);
        test.false(node.hasNode('else'));

        else_ = new PrintNode(new NameExpressionNode('bar', 1, 1), 1, 1);
        node = new IfNode(t, else_, 1, 1);

        test.same(node.getNode('else'), else_);
        test.same(node.type, type);
        test.same(node.getLine(), 1);
        test.same(node.getColumn(), 1);

        test.end();
    });

    test.test('compile', (test) => {
        let compiler = new MockCompiler();

        test.test('without else', (test) => {
            let tNodes = new Map([
                [0, new ConstantExpressionNode(true, 1, 1)],
                [1, new PrintNode(new NameExpressionNode('foo', 1, 1), 1, 1)]
            ]);

            let t = new Node(tNodes, new Map(), 1, 1);
            let else_ = null;
            let node = new IfNode(t, else_, 1, 1);

            test.same(compiler.compile(node).getSource(), `if (true) {
    outputBuffer.echo((context.has(\`foo\`) ? context.get(\`foo\`) : null));
}
`);
            test.end();
        });

        test.test('with multiple tests', (test) => {
            let tNodes = new Map([
                [0, new ConstantExpressionNode(true, 1, 1)],
                [1, new PrintNode(new NameExpressionNode('foo', 1, 1), 1, 1)],
                [2, new ConstantExpressionNode(false, 1, 1)],
                [3, new PrintNode(new NameExpressionNode('bar', 1, 1), 1, 1)]
            ]);

            let t = new Node(tNodes, new Map(), 1, 1);
            let else_ = null;

            let node = new IfNode(t, else_, 1, 1);

            test.same(compiler.compile(node).getSource(), `if (true) {
    outputBuffer.echo((context.has(\`foo\`) ? context.get(\`foo\`) : null));
}
else if (false) {
    outputBuffer.echo((context.has(\`bar\`) ? context.get(\`bar\`) : null));
}
`);
            test.end();
        });

        test.test('with else', (test) => {
            let tNodes = new Map([
                [0, new ConstantExpressionNode(true, 1, 1)],
                [1, new PrintNode(new NameExpressionNode('foo', 1, 1), 1, 1)]
            ]);

            let t = new Node(tNodes, new Map(), 1, 1);
            let else_ = new PrintNode(new NameExpressionNode('bar', 1, 1), 1, 1);

            let node = new IfNode(t, else_, 1, 1);

            test.same(compiler.compile(node).getSource(), `if (true) {
    outputBuffer.echo((context.has(\`foo\`) ? context.get(\`foo\`) : null));
}
else {
    outputBuffer.echo((context.has(\`bar\`) ? context.get(\`bar\`) : null));
}
`);
            test.end();
        });

        test.test('with multiple elseif', (test) => {
            let tNodes = new Map<any, Node>([
                [0, new NameExpressionNode('a', 1, 1)],
                [1, new PrintNode(new ConstantExpressionNode('a', 1, 1), 1, 1)],
                [2, new NameExpressionNode('b', 1, 1)],
                [3, new PrintNode(new ConstantExpressionNode('b', 1, 1), 1, 1)],
                [4, new NameExpressionNode('c', 1, 1)],
                [5, new PrintNode(new ConstantExpressionNode('c', 1, 1), 1, 1)],
            ]);

            let t = new Node(tNodes, new Map(), 1);
            let else_ = new PrintNode(new NameExpressionNode('bar', 1, 1), 1, 1);

            let node = new IfNode(t, else_, 1, 1);

            test.same(compiler.compile(node).getSource(), `if ((context.has(\`a\`) ? context.get(\`a\`) : null)) {
    outputBuffer.echo(\`a\`);
}
else if ((context.has(\`b\`) ? context.get(\`b\`) : null)) {
    outputBuffer.echo(\`b\`);
}
else if ((context.has(\`c\`) ? context.get(\`c\`) : null)) {
    outputBuffer.echo(\`c\`);
}
else {
    outputBuffer.echo((context.has(\`bar\`) ? context.get(\`bar\`) : null));
}
`);
            test.end();
        });

        test.end();
    });

    test.end();
});
