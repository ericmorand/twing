import * as tape from 'tape';
import {ConstantExpressionNode} from "../../../../../../src/lib/node/expression/constant";
import {TextNode} from "../../../../../../src/lib/node/text";
import {Node} from "../../../../../../src/lib/node";
import {ModuleNode, type} from "../../../../../../src/lib/node/module";
import {Source} from "../../../../../../src/lib/source";
import {MockCompiler} from "../../../../../mock/compiler";
import {ImportNode} from "../../../../../../src/lib/node/import";
import {AssignNameExpressionNode} from "../../../../../../src/lib/node/expression/assign-name";
import {SetNode} from "../../../../../../src/lib/node/set";
import {ConditionalExpressionNode} from "../../../../../../src/lib/node/expression/conditional";
import {MockLoader} from "../../../../../mock/loader";
import {MockEnvironment} from "../../../../../mock/environment";

tape('node/module', (test) => {
    test.test('constructor', (test) => {
        let body = new TextNode('foo', 1, 1, null);
        let parent = new ConstantExpressionNode('layout.twig', 1, 1);
        let blocks = new Node();
        let macros = new Node();
        let traits = new Node();
        let source = new Source('{{ foo }}', 'foo.twig');
        let node = new ModuleNode(body, parent, blocks, macros, traits, [], source);

        test.same(node.getNode('body'), body);
        test.same(node.getNode('blocks'), blocks);
        test.same(node.getNode('macros'), macros);
        test.same(node.getNode('parent'), parent);
        test.same(node.getTemplateName(), source.getName());
        test.same(node.type, type);
        test.same(node.getLine(), 1);
        test.same(node.getColumn(),1);

        test.end();
    });

    test.test('compile', (test) => {
        let compiler = new MockCompiler();

        test.test('basic', (test) => {
            let body = new TextNode('foo', 1, 1);
            let parent = null;
            let blocks = new Node();
            let macros = new Node();
            let traits = new Node();
            let source = new Source('{{ foo }}', 'foo.twig');
            let node = new ModuleNode(body, parent, blocks, macros, traits, [], source);

            test.same(compiler.compile(node).getSource(), `module.exports = (TwingTemplate) => {
    return new Map([
        [0, class extends TwingTemplate {
            constructor(environment) {
                super(environment);

                this._source = new this.Source(\`\`, \`foo.twig\`);

                let aliases = new this.Context();
            }

            async doDisplay(context, outputBuffer, blocks = new Map()) {
                let aliases = this.aliases.clone();

                outputBuffer.echo(\`foo\`);
            }

        }],
    ]);
};`);

            test.end();
        });

        test.test('with parent', (test) => {
            let import_ = new ImportNode(new ConstantExpressionNode('foo.twig', 1, 1), new AssignNameExpressionNode('macro', 1, 1), 2, 1);

            let bodyNodes = new Map([
                [0, import_]
            ]);

            let body = new Node(bodyNodes);
            let extends_ = new ConstantExpressionNode('layout.twig', 1, 1);

            let blocks = new Node();
            let macros = new Node();
            let traits = new Node();
            let source = new Source('{{ foo }}', 'foo.twig');

            let node = new ModuleNode(body, extends_, blocks, macros, traits, [], source);

            test.same(compiler.compile(node).getSource(), `module.exports = (TwingTemplate) => {
    return new Map([
        [0, class extends TwingTemplate {
            constructor(environment) {
                super(environment);

                this._source = new this.Source(\`\`, \`foo.twig\`);

                let aliases = new this.Context();
            }

            doGetParent(context) {
                return this.loadTemplate(\`layout.twig\`, 1).then((parent) => {
                    this.parent = parent;

                    return parent;
                });
            }

            async doDisplay(context, outputBuffer, blocks = new Map()) {
                let aliases = this.aliases.clone();

                aliases.proxy[\`macro\`] = this.aliases.proxy[\`macro\`] = await this.loadTemplate(\`foo.twig\`, 2);
                await (await this.getParent(context)).display(context, this.merge(await this.getBlocks(), blocks), outputBuffer);
            }

            get isTraitable() {
                return false;
            }

        }],
    ]);
};`);

            test.end();
        });

        test.test('with conditional parent, set body and debug', (test) => {
            let setNames = new Map([
                [0, new AssignNameExpressionNode('foo', 4, 1)]
            ]);

            let setValues = new Map([
                [0, new ConstantExpressionNode('foo', 4, 1)]
            ]);

            let set = new SetNode(false, new Node(setNames), new Node(setValues), 4, 1);

            let bodyNodes = new Map([
                [0, set]
            ]);

            let body = new Node(bodyNodes);
            let extends_ = new ConditionalExpressionNode(
                new ConstantExpressionNode(true, 2, 1),
                new ConstantExpressionNode('foo', 2, 1),
                new ConstantExpressionNode('bar', 2, 1),
                2, 1
            );

            let blocks = new Node();
            let macros = new Node();
            let traits = new Node();
            let source = new Source('{{ foo }}', 'foo.twig');

            let loader = new MockLoader();
            let twing = new MockEnvironment(loader, {debug: true});
            let node = new ModuleNode(body, extends_, blocks, macros, traits, [], source);

            compiler = new MockCompiler(twing);

            test.same(compiler.compile(node).getSource(), `module.exports = (TwingTemplate) => {
    return new Map([
        [0, class extends TwingTemplate {
            constructor(environment) {
                super(environment);

                this._source = new this.Source(\`{{ foo }}\`, \`foo.twig\`);

                let aliases = new this.Context();
            }

            doGetParent(context) {
                return this.loadTemplate(((true) ? (\`foo\`) : (\`bar\`)), 2);
            }

            async doDisplay(context, outputBuffer, blocks = new Map()) {
                let aliases = this.aliases.clone();

                context.proxy[\`foo\`] = \`foo\`;
                await (await this.getParent(context)).display(context, this.merge(await this.getBlocks(), blocks), outputBuffer);
            }

            get isTraitable() {
                return false;
            }

        }],
    ]);
};`);

            test.end();
        });

        test.end();
    });

    test.end();
});
