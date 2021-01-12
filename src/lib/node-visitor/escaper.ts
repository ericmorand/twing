// import {TwingBaseNodeVisitor} from "../base-node-visitor";
// import {Node} from "../node";
// import {TwingEnvironment} from "../environment";
// import {TwingNodeVisitorSafeAnalysis} from "./safe-analysis";
// import {NodeTraverser} from "../node-traverser";
// import {ConstantExpressionNode} from "../node/expression/constant";
// import {ExpressionNode} from "../node/expression";
// import {FilterExpressionNode} from "../node/expression/filter";
// import {PrintNode} from "../node/print";
// import {DoNode} from "../node/do";
// import {ConditionalExpressionNode} from "../node/expression/conditional";
// import {TwingNodeInlinePrint} from "../node/inline-print";
// import {type as moduleType} from "../node/module";
// import {AutoEscapeNode} from "../node/auto-escape";
// import {type as blockType} from "../node/block";
// import {type as blockReferenceType} from "../node/block-reference";
// import {type as importType} from "../node/import";
// import {type as printType} from "../node/print";
// import {type as filterType} from "../node/expression/filter";
// import {type as conditionalType} from "../node/expression/conditional";
//
// export class TwingNodeVisitorEscaper extends TwingBaseNodeVisitor {
//     private statusStack: Array<Node | string | false> = [];
//     private blocks: Map<string, any> = new Map();
//     private safeAnalysis: TwingNodeVisitorSafeAnalysis;
//     private traverser: NodeTraverser;
//     private defaultStrategy: string | false = false;
//     private safeVars: Array<Node> = [];
//
//     constructor() {
//         super();
//
//         this.TwingNodeVisitorInterfaceImpl = this;
//
//         this.safeAnalysis = new TwingNodeVisitorSafeAnalysis();
//     }
//
//     protected doEnterNode(node: Node, env: TwingEnvironment): Node {
//         if (node.is(moduleType)) {
//             this.defaultStrategy = env.getCoreExtension().getDefaultStrategy(node.getTemplateName());
//             this.safeVars = [];
//             this.blocks = new Map();
//         } else if (node instanceof AutoEscapeNode) {
//             this.statusStack.push(node.getAttribute('value'));
//         } else if (node.is(blockType)) {
//             this.statusStack.push(this.blocks.has(node.getAttribute('name')) ? this.blocks.get(node.getAttribute('name')) : this.needEscaping());
//         } else if (node.is(importType)) {
//             this.safeVars.push(node.getNode('var').getAttribute('name'));
//         }
//
//         return node;
//     }
//
//     protected doLeaveNode(node: Node, env: TwingEnvironment): Node {
//         if (node.is(moduleType)) {
//             this.defaultStrategy = false;
//             this.safeVars = [];
//             this.blocks = new Map();
//         } else if (node.is(filterType)) {
//             return this.preEscapeFilterNode(node as FilterExpressionNode, env);
//         } else if (node.is(printType)) {
//             let type = this.needEscaping();
//
//             if (type !== false) {
//                 let expression: ExpressionNode = node.getNode('expr');
//
//                 if ((expression.is(conditionalType)) && this.shouldUnwrapConditional(expression, env, type)) {
//                     return new DoNode(this.unwrapConditional(expression, env, type), expression.getLine(), expression.getColumn());
//                 }
//
//                 return this.escapePrintNode(node as any, env, type);
//             }
//         }
//
//         if (node.is(autoEscapeType) || node.is(blockType)) {
//             this.statusStack.pop();
//         } else if (node.is(blockReferenceType)) {
//             this.blocks.set(node.getAttribute('name'), this.needEscaping());
//         }
//
//         return node;
//     }
//
//     private shouldUnwrapConditional(expression: ConditionalExpressionNode, env: TwingEnvironment, type: any) {
//         let expr2Safe = this.isSafeFor(type, expression.getNode('expr2'), env);
//         let expr3Safe = this.isSafeFor(type, expression.getNode('expr3'), env);
//
//         return expr2Safe !== expr3Safe;
//     }
//
//     private unwrapConditional(expression: ConditionalExpressionNode, env: TwingEnvironment, type: any): ConditionalExpressionNode {
//         // convert "echo a ? b : c" to "a ? echo b : echo c" recursively
//         let expr2: ExpressionNode = expression.getNode('expr2');
//
//         if ((expr2.is(conditionalType)) && this.shouldUnwrapConditional(expr2, env, type)) {
//             expr2 = this.unwrapConditional(expr2, env, type);
//         } else {
//             expr2 = this.escapeInlinePrintNode(new TwingNodeInlinePrint(expr2, expr2.getLine(), expr2.getColumn()), env, type);
//         }
//
//         let expr3: ExpressionNode = expression.getNode('expr3');
//
//         if ((expr3.is(conditionalType)) && this.shouldUnwrapConditional(expr3, env, type)) {
//             expr3 = this.unwrapConditional(expr3, env, type);
//         } else {
//             expr3 = this.escapeInlinePrintNode(new TwingNodeInlinePrint(expr3, expr3.getLine(), expr3.getColumn()), env, type);
//         }
//
//         return new ConditionalExpressionNode(expression.getNode('expr1'), expr2, expr3, expression.getLine(), expression.getColumn());
//     }
//
//     private escapeInlinePrintNode(node: TwingNodeInlinePrint, env: TwingEnvironment, type: any): Node {
//         let expression: Node = node.getNode('node');
//
//         if (this.isSafeFor(type, expression, env)) {
//             return node;
//         }
//
//         return new TwingNodeInlinePrint(this.getEscaperFilter(type, expression), node.getLine(), node.getColumn());
//     }
//
//     private escapePrintNode(node: PrintNode, env: TwingEnvironment, type: any) {
//         let expression = node.getNode('expr');
//
//         if (this.isSafeFor(type, expression, env)) {
//             return node;
//         }
//
//         return new PrintNode(this.getEscaperFilter(type, expression), node.getLine(), node.getColumn());
//     }
//
//     private preEscapeFilterNode(filter: FilterExpressionNode, env: TwingEnvironment) {
//         let name = filter.getNode('filter').getAttribute('value');
//
//         let type = env.getFilter(name).getPreEscape();
//
//         if (type === null) {
//             return filter;
//         }
//
//         let node = filter.getNode('node');
//
//         if (this.isSafeFor(type, node, env)) {
//             return filter;
//         }
//
//         filter.setNode('node', this.getEscaperFilter(type, node));
//
//         return filter;
//     }
//
//     private isSafeFor(type: Node | string | false, expression: Node, env: TwingEnvironment) {
//         let safe = this.safeAnalysis.getSafe(expression);
//
//         if (!safe) {
//             if (!this.traverser) {
//                 this.traverser = new NodeTraverser(env, [this.safeAnalysis]);
//             }
//
//             this.safeAnalysis.setSafeVars(this.safeVars);
//
//             this.traverser.traverse(expression);
//
//             safe = this.safeAnalysis.getSafe(expression);
//         }
//
//         return (safe.includes(type)) || (safe.includes('all'));
//     }
//
//     /**
//      * @returns string | Function | false
//      */
//     private needEscaping() {
//         if (this.statusStack.length) {
//             return this.statusStack[this.statusStack.length - 1];
//         }
//
//         return this.defaultStrategy ? this.defaultStrategy : false;
//     }
//
//     private getEscaperFilter(type: any, node: Node) {
//         let line = node.getLine();
//         let column = node.getColumn();
//
//         let nodes = new Map();
//
//         let name = new ConstantExpressionNode('escape', line, column);
//
//         nodes.set(0, new ConstantExpressionNode(type, line, column));
//         nodes.set(1, new ConstantExpressionNode(null, line, column));
//         nodes.set(2, new ConstantExpressionNode(true, line, column));
//
//         let nodeArgs = new Node(nodes);
//
//         return new FilterExpressionNode(node, name, nodeArgs, line, column);
//     }
//
//     public getPriority() {
//         return 0;
//     }
// }
