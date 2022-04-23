import { Player } from "mojang-minecraft";

export class FormResponse {
    readonly isCanceled: boolean;
}

export class ActionFormResponse extends FormResponse {
    readonly selection: number;
}

export class MessageFormResponse extends FormResponse {
    readonly selection: number;
}

export class ModalFormResponse extends FormResponse {
    readonly formValues: any[];
}

export class ActionFormData {
    body(bodyText: string): ActionFormData;
    button(text: string, iconPath?: string): ActionFormData;
    show(player: Player): Promise<ActionFormResponse>;
    title(titleText: string): ActionFormData;
}

export class MessageFormData {
    body(bodyText: string): MessageFormData;
    button1(text: string): MessageFormData;
    button2(text: string): MessageFormData;
    show(player: Player): Promise<MessageFormResponse>;
    title(titleText: string): MessageFormData;
}

export class ModalFormData {
    dropdown(
        label: string,
        options: string[],
        defaultValueIndex?: number
    ): ModalFormData;
    icon(iconPath: string): ModalFormData;
    show(player: Player): Promise<ModalFormResponse>;
    slider(
        label: string,
        minimumValue: number,
        maximumValue: number,
        valueStep: number,
        defaultValue?: number
    ): ModalFormData;
    textField(
        label: string,
        placeholderText: string,
        defaultValue?: string
    ): ModalFormData;
    title(titleText: string): ModalFormData;
    toggle(label: string, defaultValue?: boolean): ModalFormData;
}
