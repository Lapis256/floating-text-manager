import { Dimension, Entity, Location, world } from "mojang-minecraft";

import { hasOldData, removeData, readData } from "./oldDataSaver";
import { PropertyKeys } from "./entity/floatingTextEntity";

function migrateData(entity: Entity) {
    if (!hasOldData(entity)) {
        return;
    }

    const { location, dimension, name } = readData(entity);
    saveLocation(entity, location);
    saveDimension(entity, dimension);
    saveName(entity, name);

    removeData(entity);
}

export function saveLocation(entity: Entity, location: Location) {
    const { x, y, z } = location;
    entity.setDynamicProperty(PropertyKeys.locationX, x);
    entity.setDynamicProperty(PropertyKeys.locationY, y);
    entity.setDynamicProperty(PropertyKeys.locationZ, z);
}

export function readLocation(entity: Entity) {
    migrateData(entity);

    const x = entity.getDynamicProperty(PropertyKeys.locationX) as number;
    const y = entity.getDynamicProperty(PropertyKeys.locationY) as number;
    const z = entity.getDynamicProperty(PropertyKeys.locationZ) as number;
    return new Location(x, y, z);
}

export function saveDimension(entity: Entity, dimension: Dimension) {
    entity.setDynamicProperty(PropertyKeys.dimension, dimension.id);
}

export function readDimension(entity: Entity) {
    migrateData(entity);

    const id = entity.getDynamicProperty(PropertyKeys.dimension) as string;
    return world.getDimension(id);
}

export function saveName(entity: Entity, name: string) {
    entity.setDynamicProperty(PropertyKeys.name, name);
}

export function readName(entity: Entity) {
    migrateData(entity);

    return entity.getDynamicProperty(PropertyKeys.name) as string;
}
