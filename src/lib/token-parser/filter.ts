import {TokenParser} from "../token-parser";
import {Node} from "../node";
import {BlockReferenceExpressionNode} from "../node/expression/block-reference";
import {ConstantExpressionNode} from "../node/expression/constant";
import {BlockNode} from "../node/block";
import {PrintNode} from "../node/print";
import {Token, TokenType} from "twig-lexer";

/**
 * Filters a section of a template by applying filters.
 *
 * <pre>
 * {% filter upper %}
 *  This text becomes uppercase
 * {% endfilter %}
 * </pre>
 */
export class FilterTokenParser extends TokenParser {
    parse(token: Token): Node {
        let stream = this.parser.getStream();
        let line = token.line;
        let column = token.column;

        console.warn(`The "filter" tag in "${stream.source.name}" at line ${line} is deprecated since Twig 2.9, use the "apply" tag instead.`);

        let name = this.parser.getVarName();
        let ref = new BlockReferenceExpressionNode(null, {
            name: new ConstantExpressionNode({value: name}, null, {line, column})
        }, {
            line,
            column
        }, this.tag);
        let filter = this.parser.parseFilterExpressionRaw(ref, this.tag);

        stream.expect(TokenType.TAG_END);

        let body = this.parser.subparse([this, this.decideBlockEnd], true);

        stream.expect(TokenType.TAG_END);

        let block = new BlockNode({name}, {body}, {line, column});

        this.parser.setBlock(name, block);

        return new PrintNode(null, {content: filter}, {line, column}, this.tag);
    }

    decideBlockEnd(token: Token) {
        return token.test(TokenType.NAME, 'endfilter');
    }

    get tag(): string {
        return 'filter';
    }
}
