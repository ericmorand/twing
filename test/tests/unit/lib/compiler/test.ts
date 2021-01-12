import * as tape from 'tape';
import {Node} from "../../../../../src/lib/node";
import {ConstantExpressionNode} from "../../../../../src/lib/node/expression/constant";
import {Compiler} from "../../../../../src/lib/compiler";
import {MockEnvironment} from "../../../../mock/environment";
import {MockLoader} from "../../../../mock/loader";
import {BodyNode} from "../../../../../src/lib/node/body";

tape('compiler', (test) => {
    test.test('subcompile method', (test) => {
        let node = new Node(new Map([
            [0, new ConstantExpressionNode(1, 1, 1)]
        ]), new Map(), 1, 1, 'foo');
        let compiler = new Compiler(new MockEnvironment(new MockLoader()));

        test.same(compiler.compile(node).indent().subCompile(node).getSource(), '11', 'doesn\'t add indentation when raw is not set');
        test.same(compiler.compile(node).indent().subCompile(node, true).getSource(), '11', 'doesn\'t add indentation when raw is set to true');
        test.same(compiler.compile(node).indent().subCompile(node, false).getSource(), '1    1', 'add indentation when raw is set to false');

        test.end();
    });

    test.test('string method', (test) => {
        let node = new Node(new Map(), new Map(), 1, 1, 'foo');

        let compiler = new Compiler(new MockEnvironment(new MockLoader));

        test.same(compiler.compile(node).string('').getSource(), '\`\`', 'supports empty parameter');
        test.same(compiler.compile(node).string(null).getSource(), '\`\`', 'supports null parameter');
        test.same(compiler.compile(node).string(undefined).getSource(), '\`\`', 'supports undefined parameter');
        test.same(compiler.compile(node).string('${foo}').getSource(), '\`\\${foo}\`', 'escape interpolation delimiter');
        test.same(compiler.compile(node).string('${foo}${foo}').getSource(), '\`\\${foo}\\${foo}\`', 'escape interpolation delimiter globally');

        test.end();
    });

    test.test('repr method', (test) => {
        let node = new Node(new Map(), new Map(), 1, 1, 'foo');

        let compiler = new Compiler(new MockEnvironment(new MockLoader));

        test.same(compiler.compile(node).repr({1: 'a', 'b': 2, 'c': '3'}).getSource(), '{"1": \`a\`, "b": 2, "c": \`3\`}', 'supports hashes');
        test.same(compiler.compile(node).repr(undefined).getSource(), 'undefined', 'supports undefined');
        test.same(compiler.compile(node).repr(new Map([[0, 1], [1, 2]])).getSource(), 'new Map([[0, 1], [1, 2]])', 'supports ES6 maps');

        test.end();
    });

    test.test('outdent method', function(test) {
        let node = new Node(new Map(), new Map(), 1, 1, 'foo');

        let compiler = new Compiler(new MockEnvironment(new MockLoader));

        try {
            compiler.compile(node).outdent();

            test.fail();
        }
        catch (e) {
            test.same(e.message, 'Unable to call outdent() as the indentation would become negative.', 'throws an error if the indentation becomes negative');
        }

        test.end();
    });

    test.test('addSourceMapEnter', function(test) {
        let compiler = new Compiler(new MockEnvironment(new MockLoader, {
            source_map: true
        }));

        class CustomNode extends BodyNode {
            constructor(line: number, column: number) {
                super(new Map(), new Map(), line, column);
            }

            compile(compiler: Compiler) {
                compiler.addSourceMapEnter(this);
            }
        }

        test.same(compiler.compile(new CustomNode(1, 1)).getSource(), 'this.environment.enterSourceMapBlock(1, 1, `body`, this.source, outputBuffer);\n');

        test.end();
    });

    test.end();
});
