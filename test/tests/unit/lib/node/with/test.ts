import * as tape from 'tape';
import {ConstantExpressionNode} from "../../../../../../src/lib/node/expression/constant";
import {NameExpressionNode} from "../../../../../../src/lib/node/expression/name";
import {WithNode, type} from "../../../../../../src/lib/node/with";
import {MockCompiler} from "../../../../../mock/compiler";

tape('node/with', (test) => {
    let bodyNode = new NameExpressionNode('foo', 1, 1);
    let variablesNode = new ConstantExpressionNode('bar', 1, 1);

    test.test('constructor', (test) => {
        let node = new WithNode(bodyNode, variablesNode, false, 1, 1);

        test.same(node.getNode('body'), bodyNode);
        test.same(node.getNode('variables'), variablesNode);
        test.same(node.type, type);
        test.same(node.getLine(), 1);
        test.same(node.getColumn(), 1);

        test.end();
    });

    test.test('compile', (test) => {
        let node = new WithNode(bodyNode, variablesNode, false, 1, 1);
        let compiler = new MockCompiler();

        test.same(compiler.compile(node).getSource(), `{
    let tmp = \`bar\`;
    if (typeof (tmp) !== 'object') {
        throw new this.RuntimeError('Variables passed to the "with" tag must be a hash.', 1, this.source);
    }
    context.set('_parent', context.clone());
    context = new this.Context(this.environment.mergeGlobals(this.merge(context, this.convertToMap(tmp))));
}

(context.has(\`foo\`) ? context.get(\`foo\`) : null)context = context.get('_parent');
`);

        test.end();
    });

    test.end();
});
