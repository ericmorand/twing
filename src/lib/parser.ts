import {Environment} from "./environment";
import {TokenStream} from "./token-stream";
import {BlockNode} from "./node/block";
import {TokenParserInterface} from "./token-parser-interface";
import {NodeVisitorInterface} from "./node-visitor-interface";
import {SyntaxError} from "./error/syntax";
import {Location, Node, toNodeEdges} from "./node";
import {TextNode} from "./node/text";
import {PrintNode} from "./node/print";
import {ExpressionNode} from "./node/expression";
import {BodyNode} from "./node/body";
import {ModuleNode} from "./node/module";
import {NodeTraverser} from "./node-traverser";
import {MacroNode} from "./node/macro";
import {TokenParser} from "./token-parser";
import {first} from "./helpers/first";
import {push} from "./helpers/push";
import {CommentNode} from "./node/comment";
import {ctypeSpace} from "./helpers/ctype-space";
import {ConstantExpressionNode} from "./node/expression/constant";
import {ConcatBinaryExpressionNode} from "./node/expression/binary/concat";
import {AssignNameExpressionNode} from "./node/expression/assign-name";
import {ArrowFunctionExpressionNode} from "./node/expression/arrow-function";
import {NameExpressionNode} from "./node/expression/name";
import {ParentExpressionNode} from "./node/expression/parent";
import {BlockReferenceExpressionNode} from "./node/expression/block-reference";
import {ANY_CALL, ARRAY_CALL, GetAttributeExpressionNode, METHOD_CALL} from "./node/expression/get-attribute";
import {ArrayExpressionNode, ArrayExpressionNodeEdge} from "./node/expression/array";
import {MethodCallExpressionNode} from "./node/expression/method-call";
import {HashExpressionNode, HashExpressionNodeEdge} from "./node/expression/hash";
import {Test} from "./test";
import {NotUnaryExpressionNode} from "./node/expression/unary/not";
import {ConditionalExpressionNode} from "./node/expression/conditional";
import {OperatorAssociativity} from "./operator";
import {namePattern, Token, TokenType} from "twig-lexer";
import {typeToEnglish} from "./lexer";
import {TraitNode} from "./node/trait";
import {CallableWrapperExpressionFactory, CallableWrapper} from "./callable-wrapper";
import {SpacelessNode} from "./node/spaceless";
import {BlockReferenceNode} from "./node/block-reference";
import {NegativeUnaryExpressionNode} from "./node/expression/unary/neg";
import {PositiveUnaryExpressionNode} from "./node/expression/unary/pos";
import {title} from "./extension/core/filters/title";
import {EmbeddedTemplateNode} from "./node/embeddedTemplate";
import {TemplateNode} from "./node/template";
import {UnaryOperator} from "./operator/unary";
import {BinaryOperator} from "./operator/binary";
import {ArgumentExpressionNode} from "./node/expression/argument";

import type {NodeEdges} from "./node";
import type {CallType} from "./node/expression/get-attribute";
import {ArgumentsExpressionNode} from "./node/expression/arguments";

const sha256 = require('crypto-js/sha256');
const hex = require('crypto-js/enc-hex');

class ParserStackEntry {
    stream: TokenStream;
    parent: Node;
    blocks: Map<string, BlockNode>;
    blockStack: Array<string>;
    macros: Map<string, Node>;
    importedSymbols: Array<Map<string, Map<string, { name: string, node: NameExpressionNode }>>>;
    traits: Map<string, TraitNode>;
    embeddedTemplates: Array<EmbeddedTemplateNode>;

