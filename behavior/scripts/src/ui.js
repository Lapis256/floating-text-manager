//@ts-check
import { Player } from "mojang-minecraft";
import { ModalFormData } from "mojang-minecraft-ui";

/**
 * @param  {Player} player
 * @param  {string} title
 * @param  {string} label
 * @param  {string} placeholderText
 * @param  {string=} defaultValue
 * @return {Promise<string?>}
 */
export async function InputSingleText(
    player,
    title,
    label,
    placeholderText,
    defaultValue
) {
    const {
        isCanceled,
        formValues: [text],
    } = await new ModalFormData()
        .title(title)
        .textField(label, placeholderText, defaultValue)
        .show(player);

    if (isCanceled) return;

    if (text === "") {
        return await InputSingleText(
            player,
            title,
            label,
            placeholderText,
            defaultValue
        );
    }
    return text;
}
