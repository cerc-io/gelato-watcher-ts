//
// Copyright 2023 Vulcanize, Inc.
//

import debug from 'debug';
import assert from 'assert';

import { getGraphDbAndWatcher } from '@cerc-io/graph-node';
import { getContractEntitiesMap, prepareEntityState } from '@cerc-io/util';
import { JobRunnerCmd } from '@cerc-io/cli';

import { Database, ENTITY_QUERY_TYPE_MAP, ENTITY_TO_LATEST_ENTITY_MAP } from '../database';
import { Indexer } from '../indexer';

const log = debug('vulcanize:create-state-gql');

// TODO: Use CLI params to take snapshot block hash
// Use block before latest blocks (13616470, 13616513) with LogSubmittedTask event
const SNAPSHOT_BLOCKHASH = '0x04e05ce800edf03c10e7aacb0d64276d68826cb31abaa45221a2627836ca2872';

const main = async (): Promise<void> => {
  // TODO: Replace with CreateGQLStateCmd
  const jobRunnerCmd = new JobRunnerCmd();
  await jobRunnerCmd.init(Database);

  const { graphWatcher } = await getGraphDbAndWatcher(
    jobRunnerCmd.config.server,
    jobRunnerCmd.clients.ethClient,
    jobRunnerCmd.ethProvider,
    jobRunnerCmd.database.baseDatabase,
    ENTITY_QUERY_TYPE_MAP,
    ENTITY_TO_LATEST_ENTITY_MAP
  );

  await jobRunnerCmd.initIndexer(Indexer, graphWatcher);
  const indexer = jobRunnerCmd.indexer;

  // Get contractEntitiesMap
  // NOTE: Assuming each entity type is only mapped to a single contract
  // TODO: Decouple subgraph entities and contracts in watcher state
  const contractEntitiesMap = getContractEntitiesMap(graphWatcher.dataSources);

  // Update state in a map for each contract in contractEntitiesMap
  const contractStatePromises = Array.from(contractEntitiesMap.entries())
    .map(async ([contractAddress, entities]): Promise<void> => {
      // Get all the updated entities at this block
      const updatedEntitiesListPromises = entities.map(async (entity): Promise<any[]> => {
        // TODO: Method to get entities for block from GQL query
        return indexer.getEntitiesForBlock(SNAPSHOT_BLOCKHASH, entity);
      });
      const updatedEntitiesList = await Promise.all(updatedEntitiesListPromises);

      // Populate state with all the updated entities of each entity type
      updatedEntitiesList.forEach((updatedEntities, index) => {
        const entityName = entities[index];

        updatedEntities.forEach((updatedEntity) => {
          assert(indexer.getRelationsMap);
          assert(indexer.updateSubgraphState);

          // Prepare diff data for the entity update
          const diffData = prepareEntityState(updatedEntity, entityName, indexer.getRelationsMap());

          // Update the in-memory subgraph state
          indexer.updateSubgraphState(contractAddress, diffData);
        });
      });
    });

  await Promise.all(contractStatePromises);

  // TODO: Get state created in indexer._subgraphStateMap
  // Or persist subgraph state to the DB
  // assert(indexer.dumpSubgraphState);
  // await indexer.dumpSubgraphState(blockHash, true);

  // TODO: Export state

  // TODO: Fill subgraph entity tables from state exported
};

main().catch(err => {
  log(err);
}).finally(() => {
  process.exit(0);
});
