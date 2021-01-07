import * as tape from 'tape';
import {TwingNodeExpressionConstant} from "../../../../../../src/lib/node/expression/constant";
import {TwingNodeExpressionAssignName} from "../../../../../../src/lib/node/expression/assign-name";
import {TwingNodeImport, type} from "../../../../../../src/lib/node/import";
import {MockCompiler} from "../../../../../mock/compiler";

tape('node/import', (test) => {
    test.test('constructor', (test) => {
        let macro = new TwingNodeExpressionConstant('foo.twig', 1, 1);
        let var_ = new TwingNodeExpressionAssignName('macro', 1, 1);
        let node = new TwingNodeImport(macro, var_, 1, 1);

        test.same(node.getNode('templateName'), macro);
        test.same(node.getNode('variable'), var_);
        test.same(node.type, type);
        test.same(node.getLine(), 1);
        test.same(node.getColumn(), 1);

        test.end();
    });

    test.test('compile', (test) => {
        let macro = new TwingNodeExpressionConstant('foo.twig', 1, 1);
        let var_ = new TwingNodeExpressionAssignName('macro', 1, 1);
        let node = new TwingNodeImport(macro, var_, 1, 1);
        let compiler = new MockCompiler();

        test.same(compiler.compile(node).getSource(), `aliases.proxy[\`macro\`] = this.aliases.proxy[\`macro\`] = await this.loadTemplate(\`foo.twig\`, 1);
`);

        test.end();
    });

    test.end();
});
