/**
 * Tests a condition.
 *
 * <pre>
 * {% if users %}
 *  <ul>
 *    {% for user in users %}
 *      <li>{{ user.username|e }}</li>
 *    {% endfor %}
 *  </ul>
 * {% endif %}
 * </pre>
 */
import {TokenParser} from "../token-parser";
import {Node, toNodeEdges} from "../node";
import {IfNode} from "../node/if";
import {Token, TokenType} from "twig-lexer";

import type {IfNodeTestNode} from "../node/if";

export class IfTokenParser extends TokenParser {
    parse(token: Token) {
        let expr = this.parser.parseExpression();
        let stream = this.parser.getStream();

        stream.expect(TokenType.TAG_END);

        let index = 0;
        let body = this.parser.subparse([this, this.decideIfFork]);
        let tests: Map<string, IfNodeTestNode> = new Map([
            [`${index++}`, new Node(null, {
                condition: expr,
                body
            }, token)]
        ]);

        let elseNode = null;

        let end = false;

        while (!end) {
            switch (stream.next().value) {
                case 'else':
                    stream.expect(TokenType.TAG_END);
                    elseNode = this.parser.subparse([this, this.decideIfEnd]);
                    break;

                case 'elseif':
                    expr = this.parser.parseExpression();
                    stream.expect(TokenType.TAG_END);
                    body = this.parser.subparse([this, this.decideIfFork]);
                    tests.set(`${index++}`, new Node(null, {
                        condition: expr,
                        body
                    }, token));
                    break;

                case 'endif':
                    end = true;
                    break;
            }
        }

        stream.expect(TokenType.TAG_END);

        return new IfNode(null, {
            tests: new Node(null, toNodeEdges(tests), token),
            else: elseNode
        }, token, this.tag);
    }

    decideIfFork(token: Token) {
        return token.test(TokenType.NAME, ['elseif', 'else', 'endif']);
    }

    decideIfEnd(token: Token) {
        return token.test(TokenType.NAME, 'endif');
    }

    get tag(): string {
        return 'if';
    }
}
