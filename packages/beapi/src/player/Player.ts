import {
  BlockLocation,
  Dimension as IDimension,
  EntityHealthComponent,
  EntityInventoryComponent,
  Player as IPlayer,
  Location as ILocation,
  Vector,
  world,
} from 'mojang-minecraft'
import type { Entity } from '..'
import type { Client } from '../client'
import type { Location, Dimension, Gamemode, ServerCommandResponse } from '../types'

export class Player {
  protected readonly _client: Client
  protected readonly _IPlayer: IPlayer
  public prevPlayerInVector: Player | undefined
  public prevEntityInVector: Entity | undefined
  public constructor(client: Client, player: IPlayer) {
    this._client = client
    this._IPlayer = player
  }

  public destroy(reason = 'Instantiated player object destroyed!'): void {
    this._client.players.remove(this)
    this._client.executeCommand(`kick "${this.getNameTag()}" ${reason}`)
  }

  public getIPlayer(): IPlayer {
    return this._IPlayer
  }

  public getName(): string {
    return this._IPlayer.name
  }

  public getNameTag(): string {
    return this._IPlayer.nameTag
  }

  public setNameTag(nametag: string): void {
    this._IPlayer.nameTag = nametag
  }

  public getTags(): string[] {
    return this._IPlayer.getTags()
  }

  public hasTag(tag: string): boolean {
    return this._IPlayer.hasTag(tag)
  }

  public addTag(tag: string): boolean {
    return this._IPlayer.addTag(tag)
  }

  public removeTag(tag: string): boolean {
    return this._IPlayer.removeTag(tag)
  }

  public sendMessage(message: string): void {
    this.executeCommand(`tellraw @s {"rawtext":[{"text":"${message}"}]}`)
  }

  public sendRawMessage(message: Array<object>): void {
    this._client.executeCommand(`tellraw @s {"rawtext":[${JSON.stringify(message)}]}`)
  }

  public executeCommand(cmd: string, debug = false): ServerCommandResponse {
    try {
      const command = this._IPlayer.runCommand(cmd)

      return {
        statusMessage: command.statusMessage,
        data: command,
        err: false,
      }
    } catch (error) {
      if (debug) console.warn(`[BeAPI] [Player#executeCommand]: ${String(error)}`)

      return {
        statusMessage: String(error),
        data: null,
        err: true,
      }
    }
  }

  public getScore(objective: string): number {
    const command = this.executeCommand(`scoreboard players test @s "${objective}" * *`)
    if (command.err) return 0

    return parseInt(String(command.statusMessage?.split(' ')[1]), 10)
  }

  public getGamemode(): Gamemode {
    const gmc = this._client.executeCommand(`testfor @a[name="${this.getNameTag()}",m=c]`, this.getDimensionName())
    const gma = this._client.executeCommand(`testfor @a[name="${this.getNameTag()}",m=a]`, this.getDimensionName())
    const gms = this._client.executeCommand(`testfor @a[name="${this.getNameTag()}",m=s]`, this.getDimensionName())
    if (!gmc.err) return 'creative'
    if (!gma.err) return 'adventure'
    if (!gms.err) return 'survival'

    return 'unknown'
  }

  public getLocation(): Location {
    const pos = this._IPlayer.location

    return {
      x: Math.floor(pos.x),
      y: Math.floor(pos.y - 1),
      z: Math.floor(pos.z),
    }
  }

  public getDimension(): IDimension {
    return this._IPlayer.dimension
  }

  public getDimensionName(): Dimension {
    const overworld = world
      .getDimension('overworld')
      .getEntitiesAtBlockLocation(
        new BlockLocation(this.getLocation().x, this.getLocation().y + 1, this.getLocation().z),
      )
      .find((x) => x === this._IPlayer)
    const nether = world
      .getDimension('nether')
      .getEntitiesAtBlockLocation(
        new BlockLocation(this.getLocation().x, this.getLocation().y + 1, this.getLocation().z),
      )
      .find((x) => x === this._IPlayer)
    const theEnd = world
      .getDimension('the end')
      .getEntitiesAtBlockLocation(
        new BlockLocation(this.getLocation().x, this.getLocation().y + 1, this.getLocation().z),
      )
      .find((x) => x === this._IPlayer)
    if (overworld) return 'overworld'
    if (nether) return 'nether'
    if (theEnd) return 'the end'

    return 'overworld'
  }

  public getInventory(): EntityInventoryComponent {
    return this._IPlayer.getComponent('minecraft:inventory') as EntityInventoryComponent
  }

  public getHealth(): EntityHealthComponent {
    return this._IPlayer.getComponent('minecraft:health') as EntityHealthComponent
  }

  public getSelectedSlot(): number {
    return this._IPlayer.selectedSlot
  }

  public kick(reason = 'You were kicked from the game!'): void {
    this.destroy(reason)
  }

  public getVelocity(): Vector {
    return this._IPlayer.velocity
  }

  public setVelocity(velocity: Vector): void {
    this._IPlayer.setVelocity(velocity)
  }

  public teleport(location: ILocation, dimension: IDimension, xrot: number, yrot: number): void {
    this._IPlayer.teleport(location, dimension, xrot, yrot)
  }

  public teleportFacing(location: ILocation, dimension: IDimension, facingLocation: ILocation): void {
    this._IPlayer.teleportFacing(location, dimension, facingLocation)
  }

  public triggerEvent(event: string): void {
    this._IPlayer.triggerEvent(event)
  }

  public getRotation(): number {
    return this._IPlayer.bodyRotation
  }

  public getHeadLocation(): ILocation {
    return this._IPlayer.headLocation
  }
}
