import {Parser} from "../../src/lib/parser";
import {NodeEnvironment} from "../../src/lib/environment/node";
import {NullLoader} from "../../src/lib/loader/null";
import {TokenStream} from "../../src/lib/token-stream";
import {Node} from "../../src/lib/node";
import {ExpressionNode} from "../../src/lib/node/expression";

const sinon = require('sinon');

class Parser extends Parser {
    constructor() {
        super(new NodeEnvironment(new NullLoader()));
    }

    parseExpression(precedence: number = 0, allowArrow: boolean = false): ExpressionNode {
        return null;
    }

    parseAssignmentExpression(): Node {
        return null;
    }

    parseMultiTargetExpression(): Node {
        return null;
    }
}

export function getParser(stream: TokenStream): Parser {
    let parser = new Parser();

    Reflect.set(parser, 'stream', stream);
    Reflect.set(parser, 'handlers', new Map());

    sinon.stub(parser, 'hasBlock').returns(false);
    sinon.stub(parser, 'setBlock').returns(false);
    sinon.stub(parser, 'pushLocalScope').returns(false);
    sinon.stub(parser, 'pushBlockStack').returns(false);

    return parser;
}
