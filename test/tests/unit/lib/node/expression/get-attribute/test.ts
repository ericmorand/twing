import * as tape from 'tape';
import {TwingNodeExpressionConstant} from "../../../../../../../src/lib/node/expression/constant";
import {TwingNodeExpressionName} from "../../../../../../../src/lib/node/expression/name";
import {TwingNodeExpressionArray} from "../../../../../../../src/lib/node/expression/array";
import {TwingNodeExpressionGetAttribute} from "../../../../../../../src/lib/node/expression/get-attribute";
import {TwingTemplate} from "../../../../../../../src/lib/template";
import {MockCompiler} from "../../../../../../mock/compiler";

tape('node/expression/get-attribute', (test) => {
    test.test('constructor', (test) => {
        let expr = new TwingNodeExpressionName('foo', 1, 1);
        let attr = new TwingNodeExpressionConstant('bar', 1, 1);
        let args = new TwingNodeExpressionArray(new Map(), 1, 1);
        args.addElement(new TwingNodeExpressionName('foo', 1, 1));
        args.addElement(new TwingNodeExpressionConstant('bar', 1, 1));
        let node = new TwingNodeExpressionGetAttribute(expr, attr, args, TwingTemplate.ARRAY_CALL, 1, 1);

        test.same(node.getChild('node'), expr);
        test.same(node.getChild('attribute'), attr);
        test.same(node.getChild('arguments'), args);
        test.same(node.getAttribute('type'), TwingTemplate.ARRAY_CALL);
        test.same(node.getTemplateLine(), 1);
        test.same(node.getTemplateColumn(),1);

        test.end();
    });

    test.test('compile', (test) => {
        let compiler = new MockCompiler();

        let expr = new TwingNodeExpressionName('foo', 1, 1);
        let attr = new TwingNodeExpressionConstant('bar', 1, 1);
        let args = new TwingNodeExpressionArray(new Map(), 1, 1);
        let node = new TwingNodeExpressionGetAttribute(expr, attr, args, TwingTemplate.ANY_CALL, 1, 1);

        test.same(compiler.compile(node).getSource(), `await this.traceableMethod(this.getAttribute, 1, this.source)(this.environment, (context.has(\`foo\`) ? context.get(\`foo\`) : null), \`bar\`, new Map([]), \`any\`, false, false, false)`);

        node = new TwingNodeExpressionGetAttribute(expr, attr, args, TwingTemplate.ARRAY_CALL, 1, 1);

        test.same(compiler.compile(node).getSource(), `await (async () => {let object = (context.has(\`foo\`) ? context.get(\`foo\`) : null); return this.get(object, \`bar\`);})()`);

        args = new TwingNodeExpressionArray(new Map(), 1, 1);
        args.addElement(new TwingNodeExpressionName('foo', 1, 1));
        args.addElement(new TwingNodeExpressionConstant('bar', 1, 1));
        node = new TwingNodeExpressionGetAttribute(expr, attr, args, TwingTemplate.METHOD_CALL, 1, 1);

        test.same(compiler.compile(node).getSource(), `await this.traceableMethod(this.getAttribute, 1, this.source)(this.environment, (context.has(\`foo\`) ? context.get(\`foo\`) : null), \`bar\`, new Map([[0, (context.has(\`foo\`) ? context.get(\`foo\`) : null)], [1, \`bar\`]]), \`method\`, false, false, false)`);

        test.end();
    });

    test.end();
});
