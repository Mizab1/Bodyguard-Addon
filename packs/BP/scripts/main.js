import { world, EntityTameableComponent, MolangVariableMap } from "@minecraft/server";
// import { randomRange } from "./utils/functions.js";

const CONSTANTS = {
  COIN_ITEM: "bdguard:coin",
  TARGET_MOB: "minecraft:iron_golem",
  RESULT_MOB: "bdguard:bodyguard",
  COINS_REQUIRED: 5,
  PROPERTY_COIN_COUNT: "coinsGiven",
};

world.afterEvents.playerInteractWithEntity.subscribe((event) => {
  const { player, target, itemStack } = event;

  if (target.typeId !== CONSTANTS.TARGET_MOB) return;
  if (itemStack?.typeId !== CONSTANTS.COIN_ITEM) return;

  // Count the coins given
  const currentCoins = (target.getDynamicProperty(CONSTANTS.PROPERTY_COIN_COUNT) ?? 0) + 1;
  target.setDynamicProperty(CONSTANTS.PROPERTY_COIN_COUNT, currentCoins);

  // Display the particle and play sounds
  playInteractionEffects(target);

  if (currentCoins >= CONSTANTS.COINS_REQUIRED) {
    transformToBodyguard(target, player);
  }
});

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

// Helper Functions
function playInteractionEffects(entity) {
  const headLoc = entity.getHeadLocation();
  const { dimension } = entity;

  // Play Sound
  dimension.playSound("random.orb", headLoc, { pitch: 0.5, volume: 1.0 });

  // Spawn Particles
  for (let i = 0; i < 8; i++) {
    const offset = {
      x: headLoc.x + (Math.random() - 0.5),
      y: headLoc.y + (Math.random() - 0.5),
      z: headLoc.z + (Math.random() - 0.5),
    };
    dimension.spawnParticle("minecraft:villager_happy", offset);
  }
}

function transformToBodyguard(originalMob, owner) {
  const { dimension, location } = originalMob;

  // Play Sound
  dimension.playSound("random.level_up", location, { pitch: 1.0, volume: 1.0 });

  const molang = new MolangVariableMap();
  molang.setSpeedAndDirection("variable.heart_emitter", 0.3, { x: 0.5, y: 0.5, z: 0.5 });

  // Display particles
  for (let i = 0; i < 10; i++) {
    dimension.spawnParticle("minecraft:heart_particle", originalMob.getHeadLocation(), molang);
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
