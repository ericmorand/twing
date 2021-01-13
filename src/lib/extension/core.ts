import {Extension} from "../extension";
import {Location, Node} from "../node";
import {Function} from "../function";
import {ExpressionNode} from "../node/expression";
import {DefinedTestExpressionNode} from "../node/expression/test/defined";
import {Test} from "../test";
import {Filter} from "../filter";
import {Settings as DateTimeSettings} from 'luxon';
import {ConstantExpressionNode} from "../node/expression/constant";
import {DefaultFilterExpressionNode} from "../node/expression/filter/default";
import {merge} from "../helpers/merge";
import {slice} from "../helpers/slice";
import {reverse} from "../helpers/reverse";
import {first} from "../helpers/first";
import {Operator, OperatorAssociativity} from "../operator";
import {even} from "./core/tests/even";
import {odd} from "./core/tests/odd";
import {sameAs} from "./core/tests/same-as";
import {nullTest} from "./core/tests/null";
import {divisibleBy} from "./core/tests/divisible-by";
import {min} from "./core/functions/min";
import {max} from "./core/functions/max";
import {date} from "./core/filters/date";
import {dateModify} from "./core/filters/date-modify";
import {format} from "./core/filters/format";
import {replace} from "./core/filters/replace";
import {numberFormat} from "./core/filters/number-format";
import {abs} from "./core/filters/abs";
import {urlEncode} from "./core/filters/url-encode";
import {jsonEncode} from "./core/filters/json-encode";
import {convertEncoding} from "./core/filters/convert-encoding";
import {title} from "./core/filters/title";
import {capitalize} from "./core/filters/capitalize";
import {upper} from "./core/filters/upper";
import {lower} from "./core/filters/lower";
import {striptags} from "./core/filters/striptags";
import {trim} from "./core/filters/trim";
import {nl2br} from "./core/filters/nl2br";
import {raw} from "./core/filters/raw";
import {join} from "./core/filters/join";
import {split} from "./core/filters/split";
import {sort} from "./core/filters/sort";
import {merge as mergeFilter} from "./core/filters/merge";
import {batch} from "./core/filters/batch";
import {reverse as reverseFilter} from "./core/filters/reverse";
import {length} from "./core/filters/length";
import {slice as sliceFilter} from "./core/filters/slice";
import {first as firstFilter} from "./core/filters/first";
import {last} from "./core/filters/last";
import {defaultFilter} from "./core/filters/default";
import {escape} from "./core/filters/escape";
import {round} from "./core/filters/round";
import {include} from "./core/functions/include";
import {arrayKeys} from "./core/filters/array-keys";
import {spaceless} from "./core/filters/spaceless";
import {column} from "./core/filters/column";
import {filter} from "./core/filters/filter";
import {map} from "./core/filters/map";
import {reduce} from "./core/filters/reduce";
import {BaseNodeVisitor} from "../base-node-visitor";
import {range} from "./core/functions/range";
import {constant} from "./core/functions/constant";
import {cycle} from "./core/functions/cycle";
import {random} from "./core/functions/random";
import {source} from "./core/functions/source";
import {templateFromString} from "./core/functions/template-from-string";
import {dump} from "./core/functions/dump";
import {empty} from "./core/tests/empty";
import {iterable} from "./core/tests/iterable";
import {date as dateFunction} from "./core/functions/date";
import {SpacelessSourceMapNodeFactory} from "../source-map/node-factory/spaceless";
import {SourceMapNodeFactory} from "../source-map/node-factory";
import {ConstantTestExpressionNode} from "../node/expression/test/constant";
import {extname, basename} from "path";
import {Environment, EscapingStrategyResolver} from "../environment";
import {TokenParserInterface} from "../token-parser-interface";
import {EscaperNodeVisitor} from "../node-visitor/escaper";
import {SandboxNodeVisitor} from "../node-visitor/sandbox";
import {ApplyTokenParser} from "../token-parser/apply";
import {AutoEscapeTokenParser} from "../token-parser/auto-escape";
import {BlockTokenParser} from "../token-parser/block";
import {DeprecatedTokenParser} from "../token-parser/deprecated";
import {DoTokenParser} from "../token-parser/do";
import {EmbedTokenParser} from "../token-parser/embed";
import {ExtendsTokenParser} from "../token-parser/extends";
import {FilterTokenParser} from "../token-parser/filter";
import {FlushTokenParser} from "../token-parser/flush";
import {ForTokenParser} from "../token-parser/for";
import {FromTokenParser} from "../token-parser/from";
import {IfTokenParser} from "../token-parser/if";
import {ImportTokenParser} from "../token-parser/import";
import {IncludeTokenParser} from "../token-parser/include";
import {LineTokenParser} from "../token-parser/line";
import {MacroTokenParser} from "../token-parser/macro";
import {SandboxTokenParser} from "../token-parser/sandbox";
import {SetTokenParser} from "../token-parser/set";
import {SpacelessTokenParser} from "../token-parser/spaceless";
import {UseTokenParser} from "../token-parser/use";
import {VerbatimTokenParser} from "../token-parser/verbatim";
import {WithTokenParser} from "../token-parser/with";
import {UnaryOperator} from "../operator/unary";
import {NotUnaryExpressionNode} from "../node/expression/unary/not";
import {NegativeUnaryExpressionNode} from "../node/expression/unary/neg";
import {PositiveUnaryExpressionNode} from "../node/expression/unary/pos";
import {BinaryOperator} from "../operator/binary";
import {OrBinaryExpressionNode} from "../node/expression/binary/or";
import {AndBinaryExpressionNode} from "../node/expression/binary/and";
import {BitwiseOrBinaryExpressionNode} from "../node/expression/binary/bitwise-or";
import {BitwiseXorBinaryExpressionNode} from "../node/expression/binary/bitwise-xor";
import {BitwiseAndBinaryExpressionNode} from "../node/expression/binary/bitwise-and";
import {EqualBinaryExpressionNode} from "../node/expression/binary/equal";
import {NotEqualBinaryExpressionNode} from "../node/expression/binary/not-equal";
import {LessBinaryExpressionNode} from "../node/expression/binary/less";
import {LessOrEqualBinaryExpressionNode} from "../node/expression/binary/less-equal";
import {GreaterBinaryExpressionNode} from "../node/expression/binary/greater";
import {GreaterOrEqualBinaryExpressionNode} from "../node/expression/binary/greater-equal";
import {NotInBinaryExpressionNode} from "../node/expression/binary/not-in";
import {InBinaryExpressionNode} from "../node/expression/binary/in";
import {MatchesBinaryExpressionNode} from "../node/expression/binary/matches";
import {StartsWithBinaryExpressionNode} from "../node/expression/binary/starts-with";
import {EndsWithBinaryExpressionNode} from "../node/expression/binary/ends-with";
import {RangeBinaryExpressionNode} from "../node/expression/binary/range";
import {AddBinaryExpressionNode} from "../node/expression/binary/add";
import {SubtractBinaryExpressionNode} from "../node/expression/binary/sub";
import {ConcatBinaryExpressionNode} from "../node/expression/binary/concat";
import {MultiplyBinaryExpressionNode} from "../node/expression/binary/mul";
import {DivBinaryExpressionNode} from "../node/expression/binary/div";
import {FloorDivBinaryExpressionNode} from "../node/expression/binary/floor-div";
import {ModuloBinaryExpressionNode} from "../node/expression/binary/mod";
import {PowerBinaryExpressionNode} from "../node/expression/binary/power";
import {NullCoalesceExpressionNode} from "../node/expression/null-coalesce";

