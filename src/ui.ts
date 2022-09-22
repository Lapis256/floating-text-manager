import { Player } from "mojang-minecraft";
import { ModalFormData } from "mojang-minecraft-ui";

import { FloatingTextEntity, getFloatingTextEntities } from "./entity/floatingTextEntity";
import { overworld, escape, getDimensionColorCode, unescape } from "./utils";
import { ActionForm } from "./lib/simpleForm";

const NEW_FLOATING_TEXT = "New floating text";

export async function inputSingleText(
    player: Player,
    title: string,
    label: string,
    defaultValue?: string
): Promise<string | undefined> {
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

interface FloatingTextData {
    name: string;
    text: string;
}

export async function inputNewFloatingTextData(
    player: Player,
    defaultName: string = NEW_FLOATING_TEXT,
    defaultText?: string
): Promise<FloatingTextData | undefined> {
    const { isCanceled, formValues } = await new ModalFormData()
        .title("%ui.create")
        .textField("%name", "%name", defaultName)
        .textField("%text", "%text", defaultText)
        .show(player);

    if (isCanceled) {
        return;
    }

    if (formValues.includes("")) {
        return inputNewFloatingTextData(player, ...formValues);
    }

    return { name: formValues[0], text: formValues[1] };
}

export async function inputNewFloatingTextName(player: Player) {
    return await inputSingleText(player, "%ui.convert", "%name", NEW_FLOATING_TEXT);
}

export async function showSettings(player: Player) {
    const form = new ActionForm().title("%ui.list").button("%ui.create", async () => {
        const data = await inputNewFloatingTextData(player);
        if (!data) {
            return;
        }
        const { dimension, location } = player;
        FloatingTextEntity.createNew(data.name, unescape(data.text), dimension, location);
    });
    for (const entity of getFloatingTextEntities(overworld)) {
        const colorCode = getDimensionColorCode(entity.dimension);
        form.button("§" + colorCode + entity.name, async () => {
            await showFloatingTextSetting(player, entity);
        });
    }
    await form.show(player);
}

export async function showFloatingTextSetting(
    player: Player,
    entity: FloatingTextEntity
) {
    const { text, name, location, dimension } = entity;
    const [, dimensionName] = dimension.id.split(":");
    await new ActionForm()
        .title("%ui.manage")
        .body(`%name: ${name}\n%dimension: %${dimensionName}\n%text:\n${text}\n\n`)
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
        .button("%ui.manage.teleport.to", async () => {
            player.teleport(location, dimension, 0, 0);
        })
        .button("%ui.manage.teleport.here", async () => {
            entity.location = player.location;
            entity.dimension = player.dimension;
            entity.fixLocation();
        })
        .button("%ui.manage.delete", async () => {
            entity.delete();
        })
        .show(player);
}
