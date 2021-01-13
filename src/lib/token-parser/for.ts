/**
 * Loops over each item of a sequence.
 *
 * <pre>
 * <ul>
 *  {% for user in users %}
 *    <li>{{ user.username|e }}</li>
 *  {% endfor %}
 * </ul>
 * </pre>
 */
import {TokenParser} from "../token-parser";
import {Node} from "../node";
import {SyntaxError} from "../error/syntax";
import {TokenStream} from "../token-stream";
import {AssignNameExpressionNode} from "../node/expression/assign-name";
import {ForNode} from "../node/for";
import {Token, TokenType} from "twig-lexer";
import {GetAttributeExpressionNode} from "../node/expression/get-attribute";
import {NameExpressionNode} from "../node/expression/name";
import {ConstantExpressionNode} from "../node/expression/constant";

export class ForTokenParser extends TokenParser {
    parse(token: Token) {
        let line = token.line;
        let column = token.column;
        let stream = this.parser.getStream();
        let targets = [...this.parser.parseAssignmentExpression()].map(([, target]) => target);

        stream.expect(TokenType.OPERATOR, 'in');

        let sequence = this.parser.parseExpression();

        let condition = null;

        if (stream.nextIf(TokenType.NAME, 'if')) {
            console.warn(`Using an "if" condition on "for" tag in "${stream.source.name}" at line ${line} is deprecated since Twig 2.10.0, use a "filter" filter or an "if" condition inside the "for" body instead (if your condition depends on a variable updated inside the loop).`);

            condition = this.parser.parseExpression();
        }

        stream.expect(TokenType.TAG_END);

        let body = this.parser.subparse([this, this.decideForFork]);
        let elseNode: Node;

        if (stream.next().value == 'else') {
            stream.expect(TokenType.TAG_END);
            elseNode = this.parser.subparse([this, this.decideForEnd], true);
        } else {
            elseNode = null;
        }

        stream.expect(TokenType.TAG_END);

        let targetKey: AssignNameExpressionNode;
        let targetValue: AssignNameExpressionNode;

        if ((targets.length) > 1) {
            targetKey = new AssignNameExpressionNode({
                value: targets[0].attributes.value
            }, null, targets[0].location);

            targetValue = new AssignNameExpressionNode({
                value: targets[1].attributes.value
            }, null, targets[1].location);
        } else {
            targetKey = new AssignNameExpressionNode({
                value: '_key'
            }, null, targets[0].location);

            targetValue = new AssignNameExpressionNode({
                value: targets[0].attributes.value
            }, null, targets[0].location);
        }

        if (condition) {
            this.checkLoopUsageCondition(stream, condition);
            this.checkLoopUsageBody(stream, body);
        }

        return new ForNode({
            withLoop: true
        }, {
            targetKey,
            targetValue,
            body,
            else: elseNode,
            sequence,
            condition
        }, {line, column}, this.tag);
    }

    decideForFork(token: Token) {
        return token.test(TokenType.NAME, ['else', 'endfor']);
    }

    decideForEnd(token: Token) {
        return token.test(TokenType.NAME, 'endfor');
    }

    // the loop variable cannot be used in the condition
    checkLoopUsageCondition(stream: TokenStream, node: Node) {
        if ((node instanceof GetAttributeExpressionNode) && (node.edges.object instanceof NameExpressionNode) && (node.edges.object.attributes.value === 'loop')) {
            throw new SyntaxError('The "loop" variable cannot be used in a looping condition.', null, node.location, stream.source);
        }

        for (let [, subNode] of node) {
            this.checkLoopUsageCondition(stream, subNode);
        }
    }

    // check usage of non-defined loop-items

    get tag(): string {
        return 'for';
    }

    // it does not catch all problems (for instance when a for is included into another or when the variable is used in an include)
    private checkLoopUsageBody(stream: TokenStream, node: Node) {
        if ((node instanceof GetAttributeExpressionNode) && (node.edges.object instanceof NameExpressionNode) && (node.edges.object.attributes.value === 'loop')) {
            let attribute = node.edges.attribute;

            if ((attribute instanceof ConstantExpressionNode) && (['length', 'revindex0', 'revindex', 'last'].includes(attribute.attributes.value))) {
                throw new SyntaxError(`The "loop.${attribute.attributes.value}" variable is not defined when looping with a condition.`, null, node.location, stream.source);
            }
        }

        // should check for parent.loop.XXX usage
        if (node instanceof ForNode) {
            return;
        }

        for (let [, subNode] of node) {
            this.checkLoopUsageBody(stream, subNode);
        }
    }
}
