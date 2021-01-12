import {TwingExtensionInterface} from "./extension-interface";
import {TokenParserInterface} from "./token-parser-interface";
import {TwingNodeVisitorInterface} from "./node-visitor-interface";
import {Filter} from "./filter";
import {Function} from "./function";
import {Test} from "./test";
import {Operator} from "./operator";
import {TwingSourceMapNodeFactory} from "./source-map/node-factory";

export class TwingExtension implements TwingExtensionInterface {
    getTokenParsers(): Array<TokenParserInterface> {
        return [];
    }

    getNodeVisitors(): TwingNodeVisitorInterface[] {
        return [];
    }

    getFilters(): Filter[] {
        return [];
    }

    getTests(): Test[] {
        return [];
    }

    getFunctions(): Function[] {
        return [];
    }

    getOperators(): Operator<any>[] {
        return [];
    }

    getSourceMapNodeFactories(): Map<string, TwingSourceMapNodeFactory> {
        return new Map();
    }
}
