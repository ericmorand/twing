import {Node} from "../node";

import type {TemplateNode} from "./template";

export type EmbeddedTemplateAttributes = {
    index: number
};

export type EmbeddedTemplateNodeEdges = {
    template: TemplateNode
};

export class EmbeddedTemplateNode extends Node<EmbeddedTemplateAttributes, EmbeddedTemplateNodeEdges> {

}
