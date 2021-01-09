import {TwingEnvironment} from "./environment";
import {TwingTokenStream} from "./token-stream";
import {TwingNodeBlock} from "./node/block";
import {TwingTokenParserInterface} from "./token-parser-interface";
import {TwingNodeVisitorInterface} from "./node-visitor-interface";
import {SyntaxError} from "./error/syntax";
import {toTwingNodeNodes, Node, Location} from "./node";
import {TwingNodeText} from "./node/text";
import {TwingNodePrint} from "./node/print";
import {TwingNodeExpression} from "./node/expression";
import {TwingNodeBody} from "./node/body";
import {TwingNodeModule} from "./node/module";
import {TwingNodeTraverser} from "./node-traverser";
import {TwingNodeMacro} from "./node/macro";
import {TwingTokenParser} from "./token-parser";
import {first} from "./helpers/first";
import {push} from "./helpers/push";
import {CommentNode} from "./node/comment";
import {ctypeSpace} from "./helpers/ctype-space";
import {TwingNodeExpressionConstant} from "./node/expression/constant";
import {TwingNodeExpressionBinaryConcat} from "./node/expression/binary/concat";
import {TwingNodeExpressionAssignName} from "./node/expression/assign-name";
import {TwingNodeExpressionArrowFunction} from "./node/expression/arrow-function";
import {TwingNodeExpressionName} from "./node/expression/name";
import {TwingNodeExpressionParent} from "./node/expression/parent";
import {TwingNodeExpressionBlockReference} from "./node/expression/block-reference";
import {ANY_CALL, ARRAY_CALL, METHOD_CALL, TwingNodeExpressionGetAttribute} from "./node/expression/get-attribute";
import {TwingNodeExpressionArray, TwingNodeExpressionArrayElement} from "./node/expression/array";
import {TwingNodeExpressionMethodCall} from "./node/expression/method-call";
import {TwingNodeExpressionHash, TwingNodeExpressionHashElement} from "./node/expression/hash";
import {TwingTest} from "./test";
import {TwingNodeExpressionUnaryNot} from "./node/expression/unary/not";
import {TwingNodeExpressionConditional} from "./node/expression/conditional";
import {TwingOperator, TwingOperatorAssociativity} from "./operator";
import {namePattern, Token, TokenType} from "twig-lexer";
import {typeToEnglish} from "./lexer";
import {TwingNodeTrait} from "./node/trait";
import {CallableWrapperExpressionFactory, TwingCallableWrapper} from "./callable-wrapper";
import {TwingNodeSpaceless} from "./node/spaceless";
import {TwingNodeBlockReference} from "./node/block-reference";
import {TwingNodeExpressionUnaryNeg} from "./node/expression/unary/neg";
import {TwingNodeExpressionUnaryPos} from "./node/expression/unary/pos";
import {title} from "./extension/core/filters/title";

import type {NodeChildren} from "./node";
import type {CallType} from "./node/expression/get-attribute";

const sha256 = require('crypto-js/sha256');
const hex = require('crypto-js/enc-hex');

class TwingParserStackEntry {
    stream: TwingTokenStream;
    parent: Node;
    blocks: Map<string, TwingNodeBody>;
    blockStack: Array<string>;
    macros: Map<string, Node>;
    importedSymbols: Array<Map<string, Map<string, { name: string, node: TwingNodeExpressionName }>>>;
    traits: Map<string, TwingNodeTrait>;
    embeddedTemplates: Array<TwingNodeModule>;

    constructor(
        stream: TwingTokenStream,
        parent: Node = null,
        blocks: Map<string, TwingNodeBody>,
        blockStack: Array<string>,
        macros: Map<string, Node>,
        importedSymbols: Array<Map<string, Map<string, { name: string, node: TwingNodeExpressionName }>>>,
        traits: Map<string, Node>,
        embeddedTemplates: Array<TwingNodeModule>) {
        this.stream = stream;
        this.parent = parent;
        this.blocks = blocks;
        this.blockStack = blockStack;
        this.macros = macros;
        this.importedSymbols = importedSymbols;
        this.traits = traits;
        this.embeddedTemplates = embeddedTemplates;
    }
}

const nameRegExp = new RegExp(namePattern);

type TwingParserImportedSymbolAlias = {
    name: string,
    node: TwingNodeExpressionName
};
type TwingParserImportedSymbolType = Map<string, TwingParserImportedSymbolAlias>;
type TwingParserImportedSymbol = Map<string, TwingParserImportedSymbolType>;

export class TwingParser {
    private stack: Array<TwingParserStackEntry> = [];
    private stream: TwingTokenStream;
    private parent: Node;
    private handlers: Map<string, TwingTokenParserInterface> = null;
    private visitors: Array<TwingNodeVisitorInterface>;
    private blocks: Map<string, TwingNodeBody>;
    private blockStack: Array<string>;
    private macros: Map<string, Node>;
    private readonly env: TwingEnvironment;
    private importedSymbols: Array<TwingParserImportedSymbol>;
    private traits: Map<string, TwingNodeTrait>;
    private embeddedTemplates: Array<TwingNodeModule> = [];
    private varNameSalt: number = 0;
    private embeddedTemplateIndex: number = 1;
    private unaryOperators: Map<string, TwingOperator>;
    private binaryOperators: Map<string, TwingOperator>;

    constructor(env: TwingEnvironment) {
        this.env = env;
        this.unaryOperators = env.getUnaryOperators();
        this.binaryOperators = env.getBinaryOperators();
    }

