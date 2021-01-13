/* istanbul ignore next */

/**
 * Interface implemented by extension classes.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
import {TokenParserInterface} from "./token-parser-interface";
import {NodeVisitorInterface} from "./node-visitor-interface";
import {Filter} from "./filter";
import {Function} from "./function";
import {Test} from "./test";
import {Operator} from "./operator";
import {SourceMapNodeFactory} from "./source-map/node-factory";

export interface ExtensionInterface {
    /**
     * Returns the token parser instances to add to the existing list.
     *
     * @return Array<TokenParserInterface>
     */
    getTokenParsers(): Array<TokenParserInterface>;

    /**
     * Returns the node visitor instances to add to the existing list.
     *
     * @return Array<NodeVisitorInterface>
     */
    getNodeVisitors(): Array<NodeVisitorInterface>;

    /**
     * Returns a list of filters to add to the existing list.
     *
     * @return Array<Filter>
     */
    getFilters(): Filter[];

    /**
     * Returns a list of tests to add to the existing list.
     *
     * @returns Array<Test>
     */
    getTests(): Test[];

    /**
     * Returns a list of functions to add to the existing list.
     *
     * @return Array<Function>
     */
    getFunctions(): Function[];

    /**
     * Returns a list of operators to add to the existing list.
     *
     * @return Operator[]
     */
    getOperators(): Operator<any>[];

    /**
     * Returns a list of factories that will be used to construct the source-map nodes.
     */
    getSourceMapNodeFactories(): Map<string, SourceMapNodeFactory>;
}
