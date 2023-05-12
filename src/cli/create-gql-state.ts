//
// Copyright 2023 Vulcanize, Inc.
//

import debug from 'debug';

import { getGraphDbAndWatcher } from '@cerc-io/graph-node';
import { CreateGQLStateCmd } from '@cerc-io/cli';

import { Database, ENTITY_QUERY_TYPE_MAP, ENTITY_TO_LATEST_ENTITY_MAP } from '../database';
import { Indexer } from '../indexer';
import { queries } from '../gql';

const log = debug('vulcanize:create-state-gql');

const main = async (): Promise<void> => {
  const importedQueries = queries as { [key: string]: string };

  const createGQLStateCmd = new CreateGQLStateCmd(importedQueries);
  await createGQLStateCmd.init(Database);

  const { graphWatcher } = await getGraphDbAndWatcher(
    createGQLStateCmd.config.server,
    createGQLStateCmd.clients.ethClient,
    createGQLStateCmd.ethProvider,
    createGQLStateCmd.database.baseDatabase,
    ENTITY_QUERY_TYPE_MAP,
    ENTITY_TO_LATEST_ENTITY_MAP
  );

  await createGQLStateCmd.initIndexer(Indexer, graphWatcher);

  await createGQLStateCmd.exec(graphWatcher.dataSources);
};

main().catch(err => {
  log(err);
}).finally(() => {
  process.exit(0);
});
