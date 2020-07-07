/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {CLIError, Command, flags} from '@microsoft/bf-cli-command'
import fetch from 'node-fetch'

const utils = require('../../../utils/index')

export default class LuisVersionExport extends Command {
  static description = 'Exports a LUIS application to JSON format'

  static examples = [`
    $ bf luis:version:export --appId {APP_ID} --versionId {VERSION_ID} --out {FILENAME.json or PATH/FILENAME.json} --endpoint {ENDPOINT} --subscriptionKey {SUBSCRIPTION_KEY}
  `]

  static flags: flags.Input<any> = {
    help: flags.help({char: 'h'}),
    appId: flags.string({description: '(required) LUIS application Id (defaults to config:LUIS:appId)'}),
    versionId: flags.string({description: '(required) Version to export (defaults to config:LUIS:versionId)'}),
    out: flags.string({char: 'o', description: 'Save exported application to specified file, uses STDOUT if not specified (optional)'}),
    force: flags.boolean({char: 'f', description: 'Overwrites output file if exists, otherwise creates a parallel numbered file (optional)', default: false}),
    endpoint: flags.string({description: 'LUIS endpoint hostname'}),
    subscriptionKey: flags.string({description: '(required) LUIS cognitive services subscription key (default: config:LUIS:subscriptionKey)'}),
  }

  async run() {
    const {flags} = this.parse(LuisVersionExport)
    const flagLabels = Object.keys(LuisVersionExport.flags)
    const configDir = this.config.configDir

    let {
      appId,
      versionId,
      endpoint,
      force,
      out,
      subscriptionKey,
    } = await utils.processInputs(flags, flagLabels, configDir)

    const requiredProps = {appId, versionId, endpoint, subscriptionKey}
    utils.validateRequiredProps(requiredProps)

    try {
      let url = endpoint + '/luis/authoring/v3.0-preview/apps/' + appId + '/versions/' + versionId + '/export?format=json'
      const headers = {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': subscriptionKey
      }

      const response = await fetch(url, {method: 'GET', headers})
      const messageData = await response.json()

      if (messageData.error) {
        throw new CLIError(messageData.error.message)
      }

      if (out) {
        const writtenFilePath: string = await utils.writeToFile(out, messageData, force)
        this.log(`File successfully written: ${writtenFilePath}`)
      } else {
        await utils.writeToConsole(messageData)
      }
    } catch (error) {
      throw new CLIError(error)
    }
  }
}
