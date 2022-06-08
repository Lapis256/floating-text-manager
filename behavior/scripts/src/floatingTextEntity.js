//@ts-check
import {
    Dimension,
    Entity,
    EntityQueryOptions,
    EntityRaycastOptions,
    Player,
    Location,
    Color,
} from "mojang-minecraft";

import { readData, saveData, spawnMarkerParticle, killEntity } from "./utils";

const FLOATING_TEXT_DELETE_EVENT = "lapis256:floating_text_delete";

export class FloatingTextEntity {
    static id = "lapis256:floating_text";

    #entity;

    /** @type {String} */
    #name;
    /** @type {Location} */
    #location;
    /** @type {Dimension} */
    #dimension;

    /**
     * @param  {Entity} entity
     */
    constructor(entity) {
        this.#entity = entity;
    }

    #readData() {
        return readData(this.#entity);
    }

    /**
     * @param  {import("./utils").EntityData} data
     */
    #saveData(data) {
        saveData(this.#entity, data);
    }

    /**
     * @typedef  {Object} EntityNewData
     * @property {Dimension=} dimension
     * @property {string=} name
     * @property {Location=} location
     */
    /**
     * @param  {EntityNewData} newData
     */
    #updateData(newData) {
        const data = this.#readData();
        this.#saveData({ ...data, ...newData });
    }

    get name() {
        if (this.#name !== undefined) {
            return this.#name;
        }

        const { name } = this.#readData();
        this.#name = name;
        return name;
    }

    set name(name) {
        this.#updateData({ name });
        this.#name = name;
    }

    get location() {
        if (this.#location !== undefined) {
            return this.#location;
        }

        const { location } = this.#readData();
        this.#location = location;
        return location;
    }

    set location(location) {
        this.#updateData({ location });
        this.#location = location;
    }

    get dimension() {
        if (this.#dimension !== undefined) {
            return this.#dimension;
        }

        const { dimension } = this.#readData();
        this.#dimension = dimension;
        return dimension;
    }

    set dimension(dimension) {
        this.#updateData({ dimension });
        this.#dimension = dimension;
    }

    get text() {
        return this.#entity.nameTag;
    }

    set text(text) {
        this.#entity.nameTag = text;
    }

    delete() {
        this.#entity.triggerEvent(FLOATING_TEXT_DELETE_EVENT);
    }

    fixLocation() {
        const { dimension, location } = this.#readData();
        this.#entity.teleport(location, dimension, 0, 0);
    }

    /**
     * @param  {Color} color
     */
    spawnMarkerParticle(color) {
        const { dimension, location } = this.#entity;
        spawnMarkerParticle(dimension, location, color);
    }

    /**
     * @param  {string} name
     * @param  {string} text
     * @param  {Dimension} dimension
     * @param  {Location} location
     */
    static createNew(name, text, dimension, location) {
        const entity = dimension.spawnEntity(this.id, location);
        const self = new this(entity);

        self.text = text;
        self.#saveData({
            location,
            dimension,
            name,
        });

        return self;
    }

    /**
     * @param  {string} name
     * @param  {Entity} entity
     */
    static convertFromOtherEntity(name, entity) {
        const { nameTag, dimension, location } = entity;
        const self = this.createNew(name, nameTag, dimension, location);

        killEntity(entity);

        return self;
    }
}

/**
 * @param  {Dimension} dimension
 * @yields {FloatingTextEntity}
 */
export function* getFloatingTextEntities(dimension) {
    const options = new EntityQueryOptions();
    options.type = FloatingTextEntity.id;

    const entities = dimension.getEntities(options);
    for (const entity of entities) {
        yield new FloatingTextEntity(entity);
    }
}

/**
 * @param  {Player} player
 * @returns {FloatingTextEntity[]}
 */
export function getFloatingTextEntitiesFromPlayerViewVector(player) {
    const options = new EntityRaycastOptions();
    options.maxDistance = 6;

    const entities = player.getEntitiesFromViewVector(options);
    return entities.flatMap((e) =>
        e.id === FloatingTextEntity.id ? [new FloatingTextEntity(e)] : []
    );
}
