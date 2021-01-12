export class Source {
    private readonly _content: string;
    private readonly _name: string;
    private readonly _resolvedName: string;

    constructor(content: string, name: string, resolvedName?: string) {
        this._content = content;
        this._name = name;
        this._resolvedName = resolvedName || name;
    }

    get content() {
        return this._content;
    }

    get name() {
        return this._name;
    }

    get resolvedName() {
        return this._resolvedName;
    }
}
