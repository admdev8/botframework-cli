/* eslint-disable @typescript-eslint/typedef */
/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from 'path';
import {Utility} from './utility';
import {OrchestratorHelper} from './orchestratorhelper';

const oc = require('oc_node_authoring/oc_node_authoring.node');

export class LabelResolver {
  public static Orchestrator: any;

  public static LabelResolver: any;

  public static async loadNlrAsync(nlrPath: string) {
    if (nlrPath) {
      nlrPath = path.resolve(nlrPath);
    }
    if (nlrPath.length === 0) {
      throw new Error('Please provide path to Orchestrator model');
    }
    Utility.writeToConsole('Creating Orchestrator..');
    LabelResolver.Orchestrator = new oc.Orchestrator();

    Utility.writeToConsole('Loading NLR..');
    if (await LabelResolver.Orchestrator.load(nlrPath) === false) {
      throw new Error('Loading NLR failed!');
    }
  }

  public static async createAsync(nlrPath: string, useCompactEmbeddings: boolean = true) {
    await LabelResolver.loadNlrAsync(nlrPath);
    Utility.writeToConsole('Creating labeler..');
    LabelResolver.LabelResolver = LabelResolver.Orchestrator.createLabelResolver(useCompactEmbeddings);
    return LabelResolver.LabelResolver;
  }

  public static async createWithSnapshotAsync(nlrPath: string, snapshotPath: string) {
    const encoder: TextEncoder = new TextEncoder();
    const snapshot: Uint8Array = encoder.encode(OrchestratorHelper.readFile(snapshotPath));
    await LabelResolver.loadNlrAsync(nlrPath);
    Utility.writeToConsole('Creating labeler..');
    LabelResolver.LabelResolver = LabelResolver.Orchestrator.createLabelResolver(snapshot);
    return LabelResolver.LabelResolver;
  }

  public static addExamples(utterancesLabelsMap: any) {
    // eslint-disable-next-line guard-for-in
    for (const utterance in utterancesLabelsMap) {
      const labels: any = utterancesLabelsMap[utterance];
      for (const label of labels) {
        const success = LabelResolver.LabelResolver.addExample({label: label, text: utterance});
        if (success) {
          Utility.debuggingLog(`Added { label: ${label}, text: ${utterance}}`);
        }
      }
    }
  }
}
