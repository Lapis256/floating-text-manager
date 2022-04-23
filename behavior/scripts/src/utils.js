//@ts-check
import {
    world,
    MinecraftDimensionTypes,
    Dimension,
    Color,
    MolangVariableMap,
    Location,
    Player,
    Entity,
} from "mojang-minecraft";

/**
 * @param  {Dimension} dimension
 * @param  {Location} location
 * @param  {Color} color
 */
export function showMarkerParticle(dimension, location, color) {
    const variables = new MolangVariableMap();
    variables.setColorRGB("variable.color", color);
    dimension.spawnParticle("lapis256:marker", location, variables);
}

/**
 * @param  {Dimension} dimension
 * @return {string}
 */
export function getDimensionColorCode(dimension) {
    switch (dimension.id) {
        case Dimensions.overworld.id:
            return "a";
        case Dimensions.nether.id:
            return "c";
        case Dimensions.theEnd.id:
            return "d";
        default:
            return "f";
    }
}

/**
 * @param  {string} text
 * @return {string}
 */
export function escape(text) {
    return text.replace("\n", "\\n");
}

/**
 * @param  {string} text
 * @return {string}
 */
export function unescape(text) {
    return text.replace("\\n", "\n");
}

const TAG_NAME = "lapis256_floating_text:data";

/**
 * @param  {Entity} entity
 * @return {string=}
 */
function getDataTag(entity) {
    return entity.getTags().find((t) => t.startsWith(TAG_NAME));
}

/**
 *
 * @typedef  {Object} EntityData
 * @property {Dimension} dimension
 * @property {string} name
 * @property {Location} location
 */

/**
 * @param  {Entity} entity
 * @param  {EntityData} data
 */
export function saveData(entity, data) {
    const tag = getDataTag(entity);
    if (tag) {
        entity.removeTag(tag);
    }
    const {
        name,
        location: { x, y, z },
        dimension: { id },
    } = data;
    entity.addTag(
        TAG_NAME +
            JSON.stringify({ name, dimension: id, location: { x, y, z } })
    );
}

/**
 * @param  {Entity} entity
 * @return {EntityData}
 */
export function readData(entity) {
    const tag = getDataTag(entity);
    const json = tag.replace(TAG_NAME, "");
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

/**
 * @param  {Entity} entity
 * @param  {Location} location
 * @param  {Dimension} dimension
 */
export function updateLocation(entity, location, dimension) {
    const data = readData(entity);
    data.location = location;
    data.dimension = dimension;
    saveData(entity, data);
}

/**
 * @param  {Entity} entity
 * @param  {string} name
 */
export function updateName(entity, name) {
    const data = readData(entity);
    data.name = name;
    saveData(entity, data);
}

/**
 * @param  {Player | Entity} player
 */
export function isCreative(player) {
    try {
        player.runCommand("testfor @s[m=c]");
        return true;
    } catch {
        return false;
    }
}

export class Dimensions {
    static overworld = world.getDimension(MinecraftDimensionTypes.overworld);
    static nether = world.getDimension(MinecraftDimensionTypes.nether);
    static theEnd = world.getDimension(MinecraftDimensionTypes.theEnd);

    static [Symbol.iterator] = function* () {
        yield* [Dimensions.overworld, Dimensions.nether, Dimensions.theEnd];
    };
}
