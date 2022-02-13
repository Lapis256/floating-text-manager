import { world, Location } from "mojang-minecraft";
import { ActionFormData, ModalFormData } from "mojang-minecraft-ui";

import {
    Gamemode,
    EntityQueryOptions,
    EntityDataDrivenTriggerEventOptions, pprint
} from "../lib/gametest-utility-lib.js";


const NAMESPACE = "lapis256_floating_text:";
const TAG_NAME = NAMESPACE + "location";
const EVENT_NAME = NAMESPACE + "fix_location";

function escape(text) {
    return text.replace("\n", "\\n");
}

function unescape(text) {
    return text.replace("\\n", "\n");
}

export default class FloatingTextManager {
    #itemID;
    #entityType;

    constructor(itemID, entityType) {
        this.#itemID = itemID;
        this.#entityType = entityType;

        this.#subscribeEvents();
    }

    async #openSettings(player) {
        const form = new ActionFormData()
            .title("Texts")
            .button("§bCreate new floating text");

        const option = new EntityQueryOptions({ type: this.#entityType });
        const entities = Array.from(player.dimension.getEntities(option));
        entities.forEach(e => form.button(escape(e.nameTag)));
        const { isCanceled, selection } = await form.show(player);
        if(isCanceled) return;

        if(selection === 0) {
            await this.#createFloatingText(player);
            return;
        }
        await this.#manageFloatingText(player, entities[selection - 1]);
    }

    async #createFloatingText(player) {
        const { isCanceled, formValues } = await (new ModalFormData()
            .title("§bCreate new floating text")
            .textField("Text", "Text")
            .show(player));
        if(isCanceled) return;

        const { dimension, location } = player;
        const entity = dimension.spawnEntity(this.#entityType, location);
        this.#setLocationTag(entity, location);
        entity.nameTag = unescape(formValues[0]);
    }

    async #manageFloatingText(player, entity) {
        const { nameTag, location, dimension } = entity;
        const { isCanceled, selection } = await (new ActionFormData()
            .title("Manage floating text")
            .body("text: " + nameTag + "\n\n")
            .button("Edit text")
            .button("Teleport to text")
            .button("Teleport here")
            .button("delete text")
            .show(player));
        if(isCanceled) return;

        switch(selection) {
            case 0:
                await this.#editName(player, entity);
                break;
            case 1:
                player.teleport(location, dimension, 0, 0);
                break;
            case 2:
                entity.teleport(player.location, player.dimension, 0, 0);
                this.#setLocationTag(entity, player.location);
                break;
            case 3:
                const health = entity.getComponent("health");
                health.setCurrent(0);
                break;
        }
    }

    async #editName(player, entity) {
        const { isCanceled, formValues } = await (new ModalFormData()
            .title("§Edit text")
            .textField("Text", "Text", escape(entity.nameTag))
            .show(player));
        if(isCanceled) return;

        entity.nameTag = unescape(formValues[0]);
    }

    #getLocation(entity) {
        const tag = this.#getLocationTag(entity);
        const locationJson = tag.replace(TAG_NAME, "");
        const { x, y, z } = JSON.parse(locationJson);
        return new Location(x, y, z);
    }

    #getLocationTag(entity) {
        const tags = entity.getTags();
        return tags.find(t => t.startsWith(TAG_NAME));
    }

    #setLocationTag(entity, { x, y, z }) {
        const tag = this.#getLocationTag(entity);
        if(tag) entity.removeTag(tag);
        entity.addTag(TAG_NAME + JSON.stringify({ x, y, z }));
    }

    #itemUseEventHandler({ item, source: player }) {
        if(!Gamemode.isCreative(player) || item.id !== this.#itemID) return;

        this.#openSettings(player).catch(console.error);
    }

    #entityEventHandler({ id, entity }) {
        if(id !== EVENT_NAME) return;

        const location = this.#getLocation(entity);
        entity.teleport(location, entity.dimension, 0, 0);
    }

    #subscribeEvents() {
        world.events.beforeItemUse.subscribe(
            this.#itemUseEventHandler.bind(this)
        );
        world.events.beforeDataDrivenEntityTriggerEvent.subscribe(
            this.#entityEventHandler.bind(this),
            new EntityDataDrivenTriggerEventOptions({
                entityTypes: [ this.#entityType ]
            })
        );
    }
}
