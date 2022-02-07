/* eslint-disable no-negated-condition */
/* eslint-disable indent */
import type { Client } from '../client'
import type { CommandEntry, CommandResponse, CommandOptions, ParseResult, CommandArguments } from '../types/Command'
import { genUuid } from '../utils'

export class CommandManager {
  protected readonly _client: Client
  protected readonly _commands: Map<string, CommandEntry> = new Map<string, CommandEntry>()
  public prefix = '-'

  public constructor(client: Client) {
    this._client = client
    this.default()
    this._client.on('OnChat', (data) => {
      if (!data.message.startsWith(this.prefix)) return
      data.cancel()
      const parsed = parse(this.prefix, data.message)
      const search =
        this.commandEntries().find((x) => x.options.usage === parsed.command) ??
        this.commandEntries().find((x) => x.options?.aliases?.find((x) => x === parsed.command) ?? undefined)
      if (!search) return data.sender?.sendMessage("§cThis command doesn't exists.")
      const command = this._commands.get(search.id)
      if (!command?.args || (command?.args?.length ?? 0) === 0) return command?.execute(data.sender)
      if (parsed.args?.length !== command.args.length) {
        for (let x = 0; x !== command.args.length; x++) {
          // @ts-ignore
          if (parsed?.args[x]) continue
          const arg = command.args[x]
          if (arg.required)
            return data.sender?.sendMessage(
              `§cRequirement Error: The argument \\"${command.args[x].name}\\" is a required parameter.`,
            )
        }
      }
      const args = new Map<string, any>()
      for (let x = 0; x !== command.args?.length; x++) {
        // @ts-ignore
        const arg = parsed?.args[x]
        if (!arg) continue
        if (arg.type !== command.args[x].type.name.toLowerCase()) {
          return data.sender?.sendMessage(
            `§cType Error: Expected type \\"${command.args[x].type.name.toLowerCase()}\\" for the argument \\"${
              command.args[x].name
            }\\".`,
          )
        }
        args.set(command.args[x].name, arg.value)
      }

      return command.execute(data.sender, args)
    })
  }

  public register(options: CommandOptions, callback: CommandResponse, args?: CommandArguments[]): void {
    if (this.commandEntries().find((x) => x.options.usage === options.usage))
      return console.warn(`The command with the usage "${options.usage}" is already registered.`)
    const id = genUuid()
    this._commands.set(id, {
      id: id,
      options: options,
      args: args ?? [],
      execute: callback,
    })
  }

  public getAll(): Map<string, CommandEntry> {
    return this._commands
  }

  private commandEntries(): CommandEntry[] {
    const c: CommandEntry[] = []
    for (const [, command] of this._commands) {
      c.push(command)
    }

    return c
  }

  private default(): void {
    this.register(
      {
        name: 'Help',
        usage: 'help',
        description: 'Shows a list of registered commands. Type a command after to get more info on that command.',
        aliases: ['h'],
      },
      (sender, args) => {
        const arg = args?.get('command')
        if (arg) {
          const command =
            this.commandEntries().find((x) => x.options.usage === arg) ??
            this.commandEntries().find((x) => x.options?.aliases?.find((x) => x === arg) ?? undefined)
          if (!command)
            return sender?.sendMessage(
              `§cCould not find the command \\"${arg}\\". Please use ${this.prefix}help for a list of commands.`,
            )
          const args = []
          for (const arg of command.args ?? []) {
            if (arg.required) {
              args.push(`§7<§8${arg.name}§7: §8${arg.type.name.toLowerCase()}§7>§r`)
            } else {
              args.push(`§7<§8${arg.name}§7?: §8${arg.type.name.toLowerCase()}§7>§r`)
            }
          }
          const message = []
          message.push(`§l§bShowing info for ${command.options.name}:§r`)
          message.push(`  §7Name: §8${command.options.name}§r`)
          message.push(`  §7Usage: §8${command.options.usage}§r §7${args.join(' ')}§r`)
          message.push(`  §7Description: §8${command.options.description}§r`)
          message.push(`  §7Aliases: §8${command.options.aliases?.join(', ')}§r`)
          sender?.sendMessage(message.join('\n'))
        } else {
          const message = []
          message.push('§l§bShowing all available commands:§r')
          for (const [, command] of this._commands) {
            if (command.options.hidden) continue
            message.push(`  §7${this.prefix}${command.options.usage} §8§o${command.options.description}§r`)
          }
          sender?.sendMessage(message.join('\n'))
        }
      },
      [
        {
          name: 'command',
          required: false,
          type: String,
        },
      ],
    )
    this.register(
      {
        name: 'About',
        usage: 'about',
        description: 'Sends information about the server.',
        aliases: ['ab', 'a'],
      },
      (player) => {
        player?.sendMessage(
          `§7This server is running §9BeAPI v${this._client.currentVersion}§7 for §aMinecraft: Bedrock Edition v${this._client.currentMCBE}§7.`,
        )
      },
    )
  }
}

export function parse(prefix: string, content: string): ParseResult {
  const split = content
    .replace(prefix, '')
    .split(' ')
    .filter((i) => i.length)
  const command = split.shift()
  const args: { value: any; type: 'string' | 'number' | 'boolean' }[] = []
  for (const item of split) {
    if (!Number(item)) {
      switch (item) {
        default:
          args.push({
            value: item,
            type: 'string',
          })
          break
        case 'true':
          args.push({
            value: true,
            type: 'boolean',
          })
          break
        case 'false':
          args.push({
            value: false,
            type: 'boolean',
          })
          break
      }
    } else {
      args.push({
        value: parseInt(item, 10),
        type: 'number',
      })
    }
  }
  return {
    command: command ?? '',
    args: args,
  }
}