    constructor(
        stream: TokenStream,
        parent: Node = null,
        blocks: Map<string, BlockNode>,
        blockStack: Array<string>,
        macros: Map<string, Node>,
        importedSymbols: Array<Map<string, Map<string, { name: string, node: NameExpressionNode }>>>,
        traits: Map<string, TraitNode>,
        embeddedTemplates: Array<EmbeddedTemplateNode>) {
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

type ParserImportedSymbolAlias = {
    name: string,
    node: NameExpressionNode
};
type ParserImportedSymbolType = Map<string, ParserImportedSymbolAlias>;
type ParserImportedSymbol = Map<string, ParserImportedSymbolType>;
type ParseTest = [TokenParser, (token: Token) => boolean];

export class Parser {
    private stack: Array<ParserStackEntry> = [];
    private stream: TokenStream;
    private parent: Node;
    private handlers: Map<string, TokenParserInterface> = null;
    private visitors: Array<NodeVisitorInterface>;
    private blocks: Map<string, BlockNode>;
    private blockStack: Array<string>;
    private macros: Map<string, Node>;
    private readonly env: Environment;
    private importedSymbols: Array<ParserImportedSymbol>;
    private traits: Map<string, TraitNode>;
    private embeddedTemplates: Array<EmbeddedTemplateNode> = [];
    private varNameSalt: number = 0;
    private _embeddedTemplateIndex: number = 1;

    constructor(env: Environment) {
        this.env = env;
    }

    get binaryOperators(): Map<string, BinaryOperator> {
        return this.env.binaryOperators;
    }

    get unaryOperators(): Map<string, UnaryOperator> {
        return this.env.unaryOperators;
    }

    get embeddedTemplateIndex(): number {
        return this._embeddedTemplateIndex;
    }

    getVarName(prefix: string = '__internal_'): string {
        return `${prefix}${hex.stringify(sha256('TwingParser::getVarName' + this.stream.source.content + this.varNameSalt++))}`;
    }

    parseTemplate(stream: TokenStream, test: ParseTest = null, dropNeedle: boolean = false): TemplateNode {
        this.stack.push(new ParserStackEntry(
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

            for (let tokenParser of this.env.tokenParsers) {
                tokenParser.setParser(this);

                this.handlers.set(tokenParser.tag, tokenParser);
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

        const location: Location = {line: 1, column: 1};

        try {
            body = this.subparse(test, dropNeedle);

            if (this.parent !== null && ((body = this.filterBodyNodes(body)) === null)) {
                body = new Node<null, null>(null, null, location);
            }
        } catch (e) {
            if (e instanceof SyntaxError) {
                if (!e.source) {
                    e = new SyntaxError(e.rawMessage, e.suggestion, e.location, this.stream.source, e.previous);
                }
            }

            throw e;
        }

        let node = new TemplateNode({
            source: stream.source
        }, {
            parent: this.parent,
            blocks: new Node<null>(null, toNodeEdges(this.blocks), location),
            macros: new Node<null>(null, toNodeEdges(this.macros), location),
            traits: new Node<null>(null, toNodeEdges(this.traits), location),
            body: new BodyNode(null, {content: body}, location)
        }, location);

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

    parse(stream: TokenStream, test: ParseTest = null, dropNeedle: boolean = false): Node {
        let node = new ModuleNode({
            embeddedTemplates: this.embeddedTemplates
        }, {
            template: this.parseTemplate(stream)
        }, {line: 1, column: 1});

        let traverser = new NodeTraverser(this.env, this.visitors);

        return traverser.traverse(node);
    }

    getParent(): Node {
        return this.parent;
    }

    setParent(parent: Node) {
        this.parent = parent;
    }

    subparse(test: ParseTest, dropNeedle: boolean = false): Node {
        const {line, column} = this.getCurrentToken();
        const nodes: Map<string, Node> = new Map();

        let i: number = 0;
        let token;

        while (!this.stream.isEOF()) {
            switch (this.getCurrentToken().type) {
                case TokenType.TEXT:
                    token = this.stream.next();
                    nodes.set(`${i++}`, new TextNode({data: token.value}, null, token));

                    break;
                case TokenType.VARIABLE_START:
                    token = this.stream.next();
                    let expression = this.parseExpression();

                    this.stream.expect(TokenType.VARIABLE_END);
                    nodes.set(`${i++}`, new PrintNode(null, {content: expression}, token));

                    break;
                case TokenType.TAG_START:
                    this.stream.next();
                    token = this.getCurrentToken();

                    if (token.type !== TokenType.NAME) {
                        throw new SyntaxError('A block must start with a tag name.', null, token, this.stream.source);
                    }

                    if ((test !== null) && test[1](token)) {
                        if (dropNeedle) {
                            this.stream.next();
                        }

                        if (nodes.size === 1) {
                            return first(nodes);
                        }

                        return new Node(null, toNodeEdges(nodes), {line, column});
                    }

                    if (!this.handlers.has(token.value)) {
                        let e;

                        if (test !== null) {
                            let message: string = `Unexpected "${token.value}" tag`;

                            if (Array.isArray(test) && (test.length > 1) && (test[0] instanceof TokenParser)) {
                                message = `${message} (expecting closing tag for the "${test[0].tag}" tag defined near line ${line}).`;
                            }

                            e = new SyntaxError(message, null, token, this.stream.source);
                        } else {
                            e = new SyntaxError(
                                `Unknown "${token.value}" tag.`,
                                {
                                    value: token.value,
                                    candidates: Array.from(this.env.getTags().keys())
                                },
                                token,
                                this.stream.source
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
                        this.stream.source
                    );
            }
        }

        if (nodes.size === 1) {
            return first(nodes);
        }

        return new Node<null>(null, toNodeEdges(nodes), {line, column});
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

    setBlock(name: string, value: BlockNode) {
        this.blocks.set(name, value);
    }

    addTrait(trait: TraitNode) {
        push(this.traits, trait);
    }

    hasTraits() {
        return this.traits.size > 0;
    }

    embedTemplate(template: TemplateNode): EmbeddedTemplateNode {
        const embeddedTemplate = new EmbeddedTemplateNode({
            index: this._embeddedTemplateIndex++
        }, {
            template: template
        }, template.location);

        this.embeddedTemplates.push(embeddedTemplate);

        return embeddedTemplate;
    }

    /**
     * @return {Token}
     */
    getCurrentToken(): Token {
        return this.stream.getCurrent();
    }

    /**
     *
     * @return {TokenStream}
     */
    getStream(): TokenStream {
        return this.stream;
    }

    addImportedSymbol(type: string, alias: string, name: string = null, node: NameExpressionNode = null) {
        let localScope = this.importedSymbols[0];

        if (!localScope.has(type)) {
            localScope.set(type, new Map());
        }

        let localScopeType = localScope.get(type);

        localScopeType.set(alias, {name, node});
    }

    getImportedSymbol(type: string, alias: string): ParserImportedSymbolAlias {
        let result: ParserImportedSymbolAlias;

        let testImportedSymbol = (importedSymbol: ParserImportedSymbol) => {
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

    setMacro(name: string, node: MacroNode) {
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
        if ((node instanceof TextNode && !ctypeSpace(node.attributes.data)) ||
            ((node.outputs) && !(node instanceof TextNode) && !(node instanceof BlockReferenceNode) && !(node instanceof SpacelessNode))) {
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
                this.stream.source);
        }

        // bypass nodes that "capture" the output
        if (node.captures) {
            // a "block" tag in such a node will serve as a block definition AND be displayed in place as well
            return node;
        }

        // to be removed completely in Twig 3.0
        if (!nested && (node instanceof SpacelessNode)) {
            console.warn(`Using the spaceless tag at the root level of a child template in "${this.stream.source.name}" at line ${node.location.line} is deprecated since Twig 2.5.0 and will become a syntax error in Twig 3.0.`);
        }

        // "block" tags that are not captured (see above) are only used for defining
        // the content of the block. In such a case, nesting it does not work as
        // expected as the definition is not part of the default template code flow.
        if (nested && (node instanceof BlockReferenceNode)) {
            console.warn(`Nesting a block definition under a non-capturing node in "${this.stream.source.name}" at line ${node.location.line} is deprecated since Twig 2.5.0 and will become a syntax error in Twig 3.0.`);

            return null;
        }

        if (node.outputs && !(node instanceof SpacelessNode)) {
            return null;
        }

        // todo: was this even needed to begin with?
        // here, nested means "being at the root level of a child template"
        // we need to discard the wrapping "TwingNode" for the "body" node
        // nested = nested || (node.type !== null);
        // for (const [k, n] of node) {
        //     if (n !== null && (this.filterBodyNodes(n, nested) === null)) {
        //         delete node.edges[k];
        //     }
        // }

        return node;
    }

    getPrimary(): ExpressionNode<any> {
        let token = this.getCurrentToken();

        if (this.isUnary(token)) {
            let operator = this.unaryOperators.get(token.value);
            this.getStream().next();
            let expr = this.parseExpression(operator.precedence);

            return this.parsePostfixExpression(operator.expressionFactory(expr, token));
        } else if (token.test(TokenType.PUNCTUATION, '(')) {
            this.getStream().next();
            let expr = this.parseExpression();
            this.getStream().expect(TokenType.PUNCTUATION, ')', 'An opened parenthesis is not properly closed');

            return this.parsePostfixExpression(expr);
        }

        return this.parsePrimaryExpression();
    }

    getFunctionNode(name: string, location: Location): ExpressionNode<any> {
        switch (name) {
            case 'parent': {
                this.parseArguments();

                if (!this.getBlockStack().length) {
                    throw new SyntaxError('Calling "parent" outside a block is forbidden.', null, location, this.getStream().source);
                }

                if (!this.getParent() && !this.hasTraits()) {
                    throw new SyntaxError('Calling "parent" on a template that does not extend nor "use" another template is forbidden.', null, location, this.getStream().source);
                }

                return new ParentExpressionNode({name: this.peekBlockStack()}, null, location);
            }
            case 'block': {
                let blockArguments = this.parseArguments();

                if (blockArguments.edgesCount < 1) {
                    throw new SyntaxError('The "block" function takes one argument (the block name).', null, location, this.getStream().source);
                }

                const elements = [...blockArguments].map(([, value]) => {
                    return value;
                });

                return new BlockReferenceExpressionNode({}, {
                    name: elements[0].edges.value,
                    template: elements.length > 1 ? elements[1].edges.value : null
                }, location);
            }
            case 'attribute': {
                let attributeArguments = this.parseArguments();

                if (attributeArguments.edgesCount < 2) {
                    throw new SyntaxError('The "attribute" function takes at least two arguments (the variable and the attributes).', null, location, this.getStream().source);
                }

                const elements = [...attributeArguments].map(([, value]) => {
                    return value;
                });

                // todo: to fix
                const functionArguments = elements.length > 2 ? (elements[2].edges.value as ArgumentsExpressionNode) : null;

                return this.resolveMethodCall(elements[0].edges.value, elements[1].edges.value, functionArguments, ANY_CALL);
            }
            default: {
                let alias = this.getImportedSymbol('function', name);

                if (alias) {
                    return new MethodCallExpressionNode({
                        method: alias.name,
                        isSafe: true
                    }, {
                        template: alias.node,
                        arguments: this.parseArguments()
                    }, location);
                }

                let aliasArguments = this.parseArguments(true);
                let aliasFactory = this.getFunctionExpressionFactory(name, location);

                return aliasFactory(null, name, aliasArguments, location);
            }
        }
    }

    protected resolveMethodCall(variable: ExpressionNode<any>, attribute: ExpressionNode<any>, methodArguments: ArgumentsExpressionNode, type: CallType): MethodCallExpressionNode | GetAttributeExpressionNode {
        if ((variable instanceof NameExpressionNode) && (attribute instanceof ConstantExpressionNode) && (
            this.getImportedSymbol('template', variable.attributes.value) || (variable.attributes.value === '_self')
        )) {
            return new MethodCallExpressionNode({
                method: attribute.attributes.value
            }, {
                template: variable,
                arguments: methodArguments
            }, variable.location);
        } else {
            return new GetAttributeExpressionNode({
                type
            }, {
                object: variable,
                attribute: attribute,
                arguments: methodArguments
            }, variable.location);
        }
    }

    parseStringExpression(): ExpressionNode<any> {
        let stream = this.getStream();

        let nodes: Array<ExpressionNode<any>> = [];
        // a string cannot be followed by another string in a single expression
        let nextCanBeString = true;
        let token;

        while (true) {
            if (nextCanBeString && (token = stream.nextIf(TokenType.STRING))) {
                const {line, column} = token;

                nodes.push(new ConstantExpressionNode<string>({value: token.value}, null, {line, column}));
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
            expr = new ConcatBinaryExpressionNode({}, {
                left: expr,
                right: node
            }, node.location);
        }

        return expr;
    }

    parseExpression(precedence: number = 0, allowArrow: boolean = false): ExpressionNode<any> {
        if (allowArrow) {
            let arrow = this.parseArrow();

            if (arrow) {
                return arrow;
            }
        }

        let expr = this.getPrimary();
        let token = this.getCurrentToken();

        while (this.isBinary(token) && this.binaryOperators.get(token.value).precedence >= precedence) {
            let operator: BinaryOperator = this.binaryOperators.get(token.value);

            this.getStream().next();

            if (token.value === 'is not') {
                expr = this.parseNotTestExpression(expr);
            } else if (token.value === 'is') {
                expr = this.parseTestExpression(expr);
            } else {
                let expr1 = this.parseExpression(operator.associativity === OperatorAssociativity.LEFT ? operator.precedence + 1 : operator.precedence);
                const expressionFactory = operator.expressionFactory;
                const {line, column} = token;

                expr = expressionFactory([expr, expr1], {line, column});
            }

            token = this.getCurrentToken();
        }

        if (precedence === 0) {
            return this.parseConditionalExpression(expr);
        }

        return expr;
    }

    parseArrow(): ArrowFunctionExpressionNode {
        const stream = this.getStream();
        const names: Map<string, ExpressionNode<{
            value: string
        }>> = new Map();

        let token: Token;
        let location: Location;

        const createNode = () => {
            return new ArrowFunctionExpressionNode({}, {
                    expr: this.parseExpression(0),
                    names: new Node(null, toNodeEdges(names), location)
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

            names.set('0', new AssignNameExpressionNode({value}, null, {line, column}));

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
                throw new SyntaxError(`Unexpected token "${typeToEnglish(token.type)}" of value "${token.value}".`, null, token, stream.source);
            }

            const {value, line, column} = token;

            names.set(`${i++}`, new AssignNameExpressionNode({value}, null, {line, column}));

            stream.next();

            if (!stream.nextIf(TokenType.PUNCTUATION, ',')) {
                break;
            }
        }

        stream.expect(TokenType.PUNCTUATION, ')');
        stream.expect(TokenType.ARROW);

        return createNode();
    }

    parsePrimaryExpression(): ExpressionNode<any> {
        let token: Token = this.getCurrentToken();
        let node: ExpressionNode<any>;

        const {line, column, type, value} = token;

        switch (type) {
            case TokenType.NAME:
                this.getStream().next();

                switch (value) {
                    case 'true':
                    case 'TRUE':
                        node = new ConstantExpressionNode<boolean>({value: true}, null, {line, column});
                        break;

                    case 'false':
                    case 'FALSE':
                        node = new ConstantExpressionNode<boolean>({value: false}, null, {line, column});
                        break;

                    case 'none':
                    case 'NONE':
                    case 'null':
                    case 'NULL':
                        node = new ConstantExpressionNode<null>({value: null}, null, {line, column});
                        break;

                    default:
                        if ('(' === this.getCurrentToken().value) {
                            node = this.getFunctionNode(value, {line, column});
                        } else {
                            node = new NameExpressionNode({value}, null, {line, column});
                        }
                }
                break;

            case TokenType.NUMBER:
                this.getStream().next();
                node = new ConstantExpressionNode<number>({value}, null, {line, column});
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
                    node = new NameExpressionNode({value}, null, {line, column});

                    break;
                } else if (this.unaryOperators.has(token.value)) {
                    let operator: UnaryOperator = this.unaryOperators.get(token.value);

                    this.getStream().next();

                    let expr = this.parsePrimaryExpression();

                    node = operator.expressionFactory(expr, {line, column});

                    break;
                }

            default:
                if (token.test(TokenType.PUNCTUATION, '[')) {
                    node = this.parseArrayExpression();
                } else if (token.test(TokenType.PUNCTUATION, '{')) {
                    node = this.parseHashExpression();
                } else if (token.test(TokenType.OPERATOR, '=') && (this.getStream().look(-1).value === '==' || this.getStream().look(-1).value === '!=')) {
                    throw new SyntaxError(`Unexpected operator of value "${token.value}". Did you try to use "===" or "!==" for strict comparison? Use "is same as(value)" instead.`, null, {
                        line,
                        column
                    }, this.getStream().source);
                } else {
                    throw new SyntaxError(`Unexpected token "${typeToEnglish(token.type)}" of value "${token.value}".`, null, {
                        line,
                        column
                    }, this.getStream().source);
                }
        }

        return this.parsePostfixExpression(node);
    }

    parseArrayExpression(): ExpressionNode<any> {
        const stream = this.getStream();

        stream.expect(TokenType.PUNCTUATION, '[', 'An array element was expected');

        const {line, column} = stream.getCurrent();
        const elements: Map<string, ArrayExpressionNodeEdge> = new Map();

        let i: number = 0;

        while (!stream.test(TokenType.PUNCTUATION, ']')) {
            if (i > 0) {
                stream.expect(TokenType.PUNCTUATION, ',', 'An array element must be followed by a comma');

                // trailing ,?
                if (stream.test(TokenType.PUNCTUATION, ']')) {
                    break;
                }
            }

            elements.set(`${i}`, new Node(null, {
                    key: new ConstantExpressionNode({value: i}, null, {line, column}),
                    value: this.parseExpression()
                }, {line, column})
            );

            i++;

            // todo: remove this comment when everything works
            //node.addElement(this.parseExpression());
        }

        stream.expect(TokenType.PUNCTUATION, ']', 'An opened array is not properly closed');

        return new ArrayExpressionNode({}, toNodeEdges(elements), {line, column});
    }

    parseHashExpression(): ExpressionNode<any> {
        const stream = this.getStream();
        const {line, column} = stream.getCurrent();

        stream.expect(TokenType.PUNCTUATION, '{', 'A hash element was expected');

        const elements: Map<string, HashExpressionNodeEdge> = new Map();

        let i: number = 0;

        while (!stream.test(TokenType.PUNCTUATION, '}')) {
            if (i > 0) {
                stream.expect(TokenType.PUNCTUATION, ',', 'A hash value must be followed by a comma');

                // trailing ,?
                if (stream.test(TokenType.PUNCTUATION, '}')) {
                    break;
                }
            }

            // a hash key can be:
            //
            //  * a number -- 12
            //  * a string -- 'a'
            //  * a name, which is equivalent to a string -- a
            //  * an expression, which must be enclosed in parentheses -- (1 + 2)
            let token;
            let key;

            if ((token = stream.nextIf(TokenType.STRING)) || (token = stream.nextIf(TokenType.NAME)) || (token = stream.nextIf(TokenType.NUMBER))) {
                key = new ConstantExpressionNode({value: token.value}, {}, token);
            } else if (stream.test(TokenType.PUNCTUATION, '(')) {
                key = this.parseExpression();
            } else {
                let current = stream.getCurrent();

                throw new SyntaxError(`A hash key must be a quoted string, a number, a name, or an expression enclosed in parentheses (unexpected token "${typeToEnglish(current.type)}" of value "${current.value}".`, null, current, stream.source);
            }

            stream.expect(TokenType.PUNCTUATION, ':', 'A hash key must be followed by a colon (:)');

            // todo: remove following when ok
            //let value = this.parseExpression();
            //node.addElement(value, key);

            const {line, column} = token;

            elements.set(`${i}`, new Node(null, {
                key,
                value: this.parseExpression()
            }, {line, column}));

            i++;
        }

        stream.expect(TokenType.PUNCTUATION, '}', 'An opened hash is not properly closed');

        return new HashExpressionNode({}, toNodeEdges(elements), {line, column});
    }

    parseSubscriptExpression(node: ExpressionNode<any>): ExpressionNode<any> {
        const stream = this.getStream();

        let token = stream.next();

        const elements: Map<string, ArgumentExpressionNode> = new Map();

        let attribute: ExpressionNode<any>;
        let methodArguments: ArgumentsExpressionNode;
        let type: CallType = ANY_CALL;

        if (token.value === '.') {
            token = stream.next();

            let match = nameRegExp.exec(token.value);

            if ((token.type === TokenType.NAME) || (token.type === TokenType.NUMBER) || (token.type === TokenType.OPERATOR && (match !== null))) {
                attribute = new ConstantExpressionNode({value: token.value}, {}, token);

                if (stream.test(TokenType.PUNCTUATION, '(')) {
                    type = METHOD_CALL;

                    let argumentsNode = this.parseArguments();
                    let i: number = 0;

                    for (let [key, methodArgument] of argumentsNode) {
                        elements.set(key, new Node(null, {
                            //key: new ConstantExpressionNode({value: i}, null, methodArgument.location),
                            value: methodArgument.edges.value
                        }, methodArgument.location));

                        i++;
                    }
                }
            } else {
                throw new SyntaxError('Expected name or number.', null, token, stream.source);
            }
        } else {
            type = ARRAY_CALL;

            // slice?
            let slice = false;

            if (stream.test(TokenType.PUNCTUATION, ':')) {
                slice = true;
                attribute = new ConstantExpressionNode<number>({value: 0}, null, token);
            } else {
                attribute = this.parseExpression();
            }

            if (stream.nextIf(TokenType.PUNCTUATION, ':')) {
                slice = true;
            }

            if (slice) {
                let length: ExpressionNode<any>;

                if (stream.test(TokenType.PUNCTUATION, ']')) {
                    length = new ConstantExpressionNode<number>({value: 0}, null, token);
                } else {
                    length = this.parseExpression();
                }

                const {line, column} = token;

                let factory = this.getFilterExpressionFactory('slice', token);
                let filterArguments = new ArgumentsExpressionNode({}, {
                    0: new ArgumentExpressionNode(null, {
                        //key: new ConstantExpressionNode({value: 0}, null, {line, column}),
                        value: attribute
                    }, {line, column}),
                    1: new ArgumentExpressionNode(null, {
                        //key: new ConstantExpressionNode({value: 1}, null, {line, column}),
                        value: length
                    }, {line, column})
                }, {line, column});

                //new Map([[0, arg], [1, length]]
                let filter = factory(node, 'slice', filterArguments, token);

                stream.expect(TokenType.PUNCTUATION, ']');

                return filter;
            }

            stream.expect(TokenType.PUNCTUATION, ']');
        }

        methodArguments = new ArgumentsExpressionNode({}, toNodeEdges(elements), node.location);

        return this.resolveMethodCall(node, attribute, methodArguments, type);
    }

    parsePostfixExpression(node: ExpressionNode<any>): ExpressionNode<any> {
        while (true) {
            let token = this.getCurrentToken();

            if (token.type === TokenType.PUNCTUATION) {
                if (token.value === '.' || token.value === '[') {
                    node = this.parseSubscriptExpression(node);
                } else if (token.value === '|') {
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

    parseTestExpression(node: ExpressionNode<any>): ExpressionNode<any> {
        let stream = this.getStream();
        let name: string;
        let test: Test;

        [name, test] = this.getTest(node.location);

        let testArguments = null;

        if (stream.test(TokenType.PUNCTUATION, '(')) {
            testArguments = this.parseArguments(true);
        }

        if ((name === 'defined') && (node instanceof NameExpressionNode)) {
            let alias = this.getImportedSymbol('function', node.attributes.value);

            if (alias !== null) {
                node = new MethodCallExpressionNode({
                    method: alias.name,
                    isSafe: true
                }, {
                    template: alias.node,
                    arguments: new ArgumentsExpressionNode({}, {}, node.location)
                }, node.location);
            }
        }

        return test.expressionFactory.call(this, node, name, testArguments, this.getCurrentToken().line);
    }

    parseNotTestExpression(node: ExpressionNode<any>): ExpressionNode<any> {
        return new NotUnaryExpressionNode({}, {operand: this.parseTestExpression(node)}, this.getCurrentToken());
    }

    parseConditionalExpression(expr: ExpressionNode<any>): ExpressionNode<any> {
        let expr2;
        let expr3;

        while (this.getStream().nextIf(TokenType.PUNCTUATION, '?')) {
            if (!this.getStream().nextIf(TokenType.PUNCTUATION, ':')) {
                expr2 = this.parseExpression();

                if (this.getStream().nextIf(TokenType.PUNCTUATION, ':')) {
                    expr3 = this.parseExpression();
                } else {
                    expr3 = new ConstantExpressionNode({value: ''}, null, this.getCurrentToken());
                }
            } else {
                expr2 = expr;
                expr3 = this.parseExpression();
            }

            expr = new ConditionalExpressionNode({}, {
                expr1: expr,
                expr2,
                expr3
            }, this.getCurrentToken());
        }

        return expr;
    }

    parseFilterExpression(node: ExpressionNode<any>): ExpressionNode<any> {
        this.getStream().next();

        return this.parseFilterExpressionRaw(node);
    }

    parseFilterExpressionRaw(node: ExpressionNode<any>, tag: string = null): ExpressionNode<any> {
        while (true) {
            const token = this.getStream().expect(TokenType.NAME);
            const {line, column} = token;

            let name = new ConstantExpressionNode<string>({value: token.value}, {}, {line, column});
            let methodArguments: ArgumentsExpressionNode;

            if (!this.getStream().test(TokenType.PUNCTUATION, '(')) {
                methodArguments = new ArgumentsExpressionNode(null, null, {line, column});
            } else {
                methodArguments = this.parseArguments(true, false, true);
            }

            let factory = this.getFilterExpressionFactory(name.attributes.value, {line, column});

            node = factory(node, name.attributes.value, methodArguments, {line, column});

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
    parseArguments(namedArguments: boolean = false, definition: boolean = false, allowArrow: boolean = false): ArgumentsExpressionNode {
        let parsedArguments: Map<string, ExpressionNode<any>> = new Map();
        let stream = this.getStream();
        let value: ExpressionNode<any>;
        let token;

        const {line, column} = stream.getCurrent();

        stream.expect(TokenType.PUNCTUATION, '(', 'A list of arguments must begin with an opening parenthesis');

        while (!stream.test(TokenType.PUNCTUATION, ')')) {
            if (parsedArguments.size > 0) {
                stream.expect(TokenType.PUNCTUATION, ',', 'Arguments must be separated by a comma');
            }

            if (definition) {
                token = stream.expect(TokenType.NAME, null, 'An argument must be a name');

                const {line, column} = this.getCurrentToken();

                value = new NameExpressionNode({value: token.value}, null, {line, column});
            } else {
                value = this.parseExpression(0, allowArrow);
            }

            let name = null;

            if (namedArguments && (token = stream.nextIf(TokenType.OPERATOR, '='))) {
                if (!(value instanceof NameExpressionNode)) {
                    throw new SyntaxError(`A parameter name must be a string, "${value.constructor.name}" given.`, null, token, stream.source);
                }

                name = value.attributes.value;

                if (definition) {
                    value = this.parsePrimaryExpression();

                    if (!this.checkConstantExpression(value)) {
                        throw new SyntaxError(`A default value for an argument must be a constant (a boolean, a string, a number, or an array).`, null, token, stream.source);
                    }
                } else {
                    value = this.parseExpression(0, allowArrow);
                }
            }

            if (definition) {
                if (name === null) {
                    // we know for sure that value is an instance of TwingNodeExpressionName
                    name = (value as NameExpressionNode).attributes.value;
                    value = new ConstantExpressionNode({value: null}, {}, this.getCurrentToken());
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

        const elements: Map<string, ArgumentExpressionNode> = new Map();

        for (let [key, value] of parsedArguments) {
            elements.set(key, new Node(null, {
                //key: new ConstantExpressionNode<string>({value: key}, null, value.location),
                value
            }, value.location));
        }

        return new Node(null, toNodeEdges(elements), {line, column});
    }

    parseAssignmentExpression(): Node<null, NodeEdges<AssignNameExpressionNode>> {
        const stream = this.getStream();
        const targets: Map<string, AssignNameExpressionNode> = new Map();
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
                throw new SyntaxError(`You cannot assign a value to "${value}".`, null, token, stream.source);
            }

            push(targets, new AssignNameExpressionNode({value}, null, token));

            if (!stream.nextIf(TokenType.PUNCTUATION, ',')) {
                break;
            }
        }

        return new Node(null, toNodeEdges(targets), {line, column});
    }

    parseMultiTargetExpression(): Node<null, NodeEdges<ExpressionNode<any>>> {
        const stream = this.getStream();
        const {line, column} = stream.getCurrent();
        const targets: Map<string, ExpressionNode<any>> = new Map();

        while (true) {
            push(targets, this.parseExpression());

            if (!stream.nextIf(TokenType.PUNCTUATION, ',')) {
                break;
            }
        }

        return new Node(null, toNodeEdges(targets), {line, column});
    }

    /**
     * Checks that the node only contains "constant" elements
     */
    protected checkConstantExpression(node: Node): boolean {
        if (!(node instanceof ConstantExpressionNode || node instanceof ArrayExpressionNode || node instanceof NegativeUnaryExpressionNode || node instanceof PositiveUnaryExpressionNode)) {
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
        }, location, stream.source);
    }

    protected getFunctionExpressionFactory(name: string, location: Location): CallableWrapperExpressionFactory {
        let function_ = this.env.getFunction(name);

        if (!function_) {
            throw new SyntaxError(`Unknown "${name}" function.`, {
                value: name,
                candidates: [...this.env.getFunctions().keys()]
            }, location, this.getStream().source);
        }

        return this.getExpressionFactory(function_, 'function', location);
    }

    protected getFilterExpressionFactory(name: string, location: Location): CallableWrapperExpressionFactory {
        let filter = this.env.getFilter(name);

        if (!filter) {
            throw new SyntaxError(`Unknown "${name}" filter.`, {
                value: name,
                candidates: [...this.env.getFilters().keys()]
            }, location, this.getStream().source);
        }

        return this.getExpressionFactory(filter, 'filter', location);
    }

    private getExpressionFactory(callableWrapper: CallableWrapper<any, any>, type: 'function' | 'filter', location: Location): CallableWrapperExpressionFactory {
        if (callableWrapper.isDeprecated) {
            let message = `Twing ${title(type)} "${callableWrapper.name}" is deprecated`;

            if (callableWrapper.deprecatedVersion !== true) {
                message += ` since version ${callableWrapper.deprecatedVersion}`;
            }

            if (callableWrapper.alternative) {
                message += `. Use "${callableWrapper.alternative}" instead`;
            }

            let source = this.getStream().source;

            message += ` in "${source.name}" at line ${location.line}, column ${location.column}.`;

            process.stdout.write(message);
        }

        return callableWrapper.expressionFactory;
    }
}
