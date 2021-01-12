/**
 * @author Eric MORAND <eric.morand@gmail.com>
 */
import {Source} from "../source";
import {TwingSourceMapNode} from "./node";

export class TwingSourceMapNodeFactory {
    create(line: number, column: number, source: Source, name: string): TwingSourceMapNode {
        return new TwingSourceMapNode(line, column, source, name);
    }
}
