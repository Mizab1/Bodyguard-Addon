import { world, system } from "@minecraft/server";

const COINS_TO_BE_GIVEN = 5;

world.afterEvents.playerInteractWithEntity.subscribe((event) => {
  const { player, target, itemStack } = event;

  if (target.typeId === "minecraft:iron_golem" && itemStack?.typeId === "bdguard:coin") {
    // Count the coins
    const prevCoin = target.getDynamicProperty("coinsGiven") || 0;
    target.setDynamicProperty("coinsGiven", prevCoin + 1);

    // Display particles and play sound
    particlesAndSounds(target);

    // Once 5 coins are reached
    if (prevCoin + 1 >= COINS_TO_BE_GIVEN) {
      console.warn("CONVERTED");
    }

    console.warn(target.getDynamicProperty("coinsGiven"));
  }
});

function particlesAndSounds(target) {
  const headLocation = target.getHeadLocation();

  for (let i = 0; i < 8; i++) {
    const randomPos = {
      x: headLocation.x + (Math.random() - 0.5) * 1.2,
      y: headLocation.y + Math.random() * 0.5 + 0.2,
      z: headLocation.z + (Math.random() - 0.5) * 1.2,
    };
    target.dimension.spawnParticle("minecraft:villager_happy", randomPos);
  }
  target.dimension.playSound("random.orb", headLocation, {
    pitch: 0.5,
    volume: 1.0,
  });
}
