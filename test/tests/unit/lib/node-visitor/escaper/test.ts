import * as tape from 'tape';
import {TwingEnvironmentNode} from "../../../../../../src/lib/environment/node";
import {ArrayLoader} from "../../../../../../src/lib/loader/array";
import {TwingNodeVisitorEscaper} from "../../../../../../src/lib/node-visitor/escaper";
import {TextNode} from "../../../../../../src/lib/node/text";
import {ConstantExpressionNode} from "../../../../../../src/lib/node/expression/constant";
import {Node} from "../../../../../../src/lib/node";
import {Source} from "../../../../../../src/lib/source";
import {ModuleNode} from "../../../../../../src/lib/node/module";
import {TwingNodeVisitorSafeAnalysis} from "../../../../../../src/lib/node-visitor/safe-analysis";
import {PrintNode} from "../../../../../../src/lib/node/print";

const sinon = require('sinon');

tape('node-visitor/escaper', (test) => {
    test.test('doEnterNode', (test) => {
        test.test('with "module" node', function(test) {
            let env = new TwingEnvironmentNode(new ArrayLoader({}));
            let visitor = new TwingNodeVisitorEscaper();
            let body = new TextNode('foo', 1, 1);
            let parent = new ConstantExpressionNode('layout.twig', 1, 1);
            let blocks = new Node();
            let macros = new Node();
            let traits = new Node();
            let source = new Source('{{ foo }}', 'foo.twig');
            let module = new ModuleNode(body, parent, blocks, macros, traits, [], source);

            sinon.stub(env, 'hasExtension').returns(false);

            test.equals(visitor.enterNode(module, env), module, 'returns the node untouched');

            test.end();
        });

        test.end();
    });

    test.test('doLeaveNode', (test) => {
        test.test('with safe "print" node', function(test) {
            let env = new TwingEnvironmentNode(new ArrayLoader({}));
            let visitor = new TwingNodeVisitorEscaper();
            let safeAnalysis = new TwingNodeVisitorSafeAnalysis();
            let print = new PrintNode(new ConstantExpressionNode('foo', 1, 1), 1, 1);

            sinon.stub(env, 'hasExtension').returns(false);
            sinon.stub(visitor, 'needEscaping').returns('html');
            sinon.stub(safeAnalysis, 'getSafe').returns('html');

            Reflect.set(visitor, 'safeAnalysis', safeAnalysis);

            test.equals(visitor.leaveNode(print, env), print, 'returns the node untouched');

            test.end();
        });

        test.end();
    });

    test.end();
});
