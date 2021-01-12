import {TwingSourceMapNodeFactory} from "../node-factory";
import {Source} from "../../source";
import {TwingSourceMapNodeSpaceless} from "../node/spaceless";

export class TwingSourceMapNodeFactorySpaceless extends TwingSourceMapNodeFactory {
    create(line: number, column: number, source: Source, name: string): TwingSourceMapNodeSpaceless {
        return new TwingSourceMapNodeSpaceless(line, column, source, name);
    }
}
