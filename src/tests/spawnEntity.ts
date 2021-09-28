import {
  commands,
  world,
} from '../beapi/BeAPI.js'

commands.registerCommand({
  command: "entitytest",
  description: "entitytest",
}, () => {
  const entity = world.spawnEntity("pig", {
    x: 0,
    y: 10,
    z: 0,
  }, "Frank the pig")

  entity.executeCommand('say Howdy!')
  entity.setNameTag('Test\n123')
})