    getVarName(prefix: string = '__internal_'): string {
        return `${prefix}${hex.stringify(sha256('TwingParser::getVarName' + this.stream.getSourceContext().getCode() + this.varNameSalt++))}`;
    }

    parse(stream: TwingTokenStream, test: Array<any> = null, dropNeedle: boolean = false): TwingNodeModule {
        this.stack.push(new TwingParserStackEntry(
            this.stream,
            this.parent,
            this.blocks,
            this.blockStack,
            this.macros,
            this.importedSymbols,
            this.traits,
            this.embeddedTemplates
        ));

        // tag handlers
        if (this.handlers === null) {
            this.handlers = new Map();

            for (let handler of this.env.getTokenParsers()) {
                handler.setParser(this);

                this.handlers.set(handler.getTag(), handler);
            }
        }

        // node visitors
        if (!this.visitors) {
            this.visitors = this.env.getNodeVisitors();
        }

        this.stream = stream;
        this.parent = null;
        this.blocks = new Map();
        this.macros = new Map();
        this.traits = new Map();
        this.blockStack = [];
        this.importedSymbols = [new Map()];
        this.embeddedTemplates = [];
        this.varNameSalt = 0;

        let body: Node;

        const location: Location = {
            line: 0,
            column: 0
        };

        try {
            body = this.subparse(test, dropNeedle);

            if (this.parent !== null && ((body = this.filterBodyNodes(body)) === null)) {
                body = new Node<null, null>(null, null, location);
            }
        } catch (e) {
            if (e instanceof SyntaxError) {
                if (!e.source) {
                    e = new SyntaxError(e.rawMessage, e.suggestion, e.location, this.stream.getSourceContext(), e.previous);
                }
            }

            throw e;
        }

        let node = new TwingNodeModule(
            new TwingNodeBody(null, {content: body}, location),
            this.parent,
            new Node<null>(null, toTwingNodeNodes(this.blocks), location),
            new Node<null>(null, toTwingNodeNodes(this.macros), location),
            new Node<null>(null, toTwingNodeNodes(this.traits), location),
            this.embeddedTemplates,
            stream.getSourceContext()
        );

        let traverser = new TwingNodeTraverser(this.env, this.visitors);

        node = traverser.traverse(node) as TwingNodeModule;

        // restore previous stack so previous parse() call can resume working
        let stack = this.stack.pop();

        this.stream = stack.stream;
        this.parent = stack.parent;
        this.blocks = stack.blocks;
        this.blockStack = stack.blockStack;
        this.macros = stack.macros;
        this.importedSymbols = stack.importedSymbols;
        this.traits = stack.traits;
        this.embeddedTemplates = stack.embeddedTemplates;

        return node;
    }

    getParent(): Node {
        return this.parent;
    }

    setParent(parent: Node) {
        this.parent = parent;
    }

    subparse(test: Array<any>, dropNeedle: boolean = false): Node {
        const {line, column} = this.getCurrentToken();
        const nodes: Map<string, Node> = new Map();

        let i: number = 0;
        let token;

        while (!this.stream.isEOF()) {
            switch (this.getCurrentToken().type) {
                case TokenType.TEXT:
                    token = this.stream.next();
                    nodes.set(`${i++}`, new TwingNodeText({data: token.value}, null, token));

                    break;
                case TokenType.VARIABLE_START:
                    token = this.stream.next();
                    let expression = this.parseExpression();

                    this.stream.expect(TokenType.VARIABLE_END);
                    nodes.set(`${i++}`, new TwingNodePrint(null, {content: expression}, token));

                    break;
                case TokenType.TAG_START:
                    this.stream.next();
                    token = this.getCurrentToken();

                    if (token.type !== TokenType.NAME) {
                        throw new SyntaxError('A block must start with a tag name.', null, token, this.stream.getSourceContext());
                    }

                    if (test !== null && test[1](token)) {
                        if (dropNeedle) {
                            this.stream.next();
                        }

                        if (nodes.size === 1) {
                            return first(nodes);
                        }

                        return new Node(null, toTwingNodeNodes(nodes), {line, column});
                    }

                    if (!this.handlers.has(token.value)) {
                        let e;

                        if (test !== null) {
                            let message: string = `Unexpected "${token.value}" tag`;

                            if (Array.isArray(test) && (test.length > 1) && (test[0] instanceof TwingTokenParser)) {
                                message = `${message} (expecting closing tag for the "${test[0].getTag()}" tag defined near line ${line}).`;
                            }

                            e = new SyntaxError(message, null, token, this.stream.getSourceContext());
                        } else {
                            e = new SyntaxError(
                                `Unknown "${token.value}" tag.`,
                                {
                                    value: token.value,
                                    candidates: Array.from(this.env.getTags().keys())
                                },
                                token,
                                this.stream.getSourceContext()
                            );
                        }

                        throw e;
                    }

                    this.stream.next();

                    let subParser = this.handlers.get(token.value);

                    let node = subParser.parse(token);

                    if (node !== null) {
                        nodes.set(`${i++}`, node);
                    }

                    break;
                case TokenType.COMMENT_START:
                    this.stream.next();
                    token = this.stream.expect(TokenType.TEXT);
                    this.stream.expect(TokenType.COMMENT_END);
                    nodes.set(`${i++}`, new CommentNode({data: token.value}, null, token));

                    break;
                default:
                    throw new SyntaxError(
                        'Lexer or parser ended up in unsupported state.',
                        null,
                        this.getCurrentToken(),
                        this.stream.getSourceContext()
                    );
            }
        }

        if (nodes.size === 1) {
            return first(nodes);
        }

        return new Node<null>(null, toTwingNodeNodes(nodes), {line, column});
    }