export type Escaper = (env: Environment, string: string, charset: string) => string;

export class CoreExtension extends Extension {
    private _dateFormats: Array<string> = ['F j, Y H:i', '%d days'];
    private numberFormat: Array<number | string> = [0, '.', ','];
    private timezone: string = null;
    private defaultStrategy: string | false | EscapingStrategyResolver;

    private readonly _escapers: Map<string, Escaper>;

    /**
     * @param {string | false | EscapingStrategyResolver} defaultStrategy An escaping strategy
     */
    constructor(defaultStrategy: string | false | EscapingStrategyResolver = 'html') {
        super();

        this._escapers = new Map();
        this.setDefaultStrategy(defaultStrategy);
    }


    get escapers() {
        return this._escapers;
    }

    /**
     * The default format to be used by the date filter.
     */
    get dateFormat() {
        return this._dateFormats;
    }

    /**
     * Sets the default strategy to use when not defined by the user.
     *
     * @param {string | false | EscapingStrategyResolver} defaultStrategy An escaping strategy
     */
    setDefaultStrategy(defaultStrategy: string | false | EscapingStrategyResolver) {
        if (defaultStrategy === 'name') {
            defaultStrategy = (name: string) => {
                let extension = extname(name);

                if (extension === '.twig') {
                    name = basename(name, extension);

                    extension = extname(name);
                }

                switch (extension) {
                    case '.js':
                        return 'js';

                    case '.css':
                        return 'css';

                    case '.txt':
                        return false;

                    default:
                        return 'html';
                }
            };
        }

        this.defaultStrategy = defaultStrategy;
    }

