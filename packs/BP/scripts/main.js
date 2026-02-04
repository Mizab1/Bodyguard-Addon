import { world, EntityTameableComponent } from "@minecraft/server";

const COINS_TO_BE_GIVEN = 5;

world.afterEvents.playerInteractWithEntity.subscribe((event) => {
  // Variables
  const { player, target, itemStack } = event;
  const headLocation = target.getHeadLocation();
  const randomPos = {
    x: headLocation.x + (Math.random() - 0.5) * 1.2,
    y: headLocation.y + Math.random() * 0.5 + 0.2,
    z: headLocation.z + (Math.random() - 0.5) * 1.2,
  };

  // Check if the target is an iron golem
  if (target.typeId === "minecraft:iron_golem" && itemStack?.typeId === "bdguard:coin") {
    // Count the coins
    const prevCoin = target.getDynamicProperty("coinsGiven") || 0;
    target.setDynamicProperty("coinsGiven", prevCoin + 1);

    // Display particles and play sound
    particlesAndSounds(target, randomPos, headLocation);

    // Once 5 coins are reached
    if (prevCoin + 1 >= COINS_TO_BE_GIVEN) {
      transformMob(target, player, randomPos);
    }
  }
});

function particlesAndSounds(target, randomPos, headLocation) {
  for (let i = 0; i < 8; i++) {
    target.dimension.spawnParticle("minecraft:villager_happy", randomPos);
  }
  target.dimension.playSound("random.orb", headLocation, {
    pitch: 0.5,
    volume: 1.0,
  });
}

function transformMob(target, player, randomPos) {
  // transformMob(target, owner, randomPos);
  const bodyguard = target.dimension.spawnEntity("bdguard:bodyguard", target.location);
  bodyguard.getComponent(EntityTameableComponent.componentId)?.tame(player);

  // Play sounds and particles
  target.dimension.playSound("random.level_up", target.location, {
    pitch: 1.0,
    volume: 1.0,
  });
  for (let i = 0; i < 8; i++) {
    target.dimension.spawnParticle("minecraft:heart", randomPos);
  }

  // Remove the entity
  target.remove();
}
