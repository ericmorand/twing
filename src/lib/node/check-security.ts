import {Node} from "../node";
import {Compiler} from "../compiler";

import type {Location} from "../node";

export type CheckSecurityNodeAttributes = {
    usedFilters: Map<string, Node | string>,
    usedTags: Map<string, Node | string>,
    usedFunctions: Map<string, Node | string>
};

export class CheckSecurityNode extends Node<CheckSecurityNodeAttributes> {
    // private usedFilters: Map<string, Node | string>;
    // private usedTags: Map<string, Node | string>;
    // private usedFunctions: Map<string, Node | string>;

    // constructor(usedFilters: Map<string, Node | string>, usedTags: Map<string, Node | string>, usedFunctions: Map<string, Node | string>) {
    //     super();
    //
    //     this.usedFilters = usedFilters;
    //     this.usedTags = usedTags;
    //     this.usedFunctions = usedFunctions;
    // }

    compile(compiler: Compiler) {
        let tags: Map<string, Location> = new Map();

        for (let [name, node] of this.attributes.usedTags) {
            if (typeof node === 'string') {
                tags.set(node, null);
            }
            else {
                tags.set(name, node.location);
            }
        }

        let filters: Map<string, Location> = new Map();

        for (let [name, node] of this.attributes.usedFilters) {
            if (typeof node === 'string') {
                filters.set(node, null);
            }
            else {
                filters.set(name, node.location);
            }
        }

        let functions: Map<string, Location> = new Map();

        for (let [name, node] of this.attributes.usedFunctions) {
            if (typeof node === 'string') {
                functions.set(node, null);
            }
            else {
                functions.set(name, node.location);
            }
        }

        compiler
            .write('let tags = ').repr(tags).raw(";\n")
            .write('let filters = ').repr(filters).raw(";\n")
            .write('let functions = ').repr(functions).raw(";\n\n")
            .write("try {\n")
            .indent()
            .write("this.environment.checkSecurity(\n")
            .indent()
            .write(!tags.size ? "[],\n" : "['" + [...tags.keys()].join('\', \'') + "'],\n")
            .write(!filters.size ? "[],\n" : "['" + [...filters.keys()].join('\', \'') + "'],\n")
            .write(!functions.size ? "[]\n" : "['" + [...functions.keys()].join('\', \'') + "']\n")
            .outdent()
            .write(");\n")
            .outdent()
            .write("}\n")
            .write("catch (e) {\n")
            .indent()
            .write("if (e instanceof this.SandboxSecurityError) {\n")
            .indent()
            .write("if (e instanceof this.NotAllowedTagSandboxSecurityError && tags.has(e.getTagName())) {\n")
            .indent()
            .write("e = new this.NotAllowedTagSandboxSecurityError(e.message, e.tagName, tags.get(e.tagName), this.source);\n")
            .outdent()
            .write("}\n")
            .write("else if (e instanceof this.NotAllowedFilterSandboxSecurityError && filters.has(e.getFilterName())) {\n")
            .indent()
            .write("e = new this.NotAllowedFilterSandboxSecurityError(e.message, e.filterName, filters.get(e.filterName), this.source);\n")
            .outdent()
            .write("}\n")
            .write("else if (e instanceof this.NotAllowedFunctionSandboxSecurityError && functions.has(e.getFunctionName())) {\n")
            .indent()
            .write("e = new this.NotAllowedFunctionSandboxSecurityError(e.message, e.functionName, functions.get(e.functionName), this.source);\n")
            .outdent()
            .write("}\n")
            .outdent()
            .write('}\n\n')
            .write("throw e;\n")
            .outdent()
            .write("}\n\n")
        ;
    }
}