    /**
     * Gets the default escaping strategy.
     *
     * @param {string} name The template name
     *
     * @returns {string | false} The default strategy to use for the template
     */
    getDefaultStrategy(name: string): string | false {
        if (typeof this.defaultStrategy === 'function') {
            return this.defaultStrategy(name);
        }

        return this.defaultStrategy;
    }

    /**
     * Defines a new escaper to be used via the escape filter.
     */
    addEscaper(strategy: string, callable: Escaper) {
        this._escapers.set(strategy, callable);
    }

    /**
     * Sets the default format to be used by the date filter.
     *
     * @param {string} format The default date format string
     * @param {string} dateIntervalFormat The default date interval format string
     */
    setDateFormat(format: string = null, dateIntervalFormat: string = null) {
        if (format !== null) {
            this._dateFormats[0] = format;
        }

        if (dateIntervalFormat !== null) {
            this._dateFormats[1] = dateIntervalFormat;
        }
    }

    /**
     * Sets the default timezone to be used by the date filter.
     *
     * @param {string} timezone The default timezone string or a TwingDateTimeZone object
     */
    setTimezone(timezone: string) {
        this.timezone = timezone;
    }

    /**
     * Gets the default timezone to be used by the date filter.
     *
     * @returns {string} The default timezone currently in use
     */
    getTimezone(): string {
        if (this.timezone === null) {
            this.timezone = DateTimeSettings.defaultZoneName;
        }

        return this.timezone;
    }

    /**
     * Sets the default format to be used by the number_format filter.
     *
     * @param {number} decimal the number of decimal places to use
     * @param {string} decimalPoint the character(s) to use for the decimal point
     * @param {string} thousandSep  the character(s) to use for the thousands separator
     */
    setNumberFormat(decimal: number, decimalPoint: string, thousandSep: string) {
        this.numberFormat = [decimal, decimalPoint, thousandSep];
    }

    /**
     * Get the default format used by the number_format filter.
     *
     * @return array The arguments for number_format()
     */
    getNumberFormat() {
        return this.numberFormat;
    }

    getTokenParsers(): Array<TokenParserInterface> {
        return [
            new ApplyTokenParser(),
            new AutoEscapeTokenParser(),
            new BlockTokenParser(),
            new DeprecatedTokenParser(),
            new DoTokenParser(),
            new EmbedTokenParser(),
            new ExtendsTokenParser(),
            new FilterTokenParser(),
            new FlushTokenParser(),
            new ForTokenParser(),
            new FromTokenParser(),
            new IfTokenParser(),
            new ImportTokenParser(),
            new IncludeTokenParser(),
            new LineTokenParser(),
            new MacroTokenParser(),
            new SandboxTokenParser(),
            new SetTokenParser(),
            new SpacelessTokenParser(),
            new UseTokenParser(),
            new VerbatimTokenParser(),
            new WithTokenParser()
        ];
    }

    getSourceMapNodeFactories(): Map<string, SourceMapNodeFactory> {
        return new Map([
            ['spaceless', new SpacelessSourceMapNodeFactory()]
        ]);
    }

