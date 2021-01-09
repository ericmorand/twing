import {TwingNodeExpression, TwingNodeExpressionAttributes} from "../expression";
import {Compiler} from "../../compiler";
import {TwingNodeExpressionList, TwingNodeExpressionListAttributes} from "./list";

export type TwingNodeExpressionArrayElement = [number, TwingNodeExpression<any>];

export class TwingNodeExpressionArray extends TwingNodeExpressionList<number> {
    // constructor(attributes: TwingNodeExpressionListAttributes<number>, nodes: null, line: number, column: number) {
    //     const listElements: Array<[number, TwingNodeExpressionArrayElement]> = [];
    //
    //     let i: number = 0;
    //
    //     for (let element of attributes.elements) {
    //         listElements.push([i, element]);
    //     }
    //
    //     super({
    //         elements: listElements
    //     }, null, line, column);
    //
    //     // todo: is the following useful?
    //     // let index: number = -1;
    //     //
    //     // for (const [key] of this.getAttribute('elements')) {
    //     //     if ((key instanceof TwingNodeExpressionConstant) && (ctypeDigit('' + key.getAttribute('value'))) && (key.getAttribute('value') > index)) {
    //     //         index = key.getAttribute('value');
    //     //     }
    //     // }
    // }

    protected compileKey(compiler: Compiler, key: number): void {
        compiler.repr(key);
    }
}
