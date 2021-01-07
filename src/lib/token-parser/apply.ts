import {TwingTokenParser} from "../token-parser";
import {toAnonymousNodes, TwingNode} from "../node";
import {TwingNodePrint} from "../node/print";
import {TwingNodeSet} from "../node/set";
import {TwingNodeExpressionTempName} from "../node/expression/temp-name";
import {Token, TokenType} from "twig-lexer";

/**
 * Applies filters on a section of a template.
 *
 *   {% apply upper %}
 *      This text becomes uppercase
 *   {% endapply %}
 */
export class TwingTokenParserApply extends TwingTokenParser {
    parse(token: Token): TwingNode {
        const {line, column} = token;
        const name = this.parser.getVarName();

        let ref: TwingNodeExpressionTempName;

        ref = new TwingNodeExpressionTempName(null, {
            value: name,
            declaration: false
        }, line, column);
        // todo: is this used somewhere?
        //ref.setAttribute('always_defined', true);

        let filter = this.parser.parseFilterExpressionRaw(ref, this.getTag());

        this.parser.getStream().expect(TokenType.TAG_END);

        let body = this.parser.subparse([this, this.decideBlockEnd], true);

        this.parser.getStream().expect(TokenType.TAG_END);

        let nodes: Map<string, TwingNode> = new Map();

        ref = new TwingNodeExpressionTempName(null, {
            value: name,
            declaration: false
        }, line, column);

        nodes.set('0', new TwingNodeSet(true, ref, body, line, column, this.getTag()));
        nodes.set('1', new TwingNodePrint(filter, line, column, this.getTag()));

        return new TwingNode(toAnonymousNodes(nodes), null, line, column);
    }

    decideBlockEnd(token: Token) {
        return token.test(TokenType.NAME, 'endapply');
    }

    getTag() {
        return 'apply';
    }
}
