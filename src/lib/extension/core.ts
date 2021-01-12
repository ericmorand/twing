import {TwingExtension} from "../extension";
import {ForTokenParser} from "../token-parser/for";
import {AndBinaryExpressionNode} from "../node/expression/binary/and";
import {ExtendsTokenParser} from "../token-parser/extends";
import {FromTokenParser} from "../token-parser/from";
import {MacroTokenParser} from "../token-parser/macro";
import {Location, Node} from "../node";
import {InBinaryExpressionNode} from "../node/expression/binary/in";
import {IfTokenParser} from "../token-parser/if";
import {SetTokenParser} from "../token-parser/set";
import {BlockTokenParser} from "../token-parser/block";
import {GreaterBinaryExpressionNode} from "../node/expression/binary/greater";
import {LessBinaryExpressionNode} from "../node/expression/binary/less";
import {IncludeTokenParser} from "../token-parser/include";
import {WithTokenParser} from "../token-parser/with";
import {NotUnaryExpressionNode} from "../node/expression/unary/not";
import {NegativeUnaryExpressionNode} from "../node/expression/unary/neg";
import {PositiveUnaryExpressionNode} from "../node/expression/unary/pos";
import {Function} from "../function";
import {SpacelessTokenParser} from "../token-parser/spaceless";
import {ConcatBinaryExpressionNode} from "../node/expression/binary/concat";
import {MultiplyBinaryExpressionNode} from "../node/expression/binary/mul";
import {DivBinaryExpressionNode} from "../node/expression/binary/div";
import {FloorDivBinaryExpressionNode} from "../node/expression/binary/floor-div";
import {ModuloBinaryExpressionNode} from "../node/expression/binary/mod";
import {SubtractBinaryExpressionNode} from "../node/expression/binary/sub";
import {AddBinaryExpressionNode} from "../node/expression/binary/add";
import {UseTokenParser} from "../token-parser/use";
import {EmbedTokenParser} from "../token-parser/embed";
import {FilterTokenParser} from "../token-parser/filter";
import {RangeBinaryExpressionNode} from "../node/expression/binary/range";
import {ImportTokenParser} from "../token-parser/import";
import {DoTokenParser} from "../token-parser/do";
import {FlushTokenParser} from "../token-parser/flush";
import {EqualBinaryExpressionNode} from "../node/expression/binary/equal";
import {NotEqualBinaryExpressionNode} from "../node/expression/binary/not-equal";
import {OrBinaryExpressionNode} from "../node/expression/binary/or";
import {BitwiseOrBinaryExpressionNode} from "../node/expression/binary/bitwise-or";
import {BitwiseXorBinaryExpressionNode} from "../node/expression/binary/bitwise-xor";
import {BitwiseAndBinaryExpressionNode} from "../node/expression/binary/bitwise-and";
import {GreaterOrEqualBinaryExpressionNode} from "../node/expression/binary/greater-equal";
import {LessOrEqualBinaryExpressionNode} from "../node/expression/binary/less-equal";
import {NotInBinaryExpressionNode} from "../node/expression/binary/not-in";
import {NullCoalesceExpressionNode} from "../node/expression/null-coalesce";
import {ExpressionNode} from "../node/expression";
import {PowerBinaryExpressionNode} from "../node/expression/binary/power";
import {DefinedTestExpressionNode} from "../node/expression/test/defined";
import {Test} from "../test";
import {MatchesBinaryExpressionNode} from "../node/expression/binary/matches";
import {StartsWithBinaryExpressionNode} from "../node/expression/binary/starts-with";
import {EndsWithBinaryExpressionNode} from "../node/expression/binary/ends-with";
import {Filter} from "../filter";
import {Settings as DateTimeSettings} from 'luxon';
import {ConstantExpressionNode} from "../node/expression/constant";
import {DefaultFilterExpressionNode} from "../node/expression/filter/default";
import {merge} from "../helpers/merge";
import {slice} from "../helpers/slice";
import {reverse} from "../helpers/reverse";
import {first} from "../helpers/first";
import {DeprecatedTokenParser} from "../token-parser/deprecated";
import {ApplyTokenParser} from "../token-parser/apply";
import {Operator, OperatorAssociativity} from "../operator";
import {even} from "./core/tests/even";
import {odd} from "./core/tests/odd";
import {sameAs} from "./core/tests/same-as";
import {nullTest} from "./core/tests/null";
import {divisibleBy} from "./core/tests/divisible-by";
import {min} from "./core/functions/min";
import {max} from "./core/functions/max";
import {VerbatimTokenParser} from "../token-parser/verbatim";
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
import {AutoEscapeTokenParser} from "../token-parser/auto-escape";
import {SandboxTokenParser} from "../token-parser/sandbox";
import {TwingBaseNodeVisitor} from "../base-node-visitor";
// import {TwingNodeVisitorEscaper} from "../node-visitor/escaper";
// import {TwingNodeVisitorSandbox} from "../node-visitor/sandbox";
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
import {TwingSourceMapNodeFactorySpaceless} from "../source-map/node-factory/spaceless";
import {TwingSourceMapNodeFactory} from "../source-map/node-factory";
import {ConstantTestExpressionNode} from "../node/expression/test/constant";
import {LineTokenParser} from "../token-parser/line";
import {extname, basename} from "path";
import {TwingEscapingStrategyResolver} from "../environment";
import {TokenParserInterface} from "../token-parser-interface";