    getBlockStack() {
        return this.blockStack;
    }

    peekBlockStack() {
        return this.blockStack[this.blockStack.length - 1];
    }

    popBlockStack() {
        this.blockStack.pop();
    }

    pushBlockStack(name: string) {
        this.blockStack.push(name);
    }

    hasBlock(name: string) {
        return this.blocks.has(name);
    }

    getBlock(name: string) {
        return this.blocks.get(name);
    }

    setBlock(name: string, value: TwingNodeBlock) {
        this.blocks.set(name, new TwingNodeBody(null, {content: value}, value.location));
    }

    addTrait(trait: TwingNodeTrait) {
        push(this.traits, trait);
    }

    hasTraits() {
        return this.traits.size > 0;
    }

    embedTemplate(template: TwingNodeModule) {
        template.setIndex(this.embeddedTemplateIndex++);

        this.embeddedTemplates.push(template);
    }

    /**
     * @return {Token}
     */
    getCurrentToken(): Token {
        return this.stream.getCurrent();
    }

    /**
     *
     * @return {TwingTokenStream}
     */
    getStream(): TwingTokenStream {
        return this.stream;
    }

    addImportedSymbol(type: string, alias: string, name: string = null, node: TwingNodeExpressionName = null) {
        let localScope = this.importedSymbols[0];

        if (!localScope.has(type)) {
            localScope.set(type, new Map());
        }

        let localScopeType = localScope.get(type);

        localScopeType.set(alias, {name, node});
    }

    getImportedSymbol(type: string, alias: string): TwingParserImportedSymbolAlias {
        let result: TwingParserImportedSymbolAlias;

        let testImportedSymbol = (importedSymbol: TwingParserImportedSymbol) => {
            if (importedSymbol.has(type)) {
                let importedSymbolType = importedSymbol.get(type);

                if (importedSymbolType.has(alias)) {
                    return importedSymbolType.get(alias);
                }
            }

            return null;
        };

        result = testImportedSymbol(this.importedSymbols[0]);

        // if the symbol does not exist in the current scope (0), try in the main/global scope (last index)
        let length = this.importedSymbols.length;

        if (!result && (length > 1)) {
            result = testImportedSymbol(this.importedSymbols[length - 1]);
        }

        return result;
    }

    hasMacro(name: string) {
        return this.macros.has(name);
    }

    setMacro(name: string, node: TwingNodeMacro) {
        this.macros.set(name, node);
    }

    isMainScope() {
        return this.importedSymbols.length === 1;
    }

    pushLocalScope() {
        this.importedSymbols.unshift(new Map());
    }

    popLocalScope() {
        this.importedSymbols.shift();
    }

    filterBodyNodes(node: Node, nested: boolean = false): Node {
        // check that the body does not contain non-empty output nodes
        if ((node instanceof TwingNodeText && !ctypeSpace(node.attributes.data)) ||
            ((node.outputs) && !(node instanceof TwingNodeText) && !(node instanceof TwingNodeBlockReference) && !(node instanceof TwingNodeSpaceless))) {
            if (node.toString().indexOf(String.fromCharCode(0xEF, 0xBB, 0xBF)) > -1) {
                // todo: can this happen? None of TwingNodeOutputInterfaceImpl has a data attribute...
                let nodeData: string = node.attributes.data as string;

                let trailingData = nodeData.substring(3);

                if (trailingData === '' || ctypeSpace(trailingData)) {
                    // bypass empty nodes starting with a BOM
                    return null;
                }
            }

            throw new SyntaxError(
                `A template that extends another one cannot include content outside Twig blocks. Did you forget to put the content inside a {% block %} tag?`,
                null,
                node.location,
                this.stream.getSourceContext());
        }

        // bypass nodes that "capture" the output
        if (node.captures) {
            // a "block" tag in such a node will serve as a block definition AND be displayed in place as well
            return node;
        }

        // to be removed completely in Twig 3.0
        if (!nested && (node instanceof TwingNodeSpaceless)) {
            console.warn(`Using the spaceless tag at the root level of a child template in "${this.stream.getSourceContext().getName()}" at line ${node.location.line} is deprecated since Twig 2.5.0 and will become a syntax error in Twig 3.0.`);
        }

        // "block" tags that are not captured (see above) are only used for defining
        // the content of the block. In such a case, nesting it does not work as
        // expected as the definition is not part of the default template code flow.
        if (nested && (node instanceof TwingNodeBlockReference)) {
            console.warn(`Nesting a block definition under a non-capturing node in "${this.stream.getSourceContext().getName()}" at line ${node.location.line} is deprecated since Twig 2.5.0 and will become a syntax error in Twig 3.0.`);

            return null;
        }

        if ((node as any).TwingNodeOutputInterfaceImpl && !(node instanceof TwingNodeSpaceless)) {
            return null;
        }

        // todo: was this even needed to begin with?
        // // here, nested means "being at the root level of a child template"
        // // we need to discard the wrapping "TwingNode" for the "body" node
        // nested = nested || (node.type !== null);
        //
        // for (const [k, n] of node) {
        //     if (n !== null && (this.filterBodyNodes(n, nested) === null)) {
        //         node.removeNode(k);
        //     }
        // }

        return node;
    }

