import {SourceNode} from "source-map";
import {SourceMapNode} from "../node";

export class SpacelessSourceMapNode extends SourceMapNode {
    toSourceNode(): SourceNode {
        let flattenedChildren: SourceMapNode[] = [];

        let flattenChildren = (node: SourceMapNode) => {
            for (let child of node.children) {
                flattenedChildren.push(child);

                flattenChildren(child);
            }
        };

        flattenChildren(this);

        let tagCloseRegex = />\s*$/;
        let tagOpenRegex = /^\s*</;
        let emptyRegex = /^\s*$/;

        let leadingChildrenToTrim: SourceMapNode[] = [];
        let trailingChildrenToTrim: SourceMapNode[] = [];

        let i: number;
        let done: boolean;

        i = 0;
        done = false;

        while (!done && i < flattenedChildren.length) {
            let child = flattenedChildren[i];

            leadingChildrenToTrim.push(child);

            done = !emptyRegex.test(child.content);

            i++;
        }

        i = flattenedChildren.length - 1;
        done = false;

        while (!done && i >= 0) {
            let child = flattenedChildren[i];

            trailingChildrenToTrim.push(child);

            done = !emptyRegex.test(child.content);

            i--;
        }

        for (let child of leadingChildrenToTrim) {
            child.content = child.content.trimLeft();
        }

        for (let child of trailingChildrenToTrim) {
            child.content = child.content.trimRight();
        }

        let closeTagNode: SourceMapNode = null;
        let toEmptyNodes: SourceMapNode[] = [];

        for (let child of flattenedChildren) {
            if (!emptyRegex.test(child.content)) {
                child.content = child.content.replace(/>\s+</g, '><');

                if (closeTagNode) {
                    if (tagOpenRegex.test(child.content)) {
                        closeTagNode.content = closeTagNode.content.replace(/\s+$/, '');
                        child.content = child.content.replace(/^\s+/, '');

                        for (let node of toEmptyNodes) {
                            node.content = '';
                        }
                    }

                    closeTagNode = null;
                }

                if (tagCloseRegex.test(child.content)) {
                    closeTagNode = child;
                    toEmptyNodes.splice(0);
                }
            }
            else {
                if (closeTagNode) {
                    toEmptyNodes.push(child);
                }
            }
        }

        return super.toSourceNode();
    }
}
