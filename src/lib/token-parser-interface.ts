/* istanbul ignore next */

import {TwingParser} from "./parser";
import {Node} from "./node";
import {Token} from "twig-lexer";

/**
 * Interface implemented by token parsers.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
export interface TokenParserInterface {
    /**
     * Sets the parser associated with this token parser.
     */
    setParser(parser: TwingParser): void;

    /**
     * Parses a token and returns a node.
     *
     * @return Node A TwingNode instance
     *
     * @throws TwingErrorSyntax
     */
    parse(token: Token): Node;

    /**
     * Gets the tag name associated with this token parser.
     *
     * @return string The tag name
     */
    getTag(): string;
}
