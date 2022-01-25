import {
  BlockLocation,
  Container,
  Dimension,
  Entity as MCEntity,
  ItemStack,
} from "mojang-minecraft"
import { Player } from "../beapi/player/Player"
import { Entity } from "../beapi/entity/Entity"

export interface Location {
  x: number
  y: number
  z: number
}

export interface EventValues {
  tick: [number]
  PlayerJoin: [Player]
  PlayerLeft: [Player]
  PlayerMessage: [PlayerMessage]
  ChatCommand: [ChatCommand]
  RawSocketMessage: [RawSocketMessage]
  NameTagChanged: [NameTagChanged]
  EntityCreate: [Entity]
  EntityDestroyed: [Entity]
  Explosion: [Explosion]
  OldEvent: [any]
  BlockDestructionStarted: [BlockDestructionStarted]
  BlockDestructionStopped: [BlockDestructionStopped]
  BlockDestroyed: [BlockDestroyed]
  BlockPlaced: [BlockPlaced]
  EntityAttacked: [EntityAttacked]
}

interface EntityAttacked {
  player: Player
  entity: {
    id: string
    type: string
    pos: {
      x: number
      y: number
      z: number
    }
  }
}

interface BlockPlaced {
  player: Player
  block: {
    id: string
    pos: {
      x: number
      y: number
      z: number
    }
  }
}

interface BlockDestroyed {
  player: Player
  block: {
    id: string
    pos: {
      x: number
      y: number
      z: number
    }
  }
}

interface BlockDestructionStopped {
  player: Player
  block: {
    id: string
    pos: {
      x: number
      y: number
      z: number
    }
    progress: number
  }
}

interface BlockDestructionStarted {
  player: Player
  block: {
    id: string
    pos: {
      x: number
      y: number
      z: number
    }
  }
}

interface Explosion {
  dimension: Dimension
  source: MCEntity
  impactedBlocks: BlockLocation[]
}

export interface NameTagChanged {
  player: Player
  old: string
  new: string
}

interface PlayerMessage {
  sender: Player
  message: string
  cancelEvent(cancel: boolean): void
}

interface RawSocketMessage {
  sender: Player
  message: string
}

export interface Interval {
  callback: CallableFunction
  tick: number
}

export interface JsonRequest {
  berp: JsonData
}

interface JsonData {
  event?: string
  sender?: any
  player?: any
  entity?: any
  command?: string
  entityId?: string
  entities?: any
  message?: string
  data?: any
  requestId: string
}

export interface CommandOptions {
  command: string
  aliases?: string[]
  description: string
  permissionTags?: string[]
}

export interface CommandMapOptions {
  options: CommandOptions
  showInList: boolean
  execute(data: CommandResponse): void
}

export interface CommandResponse {
  sender: Player
  args: string[]
}

export interface ChatCommand {
  sender: Player
  command: string
}

export type Dimensions = (
  "overworld" |
  "nether" |
  "the end"
)

export type Inventory = {
  readonly emptySlotsCount: number
  readonly size: number
  addItem(itemStack: ItemStack): void
  getItem(slot: number): ItemStack
  setItem(slot: number, itemStack: ItemStack): void
  swapItems(slot: number, otherSlot: number, otherContainer: Container): boolean
  transferItem(fromSlot: number, toSlot: number, toContainer: Container): boolean
}

export interface ExecuteCommandResponse {
  statusMessage?: any
  data?: any
  err?: any
}

export interface Health {
  current: number
  max: number
}
