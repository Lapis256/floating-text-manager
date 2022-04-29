//@ts-check
import {
    world,
    Location,
    Entity,
    Player,
    Dimension,
    EntityQueryOptions,
    ItemUseEvent,
    MinecraftEntityTypes,
    EntityRaycastOptions,
    Color,
    TickEvent,
    PlayerInventoryComponentContainer,
    EntityHealthComponent,
} from "mojang-minecraft";
import { ModalFormData } from "mojang-minecraft-ui";

import { ActionForm } from "../lib/ui.js";
import {
    Dimensions,
    showMarkerParticle,
    getDimensionColorCode,
    escape,
    unescape,
    saveData,
    readData,
    updateLocation,
    updateName,
    isCreative,
} from "./utils.js";
import { InputSingleText } from "./ui.js";

const EVENT_NAME = "lapis256:delete";
const NEW_FLOATING_TEXT = "New floating text";

export default class FloatingTextManager {
    #itemID;
    #entityType;

    /**
     * @param  {string} itemID
     * @param  {string} entityType
     */
    constructor(itemID, entityType) {
        this.#itemID = itemID;
        this.#entityType = entityType;

        this.#subscribeEvents();
    }

    *#getFloatingTextEntities() {
        const options = new EntityQueryOptions();
        options.type = this.#entityType;
        for (const entity of Dimensions.overworld.getEntities(options)) {
            yield entity;
        }
    }

    /**
     * @param  {Entity} player
     */
    #getFloatingTextEntitiesFromPlayerViewVector(player) {
        const options = new EntityRaycastOptions();
        options.maxDistance = 6;
        return player
            .getEntitiesFromViewVector(options)
            .filter((entity) => entity.id === this.#entityType);
    }

    /**
     * @param  {Entity} player
     */
    #getConvertibleEntitiesFromPlayerViewVector(player) {
        const options = new EntityRaycastOptions();
        options.maxDistance = 6;
        return player
            .getEntitiesFromViewVector(options)
            .filter(
                (entity) =>
                    entity.nameTag !== "" && entity.id !== this.#entityType
            );
    }

    /**
     * @param  {string} name
     * @param  {string} text
     * @param  {Dimension} dimension
     * @param  {Location} location
     */
    #createFloatingText(name, text, dimension, location) {
        const entity = dimension.spawnEntity(this.#entityType, location);
        saveData(entity, {
            location,
            dimension,
            name,
        });
        entity.nameTag = text;
    }

    /**
     * @param  {Player} player
     */
    async #showSettings(player) {
        const form = new ActionForm()
            .title("%ui.list")
            .button("%ui.create", async () => {
                const [name, text] = await this.#showInputNameAndText(player);
                if (name === undefined) {
                    return;
                }
                const { dimension, location } = player;
                this.#createFloatingText(
                    name,
                    unescape(text),
                    dimension,
                    location
                );
            });
        for (const entity of this.#getFloatingTextEntities()) {
            const colorCode = getDimensionColorCode(entity.dimension);
            const { name } = readData(entity);
            form.button("§" + colorCode + name, async () => {
                await this.#showFloatingTextSetting(player, entity);
            });
        }
        await form.show(player);
    }

    /**
     * @param  {Player} player
     * @param  {string=} defaultName
     * @param  {string=} defaultText
     */
    async #showInputNameAndText(
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
            return this.#showInputNameAndText(player, ...formValues);
        }
        return formValues;
    }

    /**
     * @param  {Player} player
     * @param  {Entity} entity
     */
    async #showFloatingTextSetting(player, entity) {
        const { nameTag } = entity;
        const { name, location, dimension } = readData(entity);
        await new ActionForm()
            .title("%ui.manage")
            .body(
                `%name: ${name}\n%dimension: %${
                    dimension.id.split(":")[1]
                }\n%text:\n${nameTag}\n\n`
            )
            .button("%ui.manage.edit.name", async () => {
                const { name } = readData(entity);
                const newName = await InputSingleText(
                    player,
                    "%ui.manage.edit.name",
                    "%name",
                    "%name",
                    name
                );
                updateName(entity, newName);
            })
            .button("%ui.manage.edit.text", async () => {
                const text = await InputSingleText(
                    player,
                    "%ui.manage.edit.text",
                    "%text",
                    "%text",
                    escape(entity.nameTag)
                );
                entity.nameTag = unescape(text);
            })
            .button("%ui.manage.teleport.to", () => {
                player.teleport(location, dimension, 0, 0);
            })
            .button("%ui.manage.teleport.here", () => {
                updateLocation(entity, player.location, player.dimension);
                entity.teleport(player.location, player.dimension, 0, 0);
            })
            .button("%ui.manage.delete", () => {
                entity.triggerEvent(EVENT_NAME);
            })
            .show(player);
    }

    /**
     * @param  {Entity} entity
     * @param  {string} name
     */
    #convertEntityToFloatingText(entity, name) {
        const { nameTag, dimension, location } = entity;
        this.#createFloatingText(name, nameTag, dimension, location);

        /** @type {EntityHealthComponent} */
        // @ts-ignore
        const health = entity.getComponent("minecraft:health");
        health.setCurrent(0);
    }

    /**
     * @param  {ItemUseEvent} ev
     */
    #itemUseEventHandler({ item, source }) {
        if (source.id !== MinecraftEntityTypes.player.id) return;
        if (!isCreative(source) || item.id !== this.#itemID) return;

        for (const entity of this.#getFloatingTextEntitiesFromPlayerViewVector(
            source
        )) {
            //@ts-ignore
            this.#showFloatingTextSetting(source, entity).catch(console.error);
            return;
        }
        for (const entity of this.#getConvertibleEntitiesFromPlayerViewVector(
            source
        )) {
            InputSingleText(
                // @ts-ignore
                source,
                "%ui.convert",
                "%name",
                "%name",
                NEW_FLOATING_TEXT
            ).then((name) => {
                this.#convertEntityToFloatingText(entity, name);
            });
            return;
        }
        //@ts-ignore
        this.#showSettings(source).catch(console.error);
    }

    /**
     * @param {TickEvent} ev
     */
    #tickEventHandler({ currentTick }) {
        for (const entity of this.#getFloatingTextEntities()) {
            const { location, dimension } = readData(entity);
            entity.teleport(location, dimension, 0, 0);
        }
        for (const player of world.getPlayers()) {
            /** @type {PlayerInventoryComponentContainer} */
            const container = player.getComponent(
                "minecraft:inventory"
                //@ts-ignore
            ).container;
            const selectedItem = container.getItem(player.selectedSlot);
            if (selectedItem?.id !== this.#itemID) {
                continue;
            }
            for (const entity of this.#getFloatingTextEntitiesFromPlayerViewVector(
                player
            )) {
                showMarkerParticle(
                    entity.dimension,
                    entity.location,
                    currentTick % 5
                        ? new Color(1, 1, 1, 1)
                        : new Color(0, 0, 0, 1)
                );
                break;
            }
            for (const entity of this.#getConvertibleEntitiesFromPlayerViewVector(
                player
            )) {
                showMarkerParticle(
                    entity.dimension,
                    entity.location,
                    currentTick % 5
                        ? new Color(0, 1, 0, 1)
                        : new Color(0, 0, 0, 1)
                );
                break;
            }
        }
    }

    #subscribeEvents() {
        world.events.beforeItemUse.subscribe(
            this.#itemUseEventHandler.bind(this)
        );
        world.events.tick.subscribe(this.#tickEventHandler.bind(this));
    }
}
