import { Entity, Player, Color, EntityHealthComponent } from "mojang-minecraft";

import { FloatingTextEntity } from "./floatingTextEntity";
import { showMarkerParticle } from "../utils";
import { floatingTextId } from "./type";

export class ConvertibleEntity {
    #entity: Entity;

    constructor(entity: Entity) {
        this.#entity = entity;
    }

    convert(name: string) {
        const { nameTag, dimension, location } = this.#entity;
        const newFloatingText = FloatingTextEntity.createNew(
            name,
            nameTag,
            dimension,
            location
        );

        this.kill();

        return newFloatingText;
    }

    showMarker(color: Color) {
        const { dimension, location } = this.#entity;
        showMarkerParticle(dimension, location, color);
    }

    kill() {
        const health = this.#entity.getComponent(
            "minecraft:health"
        ) as EntityHealthComponent;
        health.setCurrent(0);
    }
}

export function getConvertibleEntity(player: Player): ConvertibleEntity | void {
    const entities = player.getEntitiesFromViewVector({ maxDistance: 6 });
    for (const entity of entities) {
        if (entity.nameTag === "" || entity.id === floatingTextId) {
            continue;
        }
        return new ConvertibleEntity(entity);
    }
}
