import * as tape from 'tape';
import {SafeAnalysisNodeVisitor} from "../../../../../../src/lib/node-visitor/safe-analysis";
import {NodeEnvironment} from "../../../../../../src/lib/environment/node";
import {ArrayLoader} from "../../../../../../src/lib/loader/array";
import {FilterExpressionNode} from "../../../../../../src/lib/node/expression/filter";
import {Node} from "../../../../../../src/lib/node";
import {ConstantExpressionNode} from "../../../../../../src/lib/node/expression/constant";
import {FunctionExpressionNode} from "../../../../../../src/lib/node/expression/function";
import {MethodCallExpressionNode} from "../../../../../../src/lib/node/expression/method-call";
import {GetAttributeExpressionNode} from "../../../../../../src/lib/node/expression/get-attribute";
import {NameExpressionNode} from "../../../../../../src/lib/node/expression/name";
import {Template} from "../../../../../../src/lib/template";

const sinon = require('sinon');

tape('node-visitor/safe-analysis', (test) => {
    test.test('doLeaveNode', (test) => {
        test.test('support not registered filter', function(test) {
            let visitor = new SafeAnalysisNodeVisitor();
            let doLeaveNode = Reflect.get(visitor, 'doLeaveNode').bind(visitor);
            let env = new NodeEnvironment(new ArrayLoader({}));
            let filterNode = new FilterExpressionNode(new Node(), new ConstantExpressionNode('foo', 1, 1), new Node(), 1, 1);

            let setSafeStub = sinon.stub(visitor, 'setSafe');

            doLeaveNode(filterNode, env);

            test.true(setSafeStub.calledWith(filterNode, []));

            test.end();
        });

        test.test('support not registered function', function(test) {
            let visitor = new SafeAnalysisNodeVisitor();
            let doLeaveNode = Reflect.get(visitor, 'doLeaveNode').bind(visitor);
            let env = new NodeEnvironment(new ArrayLoader({}));
            let filterNode = new FunctionExpressionNode('foo', new Node(), 1, 1);

            let setSafeStub = sinon.stub(visitor, 'setSafe');

            doLeaveNode(filterNode, env);

            test.true(setSafeStub.calledWith(filterNode, []));

            test.end();
        });

        test.test('support not registered macro', function(test) {
            let visitor = new SafeAnalysisNodeVisitor();
            let doLeaveNode = Reflect.get(visitor, 'doLeaveNode').bind(visitor);
            let env = new NodeEnvironment(new ArrayLoader({}));
            let filterNode = new MethodCallExpressionNode(new ConstantExpressionNode('foo', 1, 1), 'foo', null, 1, 1);

            let setSafeStub = sinon.stub(visitor, 'setSafe');

            doLeaveNode(filterNode, env);

            test.true(setSafeStub.calledWith(filterNode, []));

            test.end();
        });

        test.test('support safe "EXPRESSION_GET_ATTR" nodes', function(test) {
            let visitor = new SafeAnalysisNodeVisitor();
            let doLeaveNode = Reflect.get(visitor, 'doLeaveNode').bind(visitor);
            let env = new NodeEnvironment(new ArrayLoader({}));
            let filterNode = new GetAttributeExpressionNode(new NameExpressionNode('foo', 1, 1), null, null, Template.ANY_CALL, 1, 1);

            let setSafeStub = sinon.stub(visitor, 'setSafe');

            visitor.setSafeVars(['foo']);

            doLeaveNode(filterNode, env);

            test.true(setSafeStub.calledWith(filterNode, ['all']));

            test.end();
        });

        test.end();
    });

    test.end();
});
