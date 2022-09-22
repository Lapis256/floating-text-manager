import { Player } from "mojang-minecraft";
import { ActionFormData } from "mojang-minecraft-ui";

type FormButtonCallback = (player: Player) => Promise<void>;

export class ActionForm {
    #formData = new ActionFormData();
    #buttons: FormButtonCallback[] = [];

    body(bodyText: string) {
        this.#formData.body(bodyText);
        return this;
    }

    title(titleText: string) {
        this.#formData.title(titleText);
        return this;
    }

    button(text: string, callback: FormButtonCallback, iconPath?: string) {
        this.#buttons.push(callback);
        this.#formData.button(text, iconPath);
        return this;
    }

    async show(player: Player) {
        const { isCanceled, selection } = await this.#formData.show(player);
        if (isCanceled) {
            return;
        }
        await this.#buttons[selection](player);
    }
}
