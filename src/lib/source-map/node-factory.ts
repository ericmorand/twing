/**
 * @author Eric MORAND <eric.morand@gmail.com>
 */
import {Source} from "../source";
import {SourceMapNode} from "./node";

export class SourceMapNodeFactory {
    create(line: number, column: number, source: Source, name: string): SourceMapNode {
        return new SourceMapNode(line, column, source, name);
    }
}
