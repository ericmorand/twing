import {TwingNodeExpressionTest} from "../test";
import {TwingNode} from "../../../node";
import {TwingNodeExpression} from "../../expression";
import {TwingNodeExpressionConstant} from "../constant";
import {TwingNodeExpressionName} from "../name";
import {TwingNodeExpressionGetAttribute, type as getAttrType} from "../get-attribute";
import {TwingNodeExpressionBlockReference} from "../block-reference";
import {TwingNodeExpressionFunction} from "../function";
import {TwingNodeExpressionArray} from "../array";
import {TwingNodeExpressionMethodCall} from "../method-call";
import {TwingErrorSyntax} from "../../../error/syntax";
import {TwingCompiler} from "../../../compiler";
import {TwingNodeType} from "../../../node-type";
import {TwingNodeExpressionConstantBoolean} from "../constant/boolean";

export const type = new TwingNodeType('expression_test_defined');

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
export class TwingNodeExpressionTestDefined extends TwingNodeExpressionTest {
    constructor(node: TwingNodeExpression, name: string, nodeArguments: TwingNode, lineno: number, columnno: number) {
        let changeIgnoreStrictCheck = false;
        let error = null;

        if (node instanceof TwingNodeExpressionName) {
            node.setAttribute('is_defined_test', true);
        } else if (node instanceof TwingNodeExpressionGetAttribute) {
            node.setAttribute('is_defined_test', true);
            changeIgnoreStrictCheck = true;
        } else if (node instanceof TwingNodeExpressionBlockReference) {
            node.setAttribute('is_defined_test', true);
        } else if (node instanceof TwingNodeExpressionFunction && (node.getAttribute('name') === 'constant')) {
            node.setAttribute('is_defined_test', true);
        } else if (node instanceof TwingNodeExpressionConstant || node instanceof TwingNodeExpressionArray) {
            node = new TwingNodeExpressionConstantBoolean(true, node.getTemplateLine(), node.getTemplateColumn());
        } else if (node instanceof TwingNodeExpressionMethodCall) {
            node.setAttribute('is_defined_test', true);
        } else {
            error = 'The "defined" test only works with simple variables.';
        }

        super(node, 'defined', nodeArguments, lineno, columnno);

        if (changeIgnoreStrictCheck) {
            this.changeIgnoreStrictCheck(node);
        }

        if (error) {
            throw new TwingErrorSyntax(error, this.getTemplateLine());
        }
    }

    get type() {
        return type;
    }

    changeIgnoreStrictCheck(node: TwingNodeExpression) {
        node.setAttribute('optimizable', false);
        node.setAttribute('ignore_strict_check', true);

        let exprNode = <TwingNodeExpression>node.getChild('node');

        if (exprNode.is(getAttrType)) {
            this.changeIgnoreStrictCheck(exprNode);
        }
    }

    compile(compiler: TwingCompiler) {
        compiler.subcompile(this.getChild('node'));
    }
}
