import {Error} from "../error";

import type {Location} from "../node";
import type {Source} from "../source";

const Levenshtein = require('levenshtein');

// todo: rename that type, this is not a suggestion but some candidates for an eroneous word
export type SyntaxErrorSuggestion = {
    value: string,
    candidates: string[]
};

export class SyntaxError extends Error {
    // todo: rename that property, this is not a suggestion but some candidates for an eroneous word
    private readonly _suggestion: SyntaxErrorSuggestion;

    constructor(message: string, suggestion: SyntaxErrorSuggestion, location: Location, source?: Source, previous?: Error) {
        super(message, location, source, previous);

        this._suggestion = suggestion;
    }

    get message(): string {
        let message = super.message;

        let suggestions: string[] = [];
        let levenshtein = new Levenshtein();

        if (this.suggestion) {
            const {value, candidates} = this.suggestion;

            for (let candidate of candidates) {
                levenshtein = new Levenshtein(value, candidate);

                if (levenshtein.distance <= (value.length / 3) || candidate.indexOf(value) > -1) {
                    suggestions.push(candidate);
                }
            }

            if (suggestions.length > 0) {
                suggestions.sort();

                message = `${message} Did you mean "${suggestions.join(', ')}"?`;
            }
        }

        return message;
    }

    get name(): string {
        return 'TwingErrorSyntax';
    }

    get suggestion(): SyntaxErrorSuggestion {
        return this._suggestion;
    }
}
