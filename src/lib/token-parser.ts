import {TokenParserInterface} from "./token-parser-interface";
import {Parser} from "./parser";
import {Node} from "./node";
import {Token} from "twig-lexer";

/**
 * Base class for all token parsers.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
export abstract class TokenParser implements TokenParserInterface {
    /**
     * @var TwingParser
     */
    protected parser: Parser;

    abstract parse(token: Token): Node;

    abstract get tag(): string;

    setParser(parser: Parser): void {
        this.parser = parser;
    }
}