    getPrimary(): TwingNodeExpression<any> {
        let token = this.getCurrentToken();

        if (this.isUnary(token)) {
            let operator = this.unaryOperators.get(token.value);
            this.getStream().next();
            let expr = this.parseExpression(operator.getPrecedence());

            return this.parsePostfixExpression(operator.getExpressionFactory()([expr, null], token.line, token.column));
        } else if (token.test(TokenType.PUNCTUATION, '(')) {
            this.getStream().next();
            let expr = this.parseExpression();
            this.getStream().expect(TokenType.PUNCTUATION, ')', 'An opened parenthesis is not properly closed');

            return this.parsePostfixExpression(expr);
        }

        return this.parsePrimaryExpression();
    }

    getFunctionNode(name: string, location: Location): TwingNodeExpression<any> {
        switch (name) {
            case 'parent': {
                this.parseArguments();

                if (!this.getBlockStack().length) {
                    throw new SyntaxError('Calling "parent" outside a block is forbidden.', null, location, this.getStream().getSourceContext());
                }

                if (!this.getParent() && !this.hasTraits()) {
                    throw new SyntaxError('Calling "parent" on a template that does not extend nor "use" another template is forbidden.', null, location, this.getStream().getSourceContext());
                }

                return new TwingNodeExpressionParent({name: this.peekBlockStack()}, null, location);
            }
            case 'block': {
                let blockArguments = this.parseArguments();

                if (blockArguments.nodesCount < 1) {
                    throw new SyntaxError('The "block" function takes one argument (the block name).', null, location, this.getStream().getSourceContext());
                }

                const elements = blockArguments.attributes.elements.map(([, value]) => {
                    return value;
                });

                return new TwingNodeExpressionBlockReference({}, {
                    name: elements[0],
                    template: elements.length > 1 ? elements[1] : null
                }, location);
            }
            case 'attribute': {
                let attributeArguments = this.parseArguments();

                if (attributeArguments.nodesCount < 2) {
                    throw new SyntaxError('The "attribute" function takes at least two arguments (the variable and the attributes).', null, location, this.getStream().getSourceContext());
                }

                const elements = attributeArguments.attributes.elements.map(([, value]) => {
                    return value;
                });

                return new TwingNodeExpressionGetAttribute({
                    type: ANY_CALL
                }, {
                    node: elements[0],
                    attribute: elements[1],
                    arguments: elements.length > 2 ? elements[2] : null
                }, location);
            }
            default: {
                let alias = this.getImportedSymbol('function', name);

                if (alias) {
                    const elements: Array<TwingNodeExpressionArrayElement> = [];

                    let i: number = 0;

                    for (const [, node] of this.parseArguments()) {
                        //methodArguments.addElement(node);
                        elements.push([i, node]);

                        i++;
                    }

                    const methodArguments = new TwingNodeExpressionArray({elements}, null, location);

                    return new TwingNodeExpressionMethodCall({
                        method: alias.name,
                        safe: true
                    }, {
                        node: alias.node,
                        arguments: methodArguments
                    }, location);
                }

                let aliasArguments = this.parseArguments(true);
                let aliasFactory = this.getFunctionExpressionFactory(name, location);

                return aliasFactory(null, name, aliasArguments, location);
            }
        }
    }

    parseStringExpression(): TwingNodeExpression<any> {
        let stream = this.getStream();

        let nodes: Array<TwingNodeExpression<any>> = [];
        // a string cannot be followed by another string in a single expression
        let nextCanBeString = true;
        let token;

        while (true) {
            if (nextCanBeString && (token = stream.nextIf(TokenType.STRING))) {
                nodes.push(new TwingNodeExpressionConstant<string>({value: token.value}, null, token));
                nextCanBeString = false;
            } else if (stream.nextIf(TokenType.INTERPOLATION_START)) {
                nodes.push(this.parseExpression());
                stream.expect(TokenType.INTERPOLATION_END);
                nextCanBeString = true;
            } else {
                break;
            }
        }

        let expr = nodes.shift();

        for (let node of nodes) {
            expr = new TwingNodeExpressionBinaryConcat({}, {
                left: expr,
                right: node
            }, node.location);
        }

        return expr;
    }

    parseExpression(precedence: number = 0, allowArrow: boolean = false): TwingNodeExpression<any> {
        if (allowArrow) {
            let arrow = this.parseArrow();

            if (arrow) {
                return arrow;
            }
        }

        let expr = this.getPrimary();
        let token = this.getCurrentToken();

        while (this.isBinary(token) && this.binaryOperators.get(token.value).getPrecedence() >= precedence) {
            let operator = this.binaryOperators.get(token.value);

            this.getStream().next();

            if (token.value === 'is not') {
                expr = this.parseNotTestExpression(expr);
            } else if (token.value === 'is') {
                expr = this.parseTestExpression(expr);
            } else {
                let expr1 = this.parseExpression(operator.getAssociativity() === TwingOperatorAssociativity.LEFT ? operator.getPrecedence() + 1 : operator.getPrecedence());
                let expressionFactory = operator.getExpressionFactory();

                expr = expressionFactory([expr, expr1], token.line, token.column);
            }

            token = this.getCurrentToken();
        }

        if (precedence === 0) {
            return this.parseConditionalExpression(expr);
        }

        return expr;
    }

