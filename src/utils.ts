import {
    MinecraftDimensionTypes,
    Dimension,
    Color,
    MolangVariableMap,
    Location,
    Player,
    EntityInventoryComponent,
    world,
} from "mojang-minecraft";

export const overworld = world.getDimension(MinecraftDimensionTypes.overworld);

export function showMarkerParticle(
    dimension: Dimension,
    location: Location,
    color: Color
) {
    const variables = new MolangVariableMap();
    variables.setColorRGB("variable.color", color);
    dimension.spawnParticle("lapis256:marker", location, variables);
}

export function getDimensionColorCode(dimension: Dimension) {
    switch (dimension.id) {
        case MinecraftDimensionTypes.overworld:
            return "a";
        case MinecraftDimensionTypes.nether:
            return "c";
        case MinecraftDimensionTypes.theEnd:
            return "d";
        default:
            return "f";
    }
}

export function escape(text: string) {
    return text.replaceAll("\n", "\\n");
}

export function unescape(text: string) {
    return text.replaceAll("\\n", "\n");
}

export function getPlayerSelectedItem(player: Player) {
    const { container } = player.getComponent(
        "minecraft:inventory"
    ) as EntityInventoryComponent;

    return container.getItem(player.selectedSlot);
}

export function isCreative(player: Player) {
    try {
        player.runCommand("testfor @s[m=c]");
        return true;
    } catch {
        return false;
    }
}

export function errorHandler(error: Error) {
    console.error(error.message, error.stack);
}
