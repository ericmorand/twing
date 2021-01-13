import {SourceMapNodeFactory} from "../node-factory";
import {Source} from "../../source";
import {SpacelessSourceMapNode} from "../node/spaceless";

export class SpacelessSourceMapNodeFactory extends SourceMapNodeFactory {
    create(line: number, column: number, source: Source, name: string): SpacelessSourceMapNode {
        return new SpacelessSourceMapNode(line, column, source, name);
    }
}
