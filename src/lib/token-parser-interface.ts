/* istanbul ignore next */

import {Parser} from "./parser";
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
    setParser(parser: Parser): void;

    /**
     * Parses a token and returns a node.
     */
    parse(token: Token): Node;

    /**
     * Gets the tag name associated with this token parser.
     */
    tag: string;
}