    parseArrow(): TwingNodeExpressionArrowFunction {
        const stream = this.getStream();
        const names: Map<string, TwingNodeExpression<{
            value: string
        }>> = new Map();

        let token: Token;
        let location: Location;

        const createNode = () => {
            return new TwingNodeExpressionArrowFunction({}, {
                    expr: this.parseExpression(0),
                    names: new Node(null, toTwingNodeNodes(names), location)
                },
                location
            );
        };

        // short array syntax (one argument, no parentheses)?
        if (stream.look(1).test(TokenType.ARROW)) {
            // todo: check what these variable were needed for
            // line = stream.getCurrent().line;
            // column = stream.getCurrent().column;
            token = stream.expect(TokenType.NAME);

            const {value, line, column} = token;

            names.set('0', new TwingNodeExpressionAssignName({value}, null, {line, column}));

            stream.expect(TokenType.ARROW);

            return createNode();
        }

        // first, determine if we are parsing an arrow function by finding => (long form)
        let i: number = 0;

        if (!stream.look(i).test(TokenType.PUNCTUATION, '(')) {
            return null;
        }

        ++i;

        while (true) {
            // variable name
            ++i;

            if (!stream.look(i).test(TokenType.PUNCTUATION, ',')) {
                break;
            }

            ++i;
        }

        if (!stream.look(i).test(TokenType.PUNCTUATION, ')')) {
            return null;
        }

        ++i;

        if (!stream.look(i).test(TokenType.ARROW)) {
            return null;
        }

        // yes, let's parse it properly
        token = stream.expect(TokenType.PUNCTUATION, '(');
        location = token;

        i = 0;

        while (true) {
            token = this.getCurrentToken();

            if (!token.test(TokenType.NAME)) {
                throw new SyntaxError(`Unexpected token "${typeToEnglish(token.type)}" of value "${token.value}".`, null, token, stream.getSourceContext());
            }

            const {value, line, column} = token;

            names.set(`${i++}`, new TwingNodeExpressionAssignName({value}, null, {line, column}));

            stream.next();

            if (!stream.nextIf(TokenType.PUNCTUATION, ',')) {
                break;
            }
        }

        stream.expect(TokenType.PUNCTUATION, ')');
        stream.expect(TokenType.ARROW);

        return createNode();
    }

    parsePrimaryExpression(): TwingNodeExpression<any> {
        let token: Token = this.getCurrentToken();
        let node: TwingNodeExpression<any>;

        const {type, value} = token;

        switch (type) {
            case TokenType.NAME:
                this.getStream().next();

                switch (value) {
                    case 'true':
                    case 'TRUE':
                        node = new TwingNodeExpressionConstant<boolean>({value: true}, null, token);
                        break;

                    case 'false':
                    case 'FALSE':
                        node = new TwingNodeExpressionConstant<boolean>({value: false}, null, token);
                        break;

                    case 'none':
                    case 'NONE':
                    case 'null':
                    case 'NULL':
                        node = new TwingNodeExpressionConstant<null>({value: null}, null, token);
                        break;

                    default:
                        if ('(' === this.getCurrentToken().value) {
                            node = this.getFunctionNode(value, token);
                        } else {
                            node = new TwingNodeExpressionName({value}, null, token);
                        }
                }
                break;

            case TokenType.NUMBER:
                this.getStream().next();
                node = new TwingNodeExpressionConstant<number>({value}, null, token);
                break;

            case TokenType.STRING:
            case TokenType.INTERPOLATION_START:
                node = this.parseStringExpression();
                break;

            case TokenType.OPERATOR:
                let match = nameRegExp.exec(token.value);

                if (match !== null && match[0] === token.value) {
                    // in this context, string operators are variable names
                    this.getStream().next();
                    node = new TwingNodeExpressionName({value}, null, token);

                    break;
                } else if (this.unaryOperators.has(token.value)) {
                    let operator = this.unaryOperators.get(token.value);

                    this.getStream().next();

                    let expr = this.parsePrimaryExpression();

                    node = operator.getExpressionFactory()([expr, null], token.line, token.column);

                    break;
                }

            default:
                if (token.test(TokenType.PUNCTUATION, '[')) {
                    node = this.parseArrayExpression();
                } else if (token.test(TokenType.PUNCTUATION, '{')) {
                    node = this.parseHashExpression();
                } else if (token.test(TokenType.OPERATOR, '=') && (this.getStream().look(-1).value === '==' || this.getStream().look(-1).value === '!=')) {
                    throw new SyntaxError(`Unexpected operator of value "${token.value}". Did you try to use "===" or "!==" for strict comparison? Use "is same as(value)" instead.`, null, token, this.getStream().getSourceContext());
                } else {
                    throw new SyntaxError(`Unexpected token "${typeToEnglish(token.type)}" of value "${token.value}".`, null, token, this.getStream().getSourceContext());
                }
        }

        return this.parsePostfixExpression(node);
    }

    parseArrayExpression(): TwingNodeExpression<any> {
        const stream = this.getStream();

        stream.expect(TokenType.PUNCTUATION, '[', 'An array element was expected');

        const {line, column} = stream.getCurrent();
        const elements: Array<TwingNodeExpressionArrayElement> = [];

        let i: number = 0;

        while (!stream.test(TokenType.PUNCTUATION, ']')) {
            if (i > 0) {
                stream.expect(TokenType.PUNCTUATION, ',', 'An array element must be followed by a comma');

                // trailing ,?
                if (stream.test(TokenType.PUNCTUATION, ']')) {
                    break;
                }
            }

            elements.push([i, this.parseExpression()]);

            i++;

            // todo: remove this comment when everything works
            //node.addElement(this.parseExpression());
        }

        stream.expect(TokenType.PUNCTUATION, ']', 'An opened array is not properly closed');

        return new TwingNodeExpressionArray({elements}, null, {line, column});
    }

