//@ts-check
import { Player } from "mojang-minecraft";
import { ModalFormData } from "mojang-minecraft-ui";

import {
    FloatingTextEntity,
    getFloatingTextEntities,
} from "./floatingTextEntity";
import { Dimensions, escape, getDimensionColorCode, unescape } from "./utils";
import { ActionForm } from "../lib/ui";

const NEW_FLOATING_TEXT = "New floating text";

export { NEW_FLOATING_TEXT };

/**
 * @param  {Player} player
 * @param  {string} title
 * @param  {string} label
 * @param  {string=} defaultValue
 * @return {Promise<string?>}
 */
export async function inputSingleText(player, title, label, defaultValue) {
    const { isCanceled, formValues } = await new ModalFormData()
        .title(title)
        .textField(label, label, defaultValue)
        .show(player);

    if (isCanceled) return;

    if (formValues[0] === "") {
        return await inputSingleText(player, title, label, defaultValue);
    }
    return formValues[0];
}

/**
 * @param  {Player} player
 * @param  {string=} defaultName
 * @param  {string=} defaultText
 */
export async function inputNewFloatingTextData(
    player,
    defaultName = NEW_FLOATING_TEXT,
    defaultText
) {
    const { isCanceled, formValues } = await new ModalFormData()
        .title("%ui.create")
        .textField("%name", "%name", defaultName)
        .textField("%text", "%text", defaultText)
        .show(player);
    if (isCanceled) {
        return [];
    }
    if (formValues.includes("")) {
        return inputNewFloatingTextData(player, ...formValues);
    }
    return formValues;
}

/**
 * @param  {Player} player
 */
export async function inputNewFloatingTextName(player) {
    return await inputSingleText(
        player,
        "%ui.convert",
        "%name",
        NEW_FLOATING_TEXT
    );
}

/**
 * @param  {Player} player
 */
export async function showSettings(player) {
    const form = new ActionForm()
        .title("%ui.list")
        .button("%ui.create", async () => {
            const [name, text] = await inputNewFloatingTextData(player);
            if (name === undefined) {
                return;
            }
            const { dimension, location } = player;
            FloatingTextEntity.createNew(
                name,
                unescape(text),
                dimension,
                location
            );
        });
    for (const entity of getFloatingTextEntities(Dimensions.overworld)) {
        const colorCode = getDimensionColorCode(entity.dimension);
        form.button("§" + colorCode + entity.name, async () => {
            await showFloatingTextSetting(player, entity);
        });
    }
    await form.show(player);
}

/**
 * @param  {Player} player
 * @param  {FloatingTextEntity} entity
 */
export async function showFloatingTextSetting(player, entity) {
    const { text, name, location, dimension } = entity;
    const [, dimensionName] = dimension.id.split(":");
    await new ActionForm()
        .title("%ui.manage")
        .body(
            `%name: ${name}\n%dimension: %${dimensionName}\n%text:\n${text}\n\n`
        )
        .button("%ui.manage.edit.name", async () => {
            const newName = await inputSingleText(
                player,
                "%ui.manage.edit.name",
                "%name",
                name
            );
            if (newName) entity.name = newName;
        })
        .button("%ui.manage.edit.text", async () => {
            const text = await inputSingleText(
                player,
                "%ui.manage.edit.text",
                "%text",
                escape(entity.text)
            );
            if (text) entity.text = unescape(text);
        })
        .button("%ui.manage.teleport.to", () => {
            player.teleport(location, dimension, 0, 0);
        })
        .button("%ui.manage.teleport.here", () => {
            entity.location = player.location;
            entity.dimension = player.dimension;
            entity.fixLocation();
        })
        .button("%ui.manage.delete", () => {
            entity.delete();
        })
        .show(player);
}
