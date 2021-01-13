import {TokenParser} from "../token-parser";
import {toNodeEdges, Node} from "../node";
import {PrintNode} from "../node/print";
import {SetNode} from "../node/set";
import {TempNameExpressionNode} from "../node/expression/temp-name";
import {Token, TokenType} from "twig-lexer";

/**
 * Applies filters on a section of a template.
 *
 *   {% apply upper %}
 *      This text becomes uppercase
 *   {% endapply %}
 */
export class ApplyTokenParser extends TokenParser {
    parse(token: Token): Node {
        const {line, column} = token;
        const name = this.parser.getVarName();

        let ref: TempNameExpressionNode;

        ref = new TempNameExpressionNode({
            value: name,
            declaration: false
        }, null, token);
        // todo: is this used somewhere?
        //ref.setAttribute('always_defined', true);

        let filter = this.parser.parseFilterExpressionRaw(ref, this.tag);

        this.parser.getStream().expect(TokenType.TAG_END);

        let body = this.parser.subparse([this, this.decideBlockEnd], true);

        this.parser.getStream().expect(TokenType.TAG_END);

        let nodes: Map<string, Node> = new Map();

        ref = new TempNameExpressionNode({
            value: name,
            declaration: false
        }, null, token);

        nodes.set('0', new SetNode({capture: true}, {
            names: ref,
            values: body
        }, token, this.tag));
        nodes.set('1', new PrintNode(null, {content: filter}, token, this.tag));

        return new Node(toNodeEdges(nodes), null, token);
    }

    decideBlockEnd(token: Token) {
        return token.test(TokenType.NAME, 'endapply');
    }

    get tag(): string {
        return 'apply';
    }
}