    parseHashExpression(): TwingNodeExpression<any> {
        const stream = this.getStream();

        stream.expect(TokenType.PUNCTUATION, '{', 'A hash element was expected');

        const elements: Array<TwingNodeExpressionHashElement> = [];

        let first = true;

        while (!stream.test(TokenType.PUNCTUATION, '}')) {
            if (!first) {
                stream.expect(TokenType.PUNCTUATION, ',', 'A hash value must be followed by a comma');

                // trailing ,?
                if (stream.test(TokenType.PUNCTUATION, '}')) {
                    break;
                }
            }

            first = false;

            // a hash key can be:
            //
            //  * a number -- 12
            //  * a string -- 'a'
            //  * a name, which is equivalent to a string -- a
            //  * an expression, which must be enclosed in parentheses -- (1 + 2)
            let token;
            let key;

            if ((token = stream.nextIf(TokenType.STRING)) || (token = stream.nextIf(TokenType.NAME)) || (token = stream.nextIf(TokenType.NUMBER))) {
                key = new TwingNodeExpressionConstant({value: token.value}, {}, token);
            } else if (stream.test(TokenType.PUNCTUATION, '(')) {
                key = this.parseExpression();
            } else {
                let current = stream.getCurrent();

                throw new SyntaxError(`A hash key must be a quoted string, a number, a name, or an expression enclosed in parentheses (unexpected token "${typeToEnglish(current.type)}" of value "${current.value}".`, null, current, stream.getSourceContext());
            }

            stream.expect(TokenType.PUNCTUATION, ':', 'A hash key must be followed by a colon (:)');

            // todo: remove following when ok
            //let value = this.parseExpression();
            //node.addElement(value, key);

            elements.push([key, this.parseExpression()]);
        }

        stream.expect(TokenType.PUNCTUATION, '}', 'An opened hash is not properly closed');

        return new TwingNodeExpressionHash({elements}, null, stream.getCurrent());
    }

    parseSubscriptExpression(node: TwingNodeExpression<any>): TwingNodeExpression<any> {
        const stream = this.getStream();

        let token = stream.next();

        const elements: Array<TwingNodeExpressionArrayElement> = [];

        let arg: TwingNodeExpression<any>;

        let type: CallType = ANY_CALL;
        let methodArguments: TwingNodeExpressionArray;

        if (token.value === '.') {
            let arg: TwingNodeExpressionConstant;

            token = stream.next();

            let match = nameRegExp.exec(token.value);

            if ((token.type === TokenType.NAME) || (token.type === TokenType.NUMBER) || (token.type === TokenType.OPERATOR && (match !== null))) {
                arg = new TwingNodeExpressionConstant({value: token.value}, {}, token);

                if (stream.test(TokenType.PUNCTUATION, '(')) {
                    type = METHOD_CALL;

                    let node = this.parseArguments();
                    let i: number = 0;

                    for (let [, methodArgument] of node) {
                        elements.push([i, methodArgument]);

                        i++;
                        // todo: remove following line when OK
                        //methodArguments.addElement(methodArgument);
                    }
                }
            } else {
                throw new SyntaxError('Expected name or number.', null, token, stream.getSourceContext());
            }

            methodArguments = new TwingNodeExpressionArray({elements}, null, token);

            if ((node instanceof TwingNodeExpressionName) && this.getImportedSymbol('template', node.attributes.value)) {
                let method = arg.attributes.value as string;

                return new TwingNodeExpressionMethodCall({
                    method
                }, {
                    node,
                    arguments: methodArguments
                }, token);
            }
        } else {
            methodArguments = new TwingNodeExpressionArray({elements}, null, token);

            type = ARRAY_CALL;

            // slice?
            let slice = false;

            if (stream.test(TokenType.PUNCTUATION, ':')) {
                slice = true;
                arg = new TwingNodeExpressionConstant<number>({value: 0}, null, token);
            } else {
                arg = this.parseExpression();
            }

            if (stream.nextIf(TokenType.PUNCTUATION, ':')) {
                slice = true;
            }

            if (slice) {
                let length: TwingNodeExpression<any>;

                if (stream.test(TokenType.PUNCTUATION, ']')) {
                    length = new TwingNodeExpressionConstant<number>({value: 0}, null, token);
                } else {
                    length = this.parseExpression();
                }

                let factory = this.getFilterExpressionFactory('slice', token);
                let filterArguments = new TwingNodeExpressionArray({
                    elements: [[0, arg], [1, length]]
                }, null, token);

                //new Map([[0, arg], [1, length]]
                let filter = factory(node, 'slice', filterArguments, token);

                stream.expect(TokenType.PUNCTUATION, ']');

                return filter;
            }

            stream.expect(TokenType.PUNCTUATION, ']');
        }

        return new TwingNodeExpressionGetAttribute({
            type
        }, {
            node,
            attribute: arg,
            arguments: methodArguments
        }, token);
    }

