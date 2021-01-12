import {Source} from "./source";
import {Location} from "./node";
import {NativeError} from "./native-error";

/**
 * Twing base error.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
export class Error extends NativeError {
    private readonly _location: Location;
    private readonly _rawMessage: string;
    private readonly _source: Source;
    private readonly _previous: Error;

    constructor(message: string, location: Location, source?: Source, previous?: Error) {
        super();

        this._previous = previous;

        if (previous) {
            this.stack = previous.stack;
        }

        this._rawMessage = message;
        this._location = location;
        this._source = source;
    }

    get name(): string {
        return 'TwingError';
    }

    get message(): string {
        let message = this._rawMessage;
        let dot = false;

        if (message.substr(-1) === '.') {
            message = message.slice(0, -1);
            dot = true;
        }

        let questionMark = false;

        if (message.substr(-1) === '?') {
            message = message.slice(0, -1);
            questionMark = true;
        }

        if (this.source) {
            message = `${message} in "${this.source.name}"`;
        }

        if (this.location) {
            message = `${message} at line ${this.location.line}, column ${this.location.column}`;
        }

        if (dot) {
            message = `${message}.`;
        }

        if (questionMark) {
            message = `${message}?`;
        }

        return message;
    }

    get rawMessage() {
        return this._rawMessage;
    }

    get location(): Location {
        return this._location;
    }

    get previous(): Error {
        return this._previous;
    }

    get source() {
        return this._source;
    }
}
