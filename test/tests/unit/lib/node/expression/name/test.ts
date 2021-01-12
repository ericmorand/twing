import * as tape from 'tape';
import {NameExpressionNode} from "../../../../../../../src/lib/node/expression/name";
import {MockLoader} from "../../../../../../mock/loader";
import {MockCompiler} from "../../../../../../mock/compiler";
import {MockEnvironment} from "../../../../../../mock/environment";
import {TwingEnvironmentNode} from "../../../../../../../src/lib/environment/node";
import {ArrayLoader} from "../../../../../../../src/lib/loader/array";

tape('node/expression/name', (test) => {
    test.test('constructor', (test) => {
        let node = new NameExpressionNode('foo', 1, 1);

        test.same(node.getAttribute('name'), 'foo');
        test.same(node.getLine(), 1);
        test.same(node.getColumn(),1);

        test.end();
    });

    test.test('compile', (test) => {
        let node = new NameExpressionNode('foo', 1, 1);
        let self = new NameExpressionNode('_self', 1, 1);
        let context = new NameExpressionNode('_context', 1, 1);

        let loader = new MockLoader();
        let compiler = new MockCompiler(new MockEnvironment(loader, {strict_variables: true}));
        let compiler1 = new MockCompiler(new MockEnvironment(loader, {strict_variables: false}));

        test.same(compiler.compile(node).getSource(), `(context.has(\`foo\`) ? context.get(\`foo\`) : (() => { throw new this.RuntimeError('Variable \`foo\` does not exist.', 1, this.source); })())`);
        test.same(compiler1.compile(node).getSource(), `(context.has(\`foo\`) ? context.get(\`foo\`) : null)`);
        test.same(compiler.compile(self).getSource(), `this.templateName`);
        test.same(compiler.compile(context).getSource(), `context`);

        test.test('when "is_defined_test" is set to true', function(test) {
            test.test('and name is special', function(test) {
                let node = new NameExpressionNode('_self', 1, 1);

                node.setAttribute('is_defined_test', true);

                let compiler = new MockCompiler(new TwingEnvironmentNode(new ArrayLoader({})));

                test.same(compiler.compile(node).getSource(), `true`);

                test.end();
            });

            test.end();
        });

        test.end();
    });

    test.test('isSimple', (test) => {
        let testCases: [string, boolean][] = [
            ['_self', false],
            ['_context', false],
            ['_charset', false],
            ['foo', true],
        ];

        for (let testCase of testCases) {
            test.equals(new NameExpressionNode(testCase[0], 1, 1).isSimple(), testCase[1], `should return ${testCase[1]} for "${testCase[0]}"`);
        }

        test.test('when "is_defined_test" is set to true', function(test) {
            for (let testCase of testCases) {
                let node = new NameExpressionNode(testCase[0], 1, 1);

                node.setAttribute('is_defined_test', true);

                test.false(node.isSimple(), `should return false for "${testCase[0]}"`);
            }

            test.end();
        });

        test.end();
    });

    test.end();
});