    parsePostfixExpression(node: TwingNodeExpression<any>): TwingNodeExpression<any> {
        while (true) {
            let token = this.getCurrentToken();

            if (token.type === TokenType.PUNCTUATION) {
                if ('.' == token.value || '[' == token.value) {
                    node = this.parseSubscriptExpression(node);
                } else if ('|' == token.value) {
                    node = this.parseFilterExpression(node);
                } else {
                    break;
                }
            } else {
                break;
            }
        }

        return node;
    }

    parseTestExpression(node: TwingNodeExpression<any>): TwingNodeExpression<any> {
        let stream = this.getStream();
        let name: string;
        let test: TwingTest;

        [name, test] = this.getTest(node.location);

        let testArguments = null;

        if (stream.test(TokenType.PUNCTUATION, '(')) {
            testArguments = this.parseArguments(true);
        }

        if ((name === 'defined') && (node instanceof TwingNodeExpressionName)) {
            let alias = this.getImportedSymbol('function', node.attributes.value);

            if (alias !== null) {
                node = new TwingNodeExpressionMethodCall({
                    method: alias.name,
                    safe: true
                }, {
                    node: alias.node,
                    arguments: new TwingNodeExpressionArray({
                        elements: []
                    }, null, node.location)
                }, node.location);
            }
        }

        return test.expressionFactory.call(this, node, name, testArguments, this.getCurrentToken().line);
    }

    parseNotTestExpression(node: TwingNodeExpression<any>): TwingNodeExpression<any> {
        return new TwingNodeExpressionUnaryNot(this.parseTestExpression(node), this.getCurrentToken().line, this.getCurrentToken().column);
    }

    parseConditionalExpression(expr: TwingNodeExpression<any>): TwingNodeExpression<any> {
        let expr2;
        let expr3;

        while (this.getStream().nextIf(TokenType.PUNCTUATION, '?')) {
            if (!this.getStream().nextIf(TokenType.PUNCTUATION, ':')) {
                expr2 = this.parseExpression();

                if (this.getStream().nextIf(TokenType.PUNCTUATION, ':')) {
                    expr3 = this.parseExpression();
                } else {
                    expr3 = new TwingNodeExpressionConstant({value: ''}, null, this.getCurrentToken());
                }
            } else {
                expr2 = expr;
                expr3 = this.parseExpression();
            }

            expr = new TwingNodeExpressionConditional({}, {
                expr1: expr,
                expr2,
                expr3
            }, this.getCurrentToken());
        }

        return expr;
    }

    parseFilterExpression(node: TwingNodeExpression<any>): TwingNodeExpression<any> {
        this.getStream().next();

        return this.parseFilterExpressionRaw(node);
    }

    parseFilterExpressionRaw(node: TwingNodeExpression<any>, tag: string = null): TwingNodeExpression<any> {
        while (true) {
            let token = this.getStream().expect(TokenType.NAME);

            let name = new TwingNodeExpressionConstant({value: token.value}, {}, token);
            let methodArguments;

            if (!this.getStream().test(TokenType.PUNCTUATION, '(')) {
                methodArguments = new Node<null, null>(null, null, token);
            } else {
                methodArguments = this.parseArguments(true, false, true);
            }

            let factory = this.getFilterExpressionFactory('' + name.attributes.value, token);

            node = factory.call(this, node, name, methodArguments, token.line, tag);

            if (!this.getStream().test(TokenType.PUNCTUATION, '|')) {
                break;
            }

            this.getStream().next();
        }

        return node;
    }

    /**
     * Parses arguments.
     *
     * @param namedArguments {boolean} Whether to allow named arguments or not
     * @param definition {boolean} Whether we are parsing arguments for a function definition
     * @param allowArrow {boolean}
     *
     * @return Node
     *
     * @throws SyntaxError
     */
    parseArguments(namedArguments: boolean = false, definition: boolean = false, allowArrow: boolean = false): TwingNodeExpressionHash {
        let parsedArguments: Map<string, TwingNodeExpression<any>> = new Map();
        let stream = this.getStream();
        let value: TwingNodeExpression<any>;
        let token;

        const {line, column} = stream.getCurrent();

        stream.expect(TokenType.PUNCTUATION, '(', 'A list of arguments must begin with an opening parenthesis');

        while (!stream.test(TokenType.PUNCTUATION, ')')) {
            if (parsedArguments.size > 0) {
                stream.expect(TokenType.PUNCTUATION, ',', 'Arguments must be separated by a comma');
            }

            if (definition) {
                token = stream.expect(TokenType.NAME, null, 'An argument must be a name');

                value = new TwingNodeExpressionName({value: token.value}, null, this.getCurrentToken());
            } else {
                value = this.parseExpression(0, allowArrow);
            }

            let name = null;

            if (namedArguments && (token = stream.nextIf(TokenType.OPERATOR, '='))) {
                if (!(value instanceof TwingNodeExpressionName)) {
                    throw new SyntaxError(`A parameter name must be a string, "${value.constructor.name}" given.`, null, token, stream.getSourceContext());
                }

                name = value.attributes.value;

                if (definition) {
                    value = this.parsePrimaryExpression();

                    if (!this.checkConstantExpression(value)) {
                        throw new SyntaxError(`A default value for an argument must be a constant (a boolean, a string, a number, or an array).`, null, token, stream.getSourceContext());
                    }
                } else {
                    value = this.parseExpression(0, allowArrow);
                }
            }

            if (definition) {
                if (name === null) {
                    // we know for sure that value is an instance of TwingNodeExpressionName
                    name = (value as TwingNodeExpressionName).attributes.value;
                    value = new TwingNodeExpressionConstant({value: null}, {}, this.getCurrentToken());
                }

                parsedArguments.set(name, value);
            } else {
                if (name === null) {
                    push(parsedArguments, value);
                } else {
                    parsedArguments.set(name, value);
                }
            }
        }

        stream.expect(TokenType.PUNCTUATION, ')', 'A list of arguments must be closed by a parenthesis');

        const elements: Array<TwingNodeExpressionHashElement> = [];

        for (let [key, value] of parsedArguments) {
            elements.push([
                new TwingNodeExpressionConstant<string>({value: key}, null, value.location),
                value
            ]);
        }

        return new TwingNodeExpressionHash({elements}, null, {line, column});
    }