    getNodeVisitors(): BaseNodeVisitor[] {
        return [
            new EscaperNodeVisitor(),
            new SandboxNodeVisitor()
        ];
    }

    getFilters() {
        return [
            new Filter('abs', abs, []),
            new Filter('batch', batch, [
                {name: 'size'},
                {name: 'fill', defaultValue: null},
                {name: 'preserve_keys', defaultValue: true}
            ]),
            new Filter('capitalize', capitalize, [], {
                needsTemplate: true
            }),
            new Filter('column', column, [
                {name: 'name'}
            ]),
            new Filter('convert_encoding', convertEncoding, [
                {name: 'to'},
                {name: 'from'}
            ], {
                preEscape: 'html',
                isSafe: ['html']
            }),
            new Filter('date', date, [
                {name: 'format', defaultValue: null},
                {name: 'timezone', defaultValue: null}
            ], {
                needsTemplate: true
            }),
            new Filter('date_modify', dateModify, [
                {name: 'modifier'}
            ], {
                needsTemplate: true
            }),
            new Filter('default', defaultFilter, [
                {name: 'default'}
            ], {
                expressionFactory: (node: Node, filterName: string, filterArguments: Node, location: Location) => {
                    return new DefaultFilterExpressionNode(node, filterName, filterArguments, location.line, location.column);
                }
            }),
            new Filter('e', escape, [
                {name: 'strategy'},
                {name: 'charset'}
            ], {
                needsTemplate: true,
                isSafeCallback: this.escapeFilterIsSafe
            }),
            new Filter('escape', escape, [
                {name: 'strategy'},
                {name: 'charset'}
            ], {
                needsTemplate: true,
                isSafeCallback: this.escapeFilterIsSafe
            }),
            new Filter('filter', filter, [
                {name: 'array'},
                {name: 'arrow'}
            ]),
            new Filter('first', firstFilter, []),
            new Filter('format', format, []),
            new Filter('join', join, [
                {name: 'glue', defaultValue: ''},
                {name: 'and', defaultValue: null}
            ]),
            new Filter('json_encode', jsonEncode, [
                {name: 'options', defaultValue: null}
            ]),
            new Filter('keys', arrayKeys, []),
            new Filter('last', last, []),
            new Filter('length', length, [], {
                needsTemplate: true
            }),
            new Filter('lower', lower, [], {
                needsTemplate: true
            }),
            new Filter('map', map, [
                {name: 'arrow'}
            ]),
            new Filter('merge', mergeFilter, []),
            new Filter('nl2br', nl2br, [], {
                preEscape: 'html',
                isSafe: ['html']
            }),
            new Filter('number_format', numberFormat, [
                {name: 'decimal'},
                {name: 'decimal_point'},
                {name: 'thousand_sep'}
            ], {
                needsTemplate: true
            }),
            new Filter('raw', raw, [], {
                isSafe: ['all']
            }),
            new Filter('reduce', reduce, [
                {name: 'arrow'},
                {name: 'initial', defaultValue: null}
            ]),
            new Filter('replace', replace, [
                {name: 'from'}
            ]),
            new Filter('reverse', reverseFilter, [
                {name: 'preserve_keys', defaultValue: false}
            ]),
            new Filter('round', round, [
                {name: 'precision', defaultValue: 0},
                {name: 'method', defaultValue: 'common'}
            ]),
            new Filter('slice', sliceFilter, [
                {name: 'start'},
                {name: 'length', defaultValue: null},
                {name: 'preserve_keys', defaultValue: false}
            ]),
            new Filter('sort', sort, []),
            new Filter('spaceless', spaceless, [], {
                isSafe: ['html']
            }),
            new Filter('split', split, [
                {name: 'delimiter'},
                {name: 'limit'}
            ]),
            new Filter('striptags', striptags, [
                {name: 'allowable_tags'}
            ]),
            new Filter('title', title, []),
            new Filter('trim', trim, [
                {name: 'character_mask', defaultValue: null},
                {name: 'side', defaultValue: 'both'}
            ]),
            new Filter('upper', upper, []),
            new Filter('url_encode', urlEncode, []),
        ];
    }

