import {BaseNodeVisitor} from "../base-node-visitor";
import {Environment} from "../environment";
import {Edges, Node, NodeEdges, toNodeEdges} from "../node";
import {CheckSecurityNode} from "../node/check-security";
import {CheckToStringNode} from "../node/check-to-string";
import {TemplateNode} from "../node/template";
import {FilterExpressionNode} from "../node/expression/filter";
import {FunctionExpressionNode} from "../node/expression/function";
import {RangeBinaryExpressionNode} from "../node/expression/binary/range";
import {PrintNode} from "../node/print";
import {SetNode} from "../node/set";
import {ConcatBinaryExpressionNode} from "../node/expression/binary/concat";
import {NameExpressionNode} from "../node/expression/name";
import {GetAttributeExpressionNode} from "../node/expression/get-attribute";

export class SandboxNodeVisitor extends BaseNodeVisitor {
    private tags: Map<string, Node>;
    private filters: Map<string, Node>;
    private functions: Map<string, Node>;
    private needsToStringWrap: boolean;

    protected doEnterNode(node: Node, env: Environment): Node {
        if (!env.isSandboxed()) {
            return node;
        }

        if (node instanceof TemplateNode) {
            this.tags = new Map();
            this.filters = new Map();
            this.functions = new Map();

            return node;
        } else {
            // look for tags
            if (node.tag && !(this.tags.has(node.tag))) {
                this.tags.set(node.tag, node);
            }

            // look for filters
            if ((node instanceof FilterExpressionNode) && !this.filters.has(node.attributes.name)) {
                this.filters.set(node.attributes.name, node);
            }

            // look for functions
            if ((node instanceof FunctionExpressionNode) && !this.functions.has(node.attributes.name)) {
                this.functions.set(node.attributes.name, node);
            }

            // the .. operator is equivalent to the range() function
            if ((node instanceof RangeBinaryExpressionNode) && !(this.functions.has('range'))) {
                this.functions.set('range', node);
            }

            // wrap print to check toString() calls
            if (node instanceof PrintNode) {
                this.needsToStringWrap = true;
                this.wrapNode(node, 'content');
            }

            if ((node instanceof SetNode) && !node.attributes.capture) {
                this.needsToStringWrap = true;
            }

            // wrap outer nodes that can implicitly call toString()
            if (this.needsToStringWrap) {
                if (node instanceof ConcatBinaryExpressionNode) {
                    this.wrapNode(node, 'left');
                    this.wrapNode(node, 'right');
                }

                if (node instanceof FilterExpressionNode) {
                    this.wrapNode(node, 'node');
                    this.wrapArrayNode(node, 'arguments');
                }

                if (node instanceof FunctionExpressionNode) {
                    this.wrapArrayNode(node, 'arguments');
                }
            }
        }

        return node;
    }

    protected doLeaveNode(node: Node, env: Environment): Node {
        if (!env.isSandboxed()) {
            return node;
        }

        if (node instanceof TemplateNode) {
            let nodes: Map<string, Node> = new Map();
            let i: number = 0;

            nodes.set(`${i++}`, new CheckSecurityNode({
                usedFilters: this.filters,
                usedTags: this.tags,
                usedFunctions: this.functions
            }, null, node.location));

            nodes.set(`${i++}`, node.edges.displayStart);

            node.edges.constructorEnd = new Node(null, {
                constructorEnd: node.edges.constructorEnd,
                securityCheck: new Node(null, toNodeEdges(nodes), node.location)
            }, node.location);
        } else {
            if (node instanceof PrintNode || node instanceof SetNode) {
                this.needsToStringWrap = false;
            }
        }

        return node;
    }

    private wrapNode<T extends Node<any, NodeEdges>>(node: T, name: keyof Edges<T> & string) {
        let expr = node.edges[name];

        if (expr instanceof NameExpressionNode || expr instanceof GetAttributeExpressionNode) {
            node.edges[name] = new CheckToStringNode(null, {expression: expr}, node.location);
        }
    }

    private wrapArrayNode<T extends Node>(node: T, name: keyof Edges<T>) {
        let args: Node = node.edges[name];

        for (let [name] of args) {
            this.wrapNode(args, name);
        }
    }

    get priority(): number {
        return 0;
    }
}
