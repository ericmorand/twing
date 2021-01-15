import {BaseNodeVisitor} from "../base-node-visitor";
import {Node, toNodeEdges} from "../node";
import {Environment} from "../environment";
import {SafeAnalysisNodeVisitor} from "./safe-analysis";
import {NodeTraverser} from "../node-traverser";
import {ConstantExpressionNode} from "../node/expression/constant";
import {FilterExpressionNode} from "../node/expression/filter";
import {PrintNode} from "../node/print";
import {DoNode} from "../node/do";
import {ConditionalExpressionNode} from "../node/expression/conditional";
import {InlinePrintNode} from "../node/inline-print";
import {AutoEscapeNode} from "../node/auto-escape";
import {TemplateNode} from "../node/template";
import {BlockNode} from "../node/block";
import {ImportNode} from "../node/import";
import {BlockReferenceNode} from "../node/block-reference";
import {ArgumentsExpressionNode} from "../node/expression/arguments";
import {ArgumentExpressionNode} from "../node/expression/argument";

export class EscaperNodeVisitor extends BaseNodeVisitor {
    private statusStack: Array<Node | string | false> = [];
    private blocks: Map<string, any> = new Map();
    private traverser: NodeTraverser;
    private defaultStrategy: string | false = false;
    private safeVars: Array<string> = [];

    private readonly _safeAnalysis: SafeAnalysisNodeVisitor;

    constructor() {
        super();

        this._safeAnalysis = new SafeAnalysisNodeVisitor();
    }

    protected doEnterNode(node: Node, env: Environment): Node {
        if (node instanceof TemplateNode) {
            this.defaultStrategy = env.getCoreExtension().getDefaultStrategy(node.attributes.source.name);
            this.safeVars = [];
            this.blocks = new Map();
        } else if (node instanceof AutoEscapeNode) {
            this.statusStack.push(node.attributes.strategy);
        } else if (node instanceof BlockNode) {
            this.statusStack.push(this.blocks.has(node.attributes.name) ? this.blocks.get(node.attributes.name) : this.needEscaping());
        } else if (node instanceof ImportNode) {
            this.safeVars.push(node.edges.variable.attributes.value);
        }

        return node;
    }

    protected doLeaveNode(node: Node, env: Environment): Node {
        if (node instanceof TemplateNode) {
            this.defaultStrategy = false;
            this.safeVars = [];
            this.blocks = new Map();
        } else if (node instanceof FilterExpressionNode) {
            return this.preEscapeFilterNode(node, env);
        } else if (node instanceof PrintNode) {
            let type = this.needEscaping();

            if (type !== false) {
                let expression = node.edges.content;

                if ((expression instanceof ConditionalExpressionNode) && this.shouldUnwrapConditional(expression, env, type)) {
                    return new DoNode(null, {
                        expression: this.unwrapConditional(expression, env, type)
                    }, expression.location);
                }

                return this.escapePrintNode(node, env, type);
            }
        }

        if (node instanceof AutoEscapeNode || node instanceof BlockNode) {
            this.statusStack.pop();
        } else if (node instanceof BlockReferenceNode) {
            this.blocks.set(node.attributes.name, this.needEscaping());
        }

        return node;
    }

    private shouldUnwrapConditional(expression: ConditionalExpressionNode, env: Environment, type: any) {
        let expr2Safe = this.isSafeFor(type, expression.edges.expr2, env);
        let expr3Safe = this.isSafeFor(type, expression.edges.expr3, env);

        return expr2Safe !== expr3Safe;
    }

    private unwrapConditional(expression: ConditionalExpressionNode, env: Environment, type: any): ConditionalExpressionNode {
        // convert "echo a ? b : c" to "a ? echo b : echo c" recursively
        let expr2 = expression.edges.expr2;

        if ((expr2 instanceof ConditionalExpressionNode) && this.shouldUnwrapConditional(expr2, env, type)) {
            expr2 = this.unwrapConditional(expr2, env, type);
        } else {
            expr2 = this.escapeInlinePrintNode(new InlinePrintNode(null, {content: expr2}, expr2.location), env, type);
        }

        let expr3 = expression.edges.expr3;

        if ((expr3 instanceof ConditionalExpressionNode) && this.shouldUnwrapConditional(expr3, env, type)) {
            expr3 = this.unwrapConditional(expr3, env, type);
        } else {
            expr3 = this.escapeInlinePrintNode(new InlinePrintNode(null, {content: expr3}, expr3.location), env, type);
        }

        return new ConditionalExpressionNode(null, {
            expr1: expression.edges.expr1, expr2, expr3
        }, expression.location);
    }

    private escapeInlinePrintNode(node: InlinePrintNode, env: Environment, type: any): Node {
        let expression = node.edges.content;

        if (this.isSafeFor(type, expression, env)) {
            return node;
        }

        return new InlinePrintNode(null, {content: this.getEscapedFilter(type, expression)}, node.location);
    }

    private escapePrintNode(node: PrintNode, env: Environment, type: any) {
        let expression = node.edges.content;

        if (this.isSafeFor(type, expression, env)) {
            return node;
        }

        return new PrintNode(null, {content: this.getEscapedFilter(type, expression)}, node.location);
    }

    private preEscapeFilterNode(filter: FilterExpressionNode, env: Environment) {
        let name = filter.attributes.name;
        let type = env.getFilter(name).getPreEscape();

        if (type === null) {
            return filter;
        }

        let node = filter.edges.node;

        if (this.isSafeFor(type, node, env)) {
            return filter;
        }

        filter.edges.node = this.getEscapedFilter(type, node);

        return filter;
    }

    private isSafeFor(type: Node | string | false, expression: Node, env: Environment) {
        let safe = this._safeAnalysis.getSafe(expression);

        if (!safe) {
            if (!this.traverser) {
                this.traverser = new NodeTraverser(env, [this._safeAnalysis]);
            }

            this._safeAnalysis.setSafeVars(this.safeVars);

            this.traverser.traverse(expression);

            safe = this._safeAnalysis.getSafe(expression);
        }

        return (safe.includes(type)) || (safe.includes('all'));
    }

    /**
     * @returns string | Function | false
     */
    private needEscaping() {
        if (this.statusStack.length) {
            return this.statusStack[this.statusStack.length - 1];
        }

        return this.defaultStrategy ? this.defaultStrategy : false;
    }

    private getEscapedFilter(type: any, node: Node) {
        const location = node.location;

        let name = 'escape';

        // todo: useful for what?
        //nodes.set('2', new ConstantExpressionNode({value: true}, null, location));

        let filterArguments = new ArgumentsExpressionNode({}, {
            '0': new ArgumentExpressionNode(null, {
                value: new ConstantExpressionNode({value: type}, null, location),
            }, location),
            '1': new ArgumentExpressionNode(null, {
                value: new ConstantExpressionNode({value: null}, null, location),
            }, location)
        }, location);

        return new FilterExpressionNode({name}, {node, arguments: filterArguments}, location);
    }

    get priority(): number {
        return 0;
    }
}
