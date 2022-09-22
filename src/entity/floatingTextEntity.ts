import {
    Dimension,
    Entity,
    Player,
    Location,
    Color,
    EntityQueryOptions,
    EntityRaycastOptions,
    PropertyRegistry,
    DynamicPropertiesDefinition,
} from "mojang-minecraft";

import {
    readDimension,
    readLocation,
    readName,
    saveDimension,
    saveLocation,
    saveName,
} from "../dataSaver";
import { showMarkerParticle } from "../utils";
import { floatingTextId, floatingTextType } from "./type";

const FLOATING_TEXT_DELETE_EVENT = "lapis256:floating_text_delete";

export class FloatingTextEntity {
    #entity: Entity;

    #name?: string;
    #location?: Location;
    #dimension?: Dimension;

    constructor(entity: Entity) {
        this.#entity = entity;
    }

    get name() {
        if (this.#name !== undefined) {
            return this.#name;
        }

        this.#name = readName(this.#entity);
        return this.#name;
    }

    set name(name) {
        saveName(this.#entity, name);
        this.#name = name;
    }

    get location() {
        if (this.#location !== undefined) {
            return this.#location;
        }

        this.#location = readLocation(this.#entity);
        return this.#location;
    }

    set location(location) {
        saveLocation(this.#entity, location);
        this.#location = location;
    }

    get dimension() {
        if (this.#dimension !== undefined) {
            return this.#dimension;
        }

        this.#dimension = readDimension(this.#entity);
        return this.#dimension;
    }

    set dimension(dimension) {
        saveDimension(this.#entity, dimension);
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
        if (
            this.location.equals(this.#entity.location) &&
            this.dimension === this.#entity.dimension
        ) {
            return;
        }

        this.#entity.teleport(this.location, this.dimension, 0, 0);
    }

    showMarker(color: Color) {
        const { dimension, location } = this.#entity;
        showMarkerParticle(dimension, location, color);
    }

    static createNew(
        name: string,
        text: string,
        dimension: Dimension,
        location: Location
    ) {
        const entity = dimension.spawnEntity(floatingTextId, location);
        const self = new this(entity);

        self.text = text;
        saveLocation(entity, location);
        saveDimension(entity, dimension);
        saveName(entity, name);

        return self;
    }
}

export function* getFloatingTextEntities(dimension: Dimension) {
    const option = new EntityQueryOptions();
    option.type = floatingTextId;
    const entities = dimension.getEntities(option);

    for (const entity of entities) {
        yield new FloatingTextEntity(entity);
    }
}

export function getFloatingTextEntity(player: Player): FloatingTextEntity | void {
    const entities = player.getEntitiesFromViewVector();
    for (const entity of entities) {
        if (entity.id !== floatingTextId) {
            continue;
        }
        return new FloatingTextEntity(entity);
    }
}

export const PropertyKeys = {
    locationX: "location_x",
    locationY: "location_y",
    locationZ: "location_z",
    dimension: "dimension",
    name: "name",
} as const;

export function registerDynamicProperties(registry: PropertyRegistry) {
    let def = new DynamicPropertiesDefinition();
    def.defineNumber(PropertyKeys.locationX);
    def.defineNumber(PropertyKeys.locationY);
    def.defineNumber(PropertyKeys.locationZ);
    def.defineString(PropertyKeys.dimension, 128);
    def.defineString(PropertyKeys.name, 128);

    registry.registerEntityTypeDynamicProperties(def, floatingTextType);
}
