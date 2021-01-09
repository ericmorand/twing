import {TwingTokenParser} from "../token-parser";
import {Node} from "../node";
import {SyntaxError} from "../error/syntax";

import {TwingNodeBlock} from "../node/block";
import {TwingNodePrint} from "../node/print";
import {TwingNodeBlockReference} from "../node/block-reference";
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
export class TwingTokenParserBlock extends TwingTokenParser {
    parse(token: Token): Node {
        const {line, column} = token;
        const stream = this.parser.getStream();
        const name = stream.expect(TokenType.NAME).value;

        if (this.parser.hasBlock(name)) {
            throw new SyntaxError(`The block '${name}' has already been defined line ${this.parser.getBlock(name).getLine()}.`, stream.getCurrent().line, stream.getSourceContext());
        }

        let block = new TwingNodeBlock(name, new Node(new Map()), line, column);

        this.parser.setBlock(name, block);
        this.parser.pushLocalScope();
        this.parser.pushBlockStack(name);

        let body;

        if (stream.nextIf(TokenType.TAG_END)) {
            body = this.parser.subparse([this, this.decideBlockEnd], true);

            let token = stream.nextIf(TokenType.NAME);

            if (token) {
                let value = token.value;

                if (value != name) {
                    throw new SyntaxError(`Expected endblock for block "${name}" (but "${value}" given).`, stream.getCurrent().line, stream.getSourceContext());
                }
            }
        }
        else {
            let nodes = new Map();

            nodes.set(0, new TwingNodePrint(this.parser.parseExpression(), line, column));

            body = new Node(nodes);
        }

        stream.expect(TokenType.TAG_END);

        block.setNode('body', body);

        this.parser.popBlockStack();
        this.parser.popLocalScope();

        return new TwingNodeBlockReference(name, line, column, this.getTag());
    }

    decideBlockEnd(token: Token) {
        return token.test(TokenType.NAME, 'endblock');
    }

    getTag() {
        return 'block';
    }
}
