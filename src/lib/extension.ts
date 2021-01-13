import {ExtensionInterface} from "./extension-interface";
import {TokenParserInterface} from "./token-parser-interface";
import {NodeVisitorInterface} from "./node-visitor-interface";
import {Filter} from "./filter";
import {Function} from "./function";
import {Test} from "./test";
import {Operator} from "./operator";
import {SourceMapNodeFactory} from "./source-map/node-factory";

export class Extension implements ExtensionInterface {
    getTokenParsers(): Array<TokenParserInterface> {
        return [];
    }

    getNodeVisitors(): NodeVisitorInterface[] {
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

    getSourceMapNodeFactories(): Map<string, SourceMapNodeFactory> {
        return new Map();
    }
}
