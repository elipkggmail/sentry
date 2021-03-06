import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { Servers } from '../../../models/server';
import logger from '../../../utils/logger';

export default class LogEditsConfigCommand extends Command {
  public constructor() {
    super('config-logedits', {
      description: {
        content: 'Enable/Disable the logging of edited messages in the server.',
        usage: 'logedits',
      },
      channel: 'guild',
      category: 'config',
      clientPermissions: [Permissions.FLAGS.MANAGE_GUILD],
      userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
    });
  }

  public async exec(msg: Message) {
    let serverRepo = this.client.db.getRepository(Servers);
    let server = await serverRepo.findOne({
      where: { server: msg.guild?.id },
    });

    let flag = server?.messageLogEditsEnabled ? false : true;

    // update the muterole
    try {
      await serverRepo.update(
        { server: msg.guild?.id },
        { messageLogEditsEnabled: flag }
      );

      logger.debug(
        `Set message edit logging in ${msg.guild?.name} (${msg.guild?.id}) to: ${flag}`
      );
    } catch (err) {
      logger.error(
        `Error toggling message edit logging in ${msg.guild?.name} (${msg.guild?.id}). Error: `,
        err
      );

      return msg.util?.send(
        'Error when toggling edit message logging. Please try again.'
      );
    }

    return msg.util?.send(
      `${flag ? 'Enabled' : 'Disabled'} logging of message edits.`
    );
  }
}
