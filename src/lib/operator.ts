import {Location} from "./node";
import {ExpressionNode} from "./node/expression";

export enum TwingOperatorAssociativity {
    LEFT = 'LEFT',
    RIGHT = 'RIGHT'
}

type OperatorExpressionFactory<O> = (operands: O, location: Location) => ExpressionNode<any>;

export abstract class Operator<O> {
    private readonly _name:string;
    private readonly _precedence: number;
    private readonly _expressionFactory: OperatorExpressionFactory<O>;
    private readonly _associativity: TwingOperatorAssociativity;

    /**
     * @param {string} name
     * @param {number} precedence
     * @param {OperatorExpressionFactory} expressionFactory
     * @param {TwingOperatorAssociativity} associativity
     */
    constructor(name: string, precedence: number, expressionFactory: OperatorExpressionFactory<O>, associativity?: TwingOperatorAssociativity) {
        this._name = name;
        this._precedence = precedence;
        this._expressionFactory = expressionFactory;
        // todo: replace on subclasses
        //this.associativity = type === TwingOperatorType.BINARY ? (associativity || TwingOperatorAssociativity.LEFT) : null;
    }

    get name(): string {
        return this._name;
    }

    get precedence(): number {
        return this._precedence;
    }

    get associativity(): TwingOperatorAssociativity {
        return this._associativity;
    }

    get expressionFactory(): OperatorExpressionFactory<O> {
        return this._expressionFactory;
    }
}