export class TwingExtensionCore extends TwingExtension {
    private dateFormats: Array<string> = ['F j, Y H:i', '%d days'];
    private numberFormat: Array<number | string> = [0, '.', ','];
    private timezone: string = null;
    private escapers: Map<string, Function> = new Map();
    private defaultStrategy: string | false | TwingEscapingStrategyResolver;

    /**
     * @param {string | false | TwingEscapingStrategyResolver} defaultStrategy An escaping strategy
     */
    constructor(defaultStrategy: string | false | TwingEscapingStrategyResolver = 'html') {
        super();

        this.setDefaultStrategy(defaultStrategy);
    }

    /**
     * Sets the default strategy to use when not defined by the user.
     *
     * @param {string | false | TwingEscapingStrategyResolver} defaultStrategy An escaping strategy
     */
    setDefaultStrategy(defaultStrategy: string | false | TwingEscapingStrategyResolver) {
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
     *
     * @param {string} strategy     The strategy name that should be used as a strategy in the escape call
     * @param {Function} callable   A valid PHP callable
     */
    setEscaper(strategy: string, callable: Function) {
        this.escapers.set(strategy, callable);
    }

    /**
     * Gets all defined escapers.
     *
     * @returns {Map<string, Function>}
     */
    getEscapers() {
        return this.escapers;
    }

    /**
     * Sets the default format to be used by the date filter.
     *
     * @param {string} format The default date format string
     * @param {string} dateIntervalFormat The default date interval format string
     */
    setDateFormat(format: string = null, dateIntervalFormat: string = null) {
        if (format !== null) {
            this.dateFormats[0] = format;
        }

        if (dateIntervalFormat !== null) {
            this.dateFormats[1] = dateIntervalFormat;
        }
    }

    /**
     * Gets the default format to be used by the date filter.
     *
     * @return array The default date format string and the default date interval format string
     */
    getDateFormat() {
        return this.dateFormats;
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
        return [];
    }

    getSourceMapNodeFactories(): Map<string, TwingSourceMapNodeFactory> {
        return new Map([
            ['spaceless', new TwingSourceMapNodeFactorySpaceless()]
        ]);
    }

    getNodeVisitors(): TwingBaseNodeVisitor[] {
        return [
            //new TwingNodeVisitorEscaper(),
            //new TwingNodeVisitorMacroAutoImport(),
            //new TwingNodeVisitorSandbox()
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
        return [];
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