    getFunctions() {
        return [
            new Function('constant', constant, [
                {name: 'name'},
                {name: 'object', defaultValue: null}
            ], {
                needsTemplate: true
            }),
            new Function('cycle', cycle, [
                {name: 'values'},
                {name: 'position'}
            ]),
            new Function('date', dateFunction, [
                {name: 'date'},
                {name: 'timezone'}
            ], {
                needsTemplate: true
            }),
            new Function('dump', dump, [], {
                isSafe: ['html'],
                needsContext: true
            }),
            new Function('include', include, [
                {name: 'template'},
                {name: 'variables', defaultValue: {}},
                {name: 'with_context', defaultValue: true},
                {name: 'ignore_missing', defaultValue: false},
                {name: 'sandboxed', defaultValue: false}
            ], {
                needsTemplate: true,
                needsContext: true,
                needsOutputBuffer: true,
                isSafe: ['all']
            }),
            new Function('max', max, []),
            new Function('min', min, []),
            new Function('random', random, [
                {name: 'values', defaultValue: null},
                {name: 'max', defaultValue: null}
            ], {
                needsTemplate: true
            }),
            new Function('range', range, [
                {name: 'low'},
                {name: 'high'},
                {name: 'step'}
            ]),
            new Function('source', source, [
                {name: 'name'},
                {name: 'ignore_missing', defaultValue: false}
            ], {
                needsTemplate: true,
                isSafe: ['all']
            }),
            new Function('template_from_string', templateFromString, [
                {name: 'template'},
                {name: 'name', defaultValue: null}
            ], {
                needsTemplate: true
            })
        ];
    }

    getTests(): Array<Test> {
        return [
            new Test('constant', null, [], {
                expressionFactory: (node: ExpressionNode<any>, name: string, testArguments: Node, location: Location) => {
                    return new ConstantTestExpressionNode({name}, {node, arguments: testArguments}, location);
                }
            }),
            new Test('divisible by', divisibleBy, []),
            new Test('defined', null, [], {
                expressionFactory: (node: ExpressionNode<any>, name: string, testArguments: Node, location: Location) => {
                    return new DefinedTestExpressionNode(node, name, testArguments, location.line, location.column);
                }
            }),
            new Test('empty', empty, []),
            new Test('even', even, []),
            new Test('iterable', iterable, []),
            new Test('none', nullTest, []),
            new Test('null', nullTest, []),
            new Test('odd', odd, []),
            new Test('same as', sameAs, []),
        ];
    }

