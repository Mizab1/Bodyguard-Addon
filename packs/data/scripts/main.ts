import { Entity, EntityTameableComponent, MolangVariableMap, Player, world } from "@minecraft/server";
import { randomFloat } from "./utils/functions";

const CONSTANTS = {
  COIN_ITEM: "bdguard:coin",
  TARGET_MOB: "minecraft:iron_golem",
  RESULT_MOB: "bdguard:bodyguard",
  COINS_REQUIRED: 5,
  PROPERTY_COIN_COUNT: "coinsGiven",
};

// Run when the player interacts with the iron golem
world.afterEvents.playerInteractWithEntity.subscribe((event) => {
  const { player, target, beforeItemStack } = event;

  if (target.typeId !== CONSTANTS.TARGET_MOB) return;
  if (beforeItemStack?.typeId !== CONSTANTS.COIN_ITEM) return;

  // Count the coins given
  const currentCoins = ((target.getDynamicProperty(CONSTANTS.PROPERTY_COIN_COUNT) as number) ?? 0) + 1;
  target.setDynamicProperty(CONSTANTS.PROPERTY_COIN_COUNT, currentCoins);

  // Display the particle and play sounds
  playInteractionEffects(target);

  if (currentCoins >= CONSTANTS.COINS_REQUIRED) {
    transformToBodyguard(target, player);
  }
});

// Run when the bodyguard is spawned with commands
world.afterEvents.entitySpawn.subscribe(({ entity }) => {
  if (entity.typeId !== CONSTANTS.RESULT_MOB) return;

  const tameable = entity.getComponent(EntityTameableComponent.componentId);
  if (!tameable || tameable.isTamed) return;

  // Get the closest player
  const closestPlayer = entity.dimension.getPlayers({
    location: entity.location,
    maxDistance: 5,
    closest: 1,
  })[0];

  if (closestPlayer) {
    tameable.tame(closestPlayer);
  }
});

// Run when the bodyguard is clicked
world.afterEvents.playerInteractWithEntity.subscribe((event) => {
  const { player, target, itemStack } = event;

  // Check if the entity is bodyguard and is tamed
  if (!(target?.typeId === "bdguard:bodyguard") || itemStack?.typeId === "minecraft:iron_ingot") return;

  let isStandby = target.getDynamicProperty("isStandby") ?? false;

  if (isStandby) {
    target.triggerEvent("bdguard:set_following");
    player.onScreenDisplay.setActionBar("§aFollowing");
  } else {
    target.triggerEvent("bdguard:set_standby");
    player.onScreenDisplay.setActionBar("§6Standby Mode");
  }

  target.setDynamicProperty("isStandby", !isStandby);
  player.dimension.playSound("random.click", target.location);
});

// Helper Functions
function playInteractionEffects(entity: Entity) {
  const headLoc = entity.getHeadLocation();
  const { dimension } = entity;

  // Play Sound
  dimension.playSound("random.orb", headLoc, { pitch: 0.5, volume: 1.0 });

  // Spawn Particles
  for (let i = 0; i < 10; i++) {
    const offset = {
      x: headLoc.x + randomFloat(-1, 1),
      y: headLoc.y + randomFloat(-1, 1),
      z: headLoc.z + randomFloat(-1, 1),
    };

    dimension.spawnParticle("minecraft:villager_happy", offset);
  }
}

function transformToBodyguard(originalMob: Entity, owner: Player) {
  const { dimension, location } = originalMob;
  const headLoc = originalMob.getHeadLocation();

  // Play Sound
  dimension.playSound("random.level_up", location, { pitch: 1.0, volume: 1.0 });

  // Display particles
  for (let i = 0; i < 10; i++) {
    const offset = {
      x: headLoc.x + randomFloat(-1, 1),
      y: headLoc.y + randomFloat(-1, 1),
      z: headLoc.z + randomFloat(-1, 1),
    };

    dimension.spawnParticle("minecraft:heart_particle", offset);
  }

  // Replace the mob
  const bodyguard = dimension.spawnEntity(CONSTANTS.RESULT_MOB, location);

  const tameable = bodyguard.getComponent(EntityTameableComponent.componentId);
  if (tameable) {
    tameable.tame(owner);
  }

  // Remove the old mob
  originalMob.remove();
}
