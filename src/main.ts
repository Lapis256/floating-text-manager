import { world, Color, MinecraftEntityTypes, Player } from "mojang-minecraft";

import {
    getFloatingTextEntities,
    getFloatingTextEntity,
    registerDynamicProperties,
} from "./entity/floatingTextEntity";
import { getConvertibleEntity } from "./entity/convertibleEntity";
import { overworld, getPlayerSelectedItem, isCreative, errorHandler } from "./utils";
import { inputNewFloatingTextName, showFloatingTextSetting, showSettings } from "./ui";

const FLOATING_TEXT_MANAGER_ID = "lapis256:floating_text_manager";

const WHITE = new Color(1, 1, 1, 1);
const BLACK = new Color(0, 0, 0, 1);
const GREEN = new Color(0, 1, 0, 1);

world.events.beforeItemUse.subscribe(({ item, source }) => {
    if (source.id !== MinecraftEntityTypes.player.id) return;
    const player = source as Player;
    if (!isCreative(player) || item.id !== FLOATING_TEXT_MANAGER_ID) return;

    const floatingTextEntity = getFloatingTextEntity(player);
    if (floatingTextEntity) {
        showFloatingTextSetting(player, floatingTextEntity).catch(errorHandler);
        return;
    }

    const convertibleEntity = getConvertibleEntity(player);
    if (convertibleEntity) {
        inputNewFloatingTextName(player).then((name) => {
            if (name) convertibleEntity.convert(name);
        });
        return;
    }

    showSettings(player).catch(errorHandler);
});

world.events.tick.subscribe(({ currentTick }) => {
    for (const entity of getFloatingTextEntities(overworld)) {
        entity.fixLocation();
    }

    for (const player of world.getPlayers()) {
        const selectedItem = getPlayerSelectedItem(player);
        if (selectedItem?.id !== FLOATING_TEXT_MANAGER_ID) {
            continue;
        }

        const floatingTextEntity = getFloatingTextEntity(player);
        if (floatingTextEntity) {
            floatingTextEntity.showMarker(currentTick % 5 ? WHITE : BLACK);
            return;
        }

        const convertibleEntity = getConvertibleEntity(player);
        if (convertibleEntity) {
            convertibleEntity.showMarker(currentTick % 5 ? GREEN : BLACK);
            return;
        }
    }
});

world.events.worldInitialize.subscribe((ev) => {
    registerDynamicProperties(ev.propertyRegistry);
});
