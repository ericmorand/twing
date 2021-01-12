import {TokenParserInterface} from "./token-parser-interface";
import {TwingParser} from "./parser";
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
    protected parser: TwingParser;

    abstract parse(token: Token): Node;

    abstract getTag(): string;

    setParser(parser: TwingParser): void {
        this.parser = parser;
    }
}
