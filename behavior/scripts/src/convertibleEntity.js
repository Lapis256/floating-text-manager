//@ts-check
import { Entity, EntityRaycastOptions, Player, Color } from "mojang-minecraft";

import { FloatingTextEntity } from "./floatingTextEntity";
import { spawnMarkerParticle } from "./utils";

export class ConvertibleEntity {
    #entity;

    /**
     * @param  {Entity} entity
     */
    constructor(entity) {
        this.#entity = entity;
    }

    /**
     * @param  {String} name
     */
    convert(name) {
        return FloatingTextEntity.convertFromOtherEntity(name, this.#entity);
    }

    /**
     * @param  {Color} color
     */
    spawnMarkerParticle(color) {
        const { dimension, location } = this.#entity;
        spawnMarkerParticle(dimension, location, color);
    }
}

/**
 * @param  {Player} player
 */
export function getConvertibleEntitiesFromPlayerViewVector(player) {
    const options = new EntityRaycastOptions();
    options.maxDistance = 6;

    const entities = player.getEntitiesFromViewVector(options);
    return entities.flatMap((e) =>
        e.nameTag !== "" && e.id !== FloatingTextEntity.id
            ? [new ConvertibleEntity(e)]
            : []
    );
}
