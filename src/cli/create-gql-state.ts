//
// Copyright 2023 Vulcanize, Inc.
//

import debug from 'debug';
import assert from 'assert';
import pluralize from 'pluralize';

import { gql } from '@apollo/client/core';
import { getGraphDbAndWatcher } from '@cerc-io/graph-node';
import { getContractEntitiesMap, prepareGQLEntityState, updateSubgraphState } from '@cerc-io/util';
import { JobRunnerCmd } from '@cerc-io/cli';

import { Database, ENTITY_QUERY_TYPE_MAP, ENTITY_TO_LATEST_ENTITY_MAP } from '../database';
import { Indexer } from '../indexer';
import { queries } from '../gql';
import { GraphQLClient } from '@cerc-io/ipld-eth-client';

const log = debug('vulcanize:create-state-gql');

const ENTITIES_QUERY_LIMIT = 1000;

// TODO: Use CLI params for constants below
// Use block before latest blocks (13616470, 13616513) with LogSubmittedTask event
const SNAPSHOT_BLOCKHASH = '0x04e05ce800edf03c10e7aacb0d64276d68826cb31abaa45221a2627836ca2872';
const SUBGRAPH_GQL_ENDPOINT = 'https://api.thegraph.com/subgraphs/name/gelatodigital/gelato-network';

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

  // const exportData: any = {
  //   snapshotBlock: {},
  //   contracts: [],
  //   stateCheckpoints: []
  // };

  // TODO: Set snapshotBlock and contracts using watcher config and graphWatcher

  // Get contractEntitiesMap
  // NOTE: Assuming each entity type is only mapped to a single contract
  // TODO: Decouple subgraph entities and contracts in watcher state
  const contractEntitiesMap = getContractEntitiesMap(graphWatcher.dataSources);

  const gqlClient = new GraphQLClient({ gqlEndpoint: SUBGRAPH_GQL_ENDPOINT });
  const subgraphStateMap = new Map();

  // Update state in a map for each contract in contractEntitiesMap
  const contractStatePromises = Array.from(contractEntitiesMap.entries())
    .map(async ([contractAddress, entities]): Promise<void> => {
      // Get all the updated entities at this block
      const updatedEntitiesListPromises = entities.map(async (entity): Promise<any[]> => {
        // Get entities for block from GQL query
        return getGQLEntitiesForBlock(gqlClient, entity, SNAPSHOT_BLOCKHASH);
      });

      const updatedEntitiesList = await Promise.all(updatedEntitiesListPromises);

      // Populate state with all the updated entities of each entity type
      updatedEntitiesList.forEach((updatedEntities, index) => {
        const entityName = entities[index];

        updatedEntities.forEach((updatedEntity) => {
          assert(indexer.getRelationsMap);

          // Prepare diff data for the entity update
          const diffData = prepareGQLEntityState(updatedEntity, entityName, indexer.getRelationsMap());

          // Update the in-memory subgraph state
          updateSubgraphState(subgraphStateMap, contractAddress, diffData);
        });
      });
    });

  await Promise.all(contractStatePromises);

  console.log('subgraphStateMap', subgraphStateMap);

  // TODO: Prepare checkpoint state from subgraphStateMap
  // const state = await this.prepareStateEntry(currentBlock, contractAddress, data, StateKind.Checkpoint);

  // const data = indexer.getStateData(state);

  // exportData.stateCheckpoints.push({
  //   contractAddress: state.contractAddress,
  //   cid: state.cid,
  //   kind: state.kind,
  //   data
  // });

  // TODO: Export state
};

const getGQLEntitiesForBlock = async (gqlClient: GraphQLClient, entityName: string, blockHash: string) => {
  if (entityName !== 'TaskReceiptWrapper') {
    return [];
  }

  const queryName = pluralize(`${entityName.charAt(0).toLowerCase().concat(entityName.slice(1))}`);
  const importedQueries = queries as { [key: string]: string };
  const gqlQuery = importedQueries[queryName];

  const block = {
    hash: blockHash
  };

  const data = await gqlClient.query(
    gql(gqlQuery),
    { block, first: ENTITIES_QUERY_LIMIT }
  );

  return data[queryName];
};

main().catch(err => {
  log(err);
}).finally(() => {
  process.exit(0);
});
