import { world, Dimension, Entity, Location } from "mojang-minecraft";

const TAG_NAME = "lapis256_floating_text:data";

function getDataTag(entity: Entity): string | undefined {
    return entity.getTags().find((t) => t.startsWith(TAG_NAME));
}

export function hasOldData(entity: Entity) {
    return Boolean(getDataTag(entity));
}

interface EntityData {
    dimension: Dimension;
    name: string;
    location: Location;
}

function encodeData(data: EntityData) {
    const {
        name,
        location: { x, y, z },
        dimension: { id },
    } = data;
    return JSON.stringify({ name, dimension: id, location: { x, y, z } });
}

function decodeData(json: string): EntityData {
    const {
        dimension,
        name,
        location: { x, y, z },
    } = JSON.parse(json);
    return {
        dimension: world.getDimension(dimension),
        location: new Location(x, y, z),
        name,
    };
}

export function saveData(entity: Entity, data: EntityData) {
    const tag = getDataTag(entity);
    if (tag) {
        entity.removeTag(tag);
    }
    entity.addTag(TAG_NAME + encodeData(data));
}

export function readData(entity: Entity): EntityData {
    const tag = getDataTag(entity)!;
    const json = tag.replace(TAG_NAME, "");
    return decodeData(json);
}

export function removeData(entity: Entity) {
    const tag = getDataTag(entity)!;
    entity.removeTag(tag);
}
