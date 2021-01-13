import {BaseNodeVisitor} from "../base-node-visitor";
import {Node} from "../node";
import {Environment} from "../environment";
import {FilterExpressionNode} from "../node/expression/filter";
import {FunctionExpressionNode} from "../node/expression/function";
import {ConstantExpressionNode} from "../node/expression/constant";
import {ParentExpressionNode} from "../node/expression/parent";
import {ConditionalExpressionNode} from "../node/expression/conditional";
import {BlockReferenceNode} from "../node/block-reference";
import {CallExpressionNode} from "../node/expression/call";
import {GetAttributeExpressionNode} from "../node/expression/get-attribute";
import {NameExpressionNode} from "../node/expression/name";

const objectHash = require('object-hash');

interface Bucket {
    key: any,
    value: Array<string>
}

export class SafeAnalysisNodeVisitor extends BaseNodeVisitor {
    private data: Map<string, Array<Bucket>> = new Map();
    private safeVars: Array<string> = [];

    setSafeVars(safeVars: Array<any>) {
        this.safeVars = safeVars;
    }

    /**
     *
     * @param {Node} node
     * @returns {Array<string>}
     */
    getSafe(node: Node): Array<Node | string | false> {
        let hash = objectHash(node);

        if (!this.data.has(hash)) {
            return;
        }

        let bucket = this.data.get(hash).find(function (bucket: Bucket) {
            if (bucket.key === node) {
                if (bucket.value.includes('html_attr')) {
                    bucket.value.push('html');
                }

                return true;
            }
        });

        return bucket ? bucket.value : null;
    }

    private setSafe(node: Node, safe: Array<string>) {
        let hash = objectHash(node);
        let bucket = null;

        if (this.data.has(hash)) {
            bucket = this.data.get(hash).find(function (bucket: Bucket) {
                if (bucket.key === node) {
                    bucket.value = safe;

                    return true;
                }
            });
        }

        if (!bucket) {
            if (!this.data.has(hash)) {
                this.data.set(hash, []);
            }

            this.data.get(hash).push({
                key: node,
                value: safe
            });
        }
    }

    protected doEnterNode(node: Node, env: Environment): Node {
        return node;
    }

    protected doLeaveNode(node: Node, env: Environment): Node {
        if (node instanceof ConstantExpressionNode) {
            // constants are marked safe for all
            this.setSafe(node, ['all']);
        } else if (node instanceof BlockReferenceNode) {
            // blocks are safe by definition
            this.setSafe(node, ['all']);
        } else if (node instanceof ParentExpressionNode) {
            // parent block is safe by definition
            this.setSafe(node, ['all']);
        } else if (node instanceof ConditionalExpressionNode) {
            // intersect safeness of both operands
            let safe = this.intersectSafe(this.getSafe(node.edges.expr2), this.getSafe(node.edges.expr3));
            this.setSafe(node, safe);
        } else if (node instanceof FilterExpressionNode) {
            // filter expression is safe when the filter is safe
            let name = node.attributes.name;
            let filterArguments = node.edges.arguments;
            let filter = env.getFilter(name);

            if (filter) {
                let safe = filter.isSafe(filterArguments);

                if (safe.length < 1) {
                    safe = this.intersectSafe(this.getSafe(node.edges.node), filter.getPreservesSafety());
                }

                this.setSafe(node, safe);
            } else {
                this.setSafe(node, []);
            }
        } else if (node instanceof FunctionExpressionNode) {
            // function expression is safe when the function is safe
            let name = node.attributes.name;
            let functionArguments = node.edges.arguments;
            let functionNode = env.getFunction(name);

            if (functionNode) {
                this.setSafe(node, functionNode.isSafe(functionArguments));
            } else {
                this.setSafe(node, []);
            }
        } else if (node instanceof CallExpressionNode) {
            if (node.attributes.isSafe) {
                this.setSafe(node, ['all']);
            } else {
                this.setSafe(node, []);
            }
        } else if ((node instanceof GetAttributeExpressionNode) && (node.edges.object instanceof NameExpressionNode)) {
            let name = node.edges.object.attributes.value;

            if (this.safeVars.includes(name)) {
                this.setSafe(node, ['all']);
            } else {
                this.setSafe(node, []);
            }
        } else {
            this.setSafe(node, []);
        }

        return node;
    }

    private intersectSafe(a: Array<any>, b: Array<any>) {
        if (a === null || b === null) {
            return [];
        }

        if (a.includes('all')) {
            return b;
        }

        if (b.includes('all')) {
            return a;
        }

        // array_intersect
        return a.filter(function (n) {
            return b.includes(n);
        });
    }

    get priority(): number {
        return 0;
    }
}
