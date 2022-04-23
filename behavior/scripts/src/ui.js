//@ts-check
import { Player } from "mojang-minecraft";
import { ModalFormData } from "mojang-minecraft-ui";

/**
 * @param  {Player} player
 * @param  {string} title
 * @param  {string} label
 * @param  {string} placeholderText
 * @param  {string=} defaultValue
 * @return {Promise<string>}
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

// import { Player } from "mojang-minecraft";
// import { ActionFormData, ModalFormData } from "mojang-minecraft-ui";

// export class TextInputFormEntry {
//     /**
//      * @function constructor
//      * @param  {string} label
//      * @param  {string} placeholderText
//      * @param  {string=} defaultValue
//      */
//     constructor(label, placeholderText, defaultValue) {
//         this.label = label;
//         this.placeholderText = placeholderText;
//         this.defaultValue = defaultValue;
//     }
// }

// /**
//  * @param  {Player} player
//  * @param  {string} title
//  * @param  {TextInputFormEntry[]} entries
//  * @return {Promise<string[]>=}
//  */
// export async function showTextInputForm(player, title, ...entries) {
//     const formData = await new ModalFormData().title(title);
//     entries.forEach((entry) =>
//         formData.textField(
//             entry.label,
//             entry.placeholderText,
//             entry.defaultValue
//         )
//     );

//     const { isCanceled, formValues } = await formData.show(player);
//     if (isCanceled) return [];

//     if (formValues.includes("")) {
//         formValues.forEach((value, i) => {
//             if (value !== "") entries[i].defaultValue = value;
//         });
//         return await showTextInputForm(player, title, ...entries);
//     }
//     return formValues;
// }

// export class ActionListFormEntry {
//     /**
//      * @function constructor
//      * @param  {string} label
//      * @param  {CallableFunction} callback
//      */
//     constructor(label, callback) {
//         this.label = label;
//         this.callback = callback;
//     }
// }

// /**
//  * @param  {Player} player
//  * @param  {Object} fromData
//  * @param  {string} fromData.title
//  * @param  {string=} fromData.body
//  * @param  {ActionListFormEntry[]} entries
//  * @return {Promise<any?>}
//  */
// export async function showActionListForm(player, { title, body }, entries) {
//     const formData = new ActionFormData().title(title);
//     if (body) {
//         formData.body(body);
//     }
//     entries.forEach((entry) => formData.button(entry.label));

//     const { isCanceled, selection } = await formData.show(player);
//     if (isCanceled) return;
//     await entries[selection].callback(player);
// }
