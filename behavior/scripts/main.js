import { world, Color, MinecraftEntityTypes } from "mojang-minecraft";

import { getConvertibleEntitiesFromPlayerViewVector } from "./src/convertibleEntity";
import { Dimensions, getPlayerSelectedItem, isCreative } from "./src/utils";
import {
    getFloatingTextEntities,
    getFloatingTextEntitiesFromPlayerViewVector,
} from "./src/floatingTextEntity";
import {
    inputNewFloatingTextName,
    showFloatingTextSetting,
    showSettings,
} from "./src/ui";

const FLOATING_TEXT_MANAGER_ID = "lapis256:floating_text_manager";

const WHITE = new Color(1, 1, 1, 1);
const BLACK = new Color(0, 0, 0, 1);
const GREEN = new Color(0, 1, 0, 1);

world.events.beforeItemUse.subscribe(({ item, source }) => {
    if (source.id !== MinecraftEntityTypes.player.id) return;
    if (!isCreative(source) || item.id !== FLOATING_TEXT_MANAGER_ID) return;

    // @ts-ignore
    for (const entity of getFloatingTextEntitiesFromPlayerViewVector(source)) {
        // @ts-ignore
        showFloatingTextSetting(source, entity).catch(console.error);
        return;
    }

    // @ts-ignore
    for (const entity of getConvertibleEntitiesFromPlayerViewVector(source)) {
        // @ts-ignore
        inputNewFloatingTextName(source).then((name) => {
            if (name) entity.convert(name);
        });
        return;
    }

    // @ts-ignore
    showSettings(source).catch(console.error);
});

world.events.tick.subscribe(({ currentTick }) => {
    for (const entity of getFloatingTextEntities(Dimensions.overworld)) {
        entity.fixLocation();
    }
    for (const player of world.getPlayers()) {
        const selectedItem = getPlayerSelectedItem(player);
        if (selectedItem?.id !== FLOATING_TEXT_MANAGER_ID) {
            continue;
        }

        for (const entity of getFloatingTextEntitiesFromPlayerViewVector(
            player
        )) {
            entity.spawnMarkerParticle(currentTick % 5 ? WHITE : BLACK);
            break;
        }
        for (const entity of getConvertibleEntitiesFromPlayerViewVector(
            player
        )) {
            entity.spawnMarkerParticle(currentTick % 5 ? GREEN : BLACK);
            break;
        }
    }
});