    getOperators(): Operator<any>[] {
        return [
            new UnaryOperator('not', 50, (operand, location) => {
                return new NotUnaryExpressionNode(null, {operand}, location);
            }),
            new UnaryOperator('-', 500, (operand, location) => {
                return new NegativeUnaryExpressionNode(null, {operand}, location);
            }),
            new UnaryOperator('+', 500, (operand, location) => {
                return new PositiveUnaryExpressionNode(null, {operand}, location);
            }),
            new BinaryOperator('or', 10, (operands, location) => {
                return new OrBinaryExpressionNode({}, {left: operands[0], right: operands[1]}, location);
            }),
            new BinaryOperator('and', 15, (operands, location) => {
                return new AndBinaryExpressionNode({}, {left: operands[0], right: operands[1]}, location);
            }),
            new BinaryOperator('b-or', 16, (operands, location) => {
                return new BitwiseOrBinaryExpressionNode({}, {left: operands[0], right: operands[1]}, location);
            }),
            new BinaryOperator('b-xor', 17, (operands, location) => {
                return new BitwiseXorBinaryExpressionNode({}, {left: operands[0], right: operands[1]}, location);
            }),
            new BinaryOperator('b-and', 18, (operands, location) => {
                return new BitwiseAndBinaryExpressionNode({}, {left: operands[0], right: operands[1]}, location);
            }),
            new BinaryOperator('==', 20, (operands, location) => {
                return new EqualBinaryExpressionNode({}, {left: operands[0], right: operands[1]}, location);
            }),
            new BinaryOperator('!=', 20, (operands, location) => {
                return new NotEqualBinaryExpressionNode({}, {left: operands[0], right: operands[1]}, location);
            }),
            new BinaryOperator('<', 20, (operands, location) => {
                return new LessBinaryExpressionNode({}, {left: operands[0], right: operands[1]}, location);
            }),
            new BinaryOperator('<=', 20, (operands, location) => {
                return new LessOrEqualBinaryExpressionNode({}, {left: operands[0], right: operands[1]}, location);
            }),
            new BinaryOperator('>', 20, (operands, location) => {
                return new GreaterBinaryExpressionNode({}, {left: operands[0], right: operands[1]}, location);
            }),
            new BinaryOperator('>=', 20, (operands, location) => {
                return new GreaterOrEqualBinaryExpressionNode({}, {left: operands[0], right: operands[1]}, location);
            }),
            new BinaryOperator('not in', 20, (operands, location) => {
                return new NotInBinaryExpressionNode({}, {left: operands[0], right: operands[1]}, location);
            }),
            new BinaryOperator('in', 20, (operands, location) => {
                return new InBinaryExpressionNode({}, {left: operands[0], right: operands[1]}, location);
            }),
            new BinaryOperator('matches', 20, (operands, location) => {
                return new MatchesBinaryExpressionNode({}, {left: operands[0], right: operands[1]}, location);
            }),
            new BinaryOperator('starts with', 20, (operands, location) => {
                return new StartsWithBinaryExpressionNode({}, {left: operands[0], right: operands[1]}, location);
            }),
            new BinaryOperator('ends with', 20, (operands, location) => {
                return new EndsWithBinaryExpressionNode({}, {left: operands[0], right: operands[1]}, location);
            }),
            new BinaryOperator('..', 25, (operands, location) => {
                return new RangeBinaryExpressionNode({}, {left: operands[0], right: operands[1]}, location);
            }),
            new BinaryOperator('+', 30, (operands, location) => {
                return new AddBinaryExpressionNode({}, {left: operands[0], right: operands[1]}, location);
            }),
            new BinaryOperator('-', 30, (operands, location) => {
                return new SubtractBinaryExpressionNode({}, {left: operands[0], right: operands[1]}, location);
            }),
            new BinaryOperator('~', 40, (operands, location) => {
                return new ConcatBinaryExpressionNode({}, {left: operands[0], right: operands[1]}, location);
            }),
            new BinaryOperator('*', 60, (operands, location) => {
                return new MultiplyBinaryExpressionNode({}, {left: operands[0], right: operands[1]}, location);
            }),
            new BinaryOperator('/', 60, (operands, location) => {
                return new DivBinaryExpressionNode({}, {left: operands[0], right: operands[1]}, location);
            }),
            new BinaryOperator('//', 60, (operands, location) => {
                return new FloorDivBinaryExpressionNode({}, {left: operands[0], right: operands[1]}, location);
            }),
            new BinaryOperator('%', 60, (operands, location) => {
                return new ModuloBinaryExpressionNode({}, {left: operands[0], right: operands[1]}, location);
            }),
            new BinaryOperator('is', 100, null),
            new BinaryOperator('is not', 100, null),
            new BinaryOperator('**', 200, (operands, location) => {
                return new PowerBinaryExpressionNode({}, {
                    left: operands[0],
                    right: operands[1]
                }, location, OperatorAssociativity.RIGHT)
            }),
            new BinaryOperator('??', 300, (operands, location) => {
                return new NullCoalesceExpressionNode(operands, location);
            }, OperatorAssociativity.RIGHT)
        ];
    }

    /**
     * @internal
     */
    private escapeFilterIsSafe(filterArgs: Node) {
        if (filterArgs.edgesCount > 0) {
            let result: Array<string> = [];

            for (let arg of filterArgs) {
                if (arg instanceof ConstantExpressionNode) {
                    result = [arg.attributes.value];
                }
            }

            return result;
        } else {
            return ['html'];
        }
    }
}
