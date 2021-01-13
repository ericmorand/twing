import {TokenParser} from "../token-parser";
import {Node, toNodeEdges} from "../node";
import {SyntaxError} from "../error/syntax";

import {BlockNode} from "../node/block";
import {PrintNode} from "../node/print";
import {BlockReferenceNode} from "../node/block-reference";
import {Token, TokenType} from "twig-lexer";

/**
 * Marks a section of a template as being reusable.
 *
 * <pre>
 *  {% block head %}
 *    <link rel="stylesheet" href="style.css" />
 *    <title>{% block title %}{% endblock %} - My Webpage</title>
 *  {% endblock %}
 * </pre>
 */
export class BlockTokenParser extends TokenParser {
    parse(token: Token): Node {
        const {line, column} = token;
        const stream = this.parser.getStream();
        const name = stream.expect(TokenType.NAME).value;

        if (this.parser.hasBlock(name)) {
            const {line, column} = this.parser.getBlock(name).location;

            throw new SyntaxError(`The block '${name}' has already been defined line ${line}, column ${column}.`, null, stream.getCurrent(), stream.source);
        }

        let block = new BlockNode({
            name
        }, {
            body: new Node(null, null, token)
        }, token, this.tag);

        this.parser.setBlock(name, block);
        this.parser.pushLocalScope();
        this.parser.pushBlockStack(name);

        let body: Node;

        if (stream.nextIf(TokenType.TAG_END)) {
            body = this.parser.subparse([this, this.decideBlockEnd], true);

            let token = stream.nextIf(TokenType.NAME);

            if (token) {
                let value = token.value;

                if (value != name) {
                    throw new SyntaxError(`Expected endblock for block "${name}" (but "${value}" given).`, null, stream.getCurrent(), stream.source);
                }
            }
        } else {
            let nodes: Map<string, PrintNode> = new Map();

            nodes.set('0', new PrintNode(null, {content: this.parser.parseExpression()}, {line, column}));

            body = new Node(null, toNodeEdges(nodes), {line, column});
        }

        stream.expect(TokenType.TAG_END);

        block = new BlockNode({
            name
        }, {
            body: body
        }, token, this.tag);

        this.parser.setBlock(name, block);
        this.parser.popBlockStack();
        this.parser.popLocalScope();

        return new BlockReferenceNode({name}, null, {line, column}, this.tag);
    }

    decideBlockEnd(token: Token) {
        return token.test(TokenType.NAME, 'endblock');
    }

    get tag(): string {
        return 'block';
    }
}
