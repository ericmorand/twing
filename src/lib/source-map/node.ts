import {SourceNode} from "source-map";
import {Source} from "../source";

export class SourceMapNode {
    protected _name: string;
    protected _source: Source;
    protected _line: number;
    protected _column: number;
    protected _parent: SourceMapNode;
    protected _children: SourceMapNode[];
    protected _content: string;

    /**
     * TwingSourceMapNode constructor
     *
     * @param {number} line 0-based
     * @param {number} column 0-based
     * @param {Source} source
     * @param {string} name
     */
    constructor(line: number, column: number, source: Source, name: string) {
        this._name = name;
        this._source = source;
        this._line = line;
        this._column = column;
        this._content = null;
        this._parent = null;
        this._children = [];
    }

    get name() {
        return this._name;
    }

    get source() {
        return this._source;
    }

    get line() {
        return this._line
    }

    get column() {
        return this._column;
    }

    get content(): string {
        return this._content;
    }

    get parent() {
        return this._parent;
    }

    get children() {
        return this._children;
    }

    set content(content: string) {
        this._content = content;
    }

    addChild(child: SourceMapNode) {
        child._parent = this;

        this._children.push(child);
    }

    toSourceNode(): SourceNode {
        let chunks: string | SourceNode | (string | SourceNode)[] = null;

        if (this._children.length === 0) {
            chunks = this._content;
        }

        // source-map@6 types are faulty, we have to force-type chunks as any
        let sourceNode = new SourceNode(this._line, this._column, this._source.name, chunks as any, this._name);

        sourceNode.setSourceContent(this._source.name, this._source.content);

        for (let child of this._children) {
            sourceNode.add(child.toSourceNode() as any);
        }

        return sourceNode;
    }
}
