import {TestExpressionNode} from "../test";
import {Node} from "../../../node";
import {ExpressionNode} from "../../expression";
import {ConstantExpressionNode} from "../constant";
import {FunctionExpressionNode} from "../function";
import {SyntaxError} from "../../../error/syntax";
import {Compiler} from "../../../compiler";

import type {HashExpressionNode} from "../hash";

/**
 * Checks if a variable is defined in the active context.
 *
 * <pre>
 * {# defined works with variable names and variable attributes #}
 * {% if foo is defined %}
 *     {# ... #}
 * {% endif %}
 * </pre>
 */
export class DefinedTestExpressionNode extends TestExpressionNode {
    constructor(node: ExpressionNode<any>, name: string, testArguments: HashExpressionNode, line: number, column: number) {
        // todo: restore
        // let changeIgnoreStrictCheck = false;
        // let error = null;
        //
        // if (node.is(nameType)) {
        //     node.setAttribute('is_defined_test', true);
        // } else if (node.is(getAttrType)) {
        //     node.setAttribute('is_defined_test', true);
        //     changeIgnoreStrictCheck = true;
        // } else if (node.is(blockreferenceType)) {
        //     node.setAttribute('is_defined_test', true);
        // } else if ((node instanceof FunctionExpressionNode) && (node.getAttribute('name') === 'constant')) {
        //     node.setAttribute('is_defined_test', true);
        // } else if (node.is(constantType) || node.is(arrayType)) {
        //     node = new ConstantExpressionNode(true, node.getLine(), node.getColumn());
        // } else if (node.is(methodCallType)) {
        //     node.setAttribute('is_defined_test', true);
        // } else {
        //     error = 'The "defined" test only works with simple variables.';
        // }

        super({name}, {arguments: testArguments, node}, {line, column});

        // if (changeIgnoreStrictCheck) {
        //     this.changeIgnoreStrictCheck(node);
        // }
        //
        // if (error) {
        //     throw new SyntaxError(error, null, this.location);
        // }
    }

    changeIgnoreStrictCheck(node: ExpressionNode<any>) {
        // todo: restore
        // node.setAttribute('optimizable', false);
        // node.setAttribute('ignore_strict_check', true);
        //
        // let exprNode = <ExpressionNode>node.getNode('node');
        //
        // if (exprNode.is(getAttrType)) {
        //     this.changeIgnoreStrictCheck(exprNode);
        // }
    }

    compile(compiler: Compiler) {
        compiler.subCompile(this.edges.node);
    }
}