    parseAssignmentExpression(): Node<NodeChildren<TwingNodeExpressionAssignName>, null> {
        const stream = this.getStream();
        const targets: Map<string, TwingNodeExpressionAssignName> = new Map();
        const {line, column} = stream.getCurrent();

        while (true) {
            let token = this.getCurrentToken();

            if (stream.test(TokenType.OPERATOR) && nameRegExp.exec(token.value)) {
                // in this context, string operators are variable names
                this.getStream().next();
            } else {
                stream.expect(TokenType.NAME, null, 'Only variables can be assigned to');
            }

            let value = token.value;

            if (['true', 'false', 'none', 'null'].includes(value.toLowerCase())) {
                throw new SyntaxError(`You cannot assign a value to "${value}".`, null, token, stream.getSourceContext());
            }

            push(targets, new TwingNodeExpressionAssignName({value}, null, token));

            if (!stream.nextIf(TokenType.PUNCTUATION, ',')) {
                break;
            }
        }

        return new Node(toTwingNodeNodes(targets), null, {line, column});
    }

    parseMultiTargetExpression(): Node<NodeChildren<TwingNodeExpression<any>>, null> {
        const stream = this.getStream();
        const {line, column} = stream.getCurrent();
        const targets: Map<string, TwingNodeExpression<any>> = new Map();

        while (true) {
            push(targets, this.parseExpression());

            if (!stream.nextIf(TokenType.PUNCTUATION, ',')) {
                break;
            }
        }

        return new Node(toTwingNodeNodes(targets), null, {line, column});
    }

    /**
     * Checks that the node only contains "constant" elements
     */
    protected checkConstantExpression(node: Node): boolean {
        if (!(node instanceof TwingNodeExpressionConstant || node instanceof TwingNodeExpressionArray || node instanceof TwingNodeExpressionUnaryNeg || node instanceof TwingNodeExpressionUnaryPos)) {
            return false;
        }

        for (const [, subNode] of node) {
            if (!this.checkConstantExpression(subNode)) {
                return false;
            }
        }

        return true;
    }

    protected isUnary(token: Token) {
        return token.test(TokenType.OPERATOR) && this.unaryOperators.has(token.value);
    }

    protected isBinary(token: Token) {
        return token.test(TokenType.OPERATOR) && this.binaryOperators.has(token.value);
    }

    protected getTest(location: Location): Array<any> {
        let stream = this.getStream();
        let name = stream.expect(TokenType.NAME).value;

        let test = this.env.getTest(name);

        if (test) {
            return [name, test];
        }

        if (stream.test(TokenType.NAME)) {
            // try 2-words tests
            name = name + ' ' + this.getCurrentToken().value;

            let test = this.env.getTest(name);

            if (test) {
                stream.next();

                return [name, test];
            }
        }

        throw new SyntaxError(`Unknown "${name}" test.`, {
            value: name,
            candidates: [...this.env.getTests().keys()]
        }, location, stream.getSourceContext());
    }

    protected getFunctionExpressionFactory(name: string, location: Location): CallableWrapperExpressionFactory {
        let function_ = this.env.getFunction(name);

        if (!function_) {
            throw new SyntaxError(`Unknown "${name}" function.`, {
                value: name,
                candidates: [...this.env.getFunctions().keys()]
            }, location, this.getStream().getSourceContext());
        }

        return this.getExpressionFactory(function_, 'function', location);
    }

    protected getFilterExpressionFactory(name: string, location: Location): CallableWrapperExpressionFactory {
        let filter = this.env.getFilter(name);

        if (!filter) {
            throw new SyntaxError(`Unknown "${name}" filter.`, {
                value: name,
                candidates: [...this.env.getFilters().keys()]
            }, location, this.getStream().getSourceContext());
        }

        return this.getExpressionFactory(filter, 'filter', location);
    }

    private getExpressionFactory(callableWrapper: TwingCallableWrapper<any>, type: 'function' | 'filter', location: Location): CallableWrapperExpressionFactory {
        if (callableWrapper.isDeprecated) {
            let message = `Twing ${title(type)} "${callableWrapper.getName()}" is deprecated`;

            if (callableWrapper.deprecatedVersion !== true) {
                message += ` since version ${callableWrapper.deprecatedVersion}`;
            }

            if (callableWrapper.alternative) {
                message += `. Use "${callableWrapper.alternative}" instead`;
            }

            let src = this.getStream().getSourceContext();

            message += ` in "${src.getName()}" at line ${location.line}, column ${location.column}.`;

            process.stdout.write(message);
        }

        return callableWrapper.expressionFactory;
    }
}
