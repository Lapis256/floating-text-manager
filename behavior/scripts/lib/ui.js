/*! ui.js v1.0 | MIT license | https://github.com/Lapis256/ui.js/blob/main/LICENSE */

//@ts-check
import { Player } from "mojang-minecraft";
import {
    ActionFormData,
    ModalFormData,
    MessageFormData,
} from "mojang-minecraft-ui";

/**
 * @callback FormButtonCallback
 * @param    {Player=} player
 * @return   {Promise<void> | void}
 */

export class ActionForm {
    #formData = new ActionFormData();

    /** @type {FormButtonCallback[]} */
    #buttons = [];

    /**
     * @param  {string} bodyText
     * @return {ActionForm}
     */
    body(bodyText) {
        this.#formData.body(bodyText);
        return this;
    }

    /**
     * @param {string} text
     * @param {FormButtonCallback} callback
     * @param {string=} iconPath
     * @return {ActionForm}
     */
    button(text, callback, iconPath) {
        this.#buttons.push(callback);
        this.#formData.button(text, iconPath);
        return this;
    }

    /**
     * @param  {Player} player
     */
    async show(player) {
        const { isCanceled, selection } = await this.#formData.show(player);
        if (isCanceled) {
            return;
        }
        await this.#buttons[selection](player);
    }

    /**
     * @param  {string} titleText
     * @return {ActionForm}
     */
    title(titleText) {
        this.#formData.title(titleText);
        return this;
    }
}

export class MessageForm {
    #formData = new MessageFormData();

    /** @type {Map<number, FormButtonCallback>} */
    #buttons = new Map();

    /**
     * @param  {string} bodyText
     * @return {MessageForm}
     */
    body(bodyText) {
        this.#formData.body(bodyText);
        return this;
    }

    /**
     * @param {string} text
     * @param {FormButtonCallback} callback
     * @return {MessageForm}
     */
    button1(text, callback) {
        this.#buttons.set(1, callback);
        this.#formData.button1(text);
        return this;
    }

    /**
     * @param {string} text
     * @param {FormButtonCallback} callback
     * @return {MessageForm}
     */
    button2(text, callback) {
        this.#buttons.set(0, callback);
        this.#formData.button2(text);
        return this;
    }

    /**
     * @param  {Player} player
     */
    async show(player) {
        const { isCanceled, selection } = await this.#formData.show(player);
        if (isCanceled) {
            return;
        }
        await this.#buttons.get(selection)(player);
    }

    /**
     * @param  {string} titleText
     * @return {MessageForm}
     */
    title(titleText) {
        this.#formData.title(titleText);
        return this;
    }
}

/**
 * @callback ModalCallback
 * @param    {string | number | boolean} value
 * @param    {Player=} player
 * @return   {Promise<void> | void}
 */

/**
 * @callback ModalDropdownCallback
 * @param    {string} selected
 * @param    {Player=} player
 * @return   {Promise<void> | void}
 */

/**
 * @callback ModalSliderCallback
 * @param    {number} value
 * @param    {Player=} player
 * @return   {Promise<void> | void}
 */

/**
 * @callback ModalTextFieldCallback
 * @param    {string} text
 * @param    {Player=} player
 * @return   {Promise<void> | void}
 */

/**
 * @callback ModalToggleCallback
 * @param    {boolean} value
 * @param    {Player=} player
 * @return   {Promise<void> | void}
 */

export class ModalForm {
    #formData = new ModalFormData();

    /** @type {ModalCallback[]} */
    #elements = [];

    /**
     * @param  {string} label
     * @param  {string[]} options
     * @param  {ModalDropdownCallback} callback
     * @param  {number=} defaultValueIndex
     * @return {ModalForm}
     */
    dropdowm(label, options, callback, defaultValueIndex) {
        this.#formData.dropdown(label, options, defaultValueIndex);
        this.#elements.push(callback);
        return this;
    }

    /**
     * @param  {string} iconPath
     * @return {ModalForm}
     */
    icon(iconPath) {
        this.#formData.icon(iconPath);
        return this;
    }

    /**
     * @param  {Player} player
     */
    async show(player) {
        const { isCanceled, formValues } = await this.#formData.show(player);
        if (isCanceled) {
            return;
        }
        formValues.forEach(
            async (value, i) => await this.#elements[i](value, player)
        );
    }

    /**
     * @param  {string} label
     * @param  {number} minimumValue
     * @param  {number} maximumValue
     * @param  {number} valueStep
     * @param  {ModalSliderCallback} callback
     * @param  {number=} defaultValue
     * @return {ModalForm}
     */
    slider(
        label,
        minimumValue,
        maximumValue,
        valueStep,
        callback,
        defaultValue
    ) {
        this.#formData.slider(
            label,
            minimumValue,
            maximumValue,
            valueStep,
            defaultValue
        );
        this.#elements.push(callback);
        return this;
    }

    /**
     * @param  {string} label
     * @param  {string} placeholderText
     * @param  {ModalTextFieldCallback} callback
     * @param  {string=} defaultValue
     * @return {ModalForm}
     */
    textField(label, placeholderText, callback, defaultValue) {
        this.#formData.textField(label, placeholderText, defaultValue);
        this.#elements.push(callback);
        return this;
    }

    /**
     * @param  {string} titleText
     * @return {ModalForm}
     */
    title(titleText) {
        this.#formData.title(titleText);
        return this;
    }

    /**
     * @param  {string} label
     * @param  {ModalToggleCallback} callback
     * @param  {boolean=} defaultValue
     * @return {ModalForm}
     */
    toggle(label, callback, defaultValue) {
        this.#formData.toggle(label, defaultValue);
        this.#elements.push(callback);
        return this;
    }
}
