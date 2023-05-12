//
// Copyright 2023 Vulcanize, Inc.
//

import debug from 'debug';
import assert from 'assert';
import pluralize from 'pluralize';
import { merge } from 'lodash';
import path from 'path';
import fs from 'fs';
import { ethers } from 'ethers';

import { gql } from '@apollo/client/core';
import { getGraphDbAndWatcher } from '@cerc-io/graph-node';
import { BlockProgressInterface, StateKind, createOrUpdateStateData, getContractEntitiesMap, prepareGQLEntityState } from '@cerc-io/util';
import { JobRunnerCmd } from '@cerc-io/cli';
import { GraphQLClient } from '@cerc-io/ipld-eth-client';

import { Database, ENTITY_QUERY_TYPE_MAP, ENTITY_TO_LATEST_ENTITY_MAP } from '../database';
import { Indexer } from '../indexer';
import { queries } from '../gql';

const log = debug('vulcanize:create-state-gql');

const ENTITIES_QUERY_LIMIT = 1000;

// TODO: Use CLI params for constants below
const SUBGRAPH_GQL_ENDPOINT = 'https://api.thegraph.com/subgraphs/name/gelatodigital/gelato-network';
const EXPORT_FILE = './gql-export';
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
  const database = jobRunnerCmd.database;

  const [block] = await indexer.getBlocks({ blockHash: SNAPSHOT_BLOCKHASH });

  if (!block) {
    log(`No blocks fetched for block hash ${SNAPSHOT_BLOCKHASH}, use an existing block`);
    return;
  }

  const blockProgress: Partial<BlockProgressInterface> = {
    ...block,
    blockNumber: Number(block.blockNumber)
  };

  // Get watched contracts using graphWatcher
  const watchedContracts = graphWatcher.dataSources.map(dataSource => {
    const { source: { address, startBlock }, name } = dataSource;

    return {
      address: ethers.utils.getAddress(address),
      kind: name,
      checkpoint: true,
      startingBlock: startBlock
    };
  });

  const exportData: any = {
    snapshotBlock: {
      blockNumber: blockProgress.blockNumber,
      blockHash: blockProgress.blockHash
    },
    contracts: watchedContracts,
    stateCheckpoints: []
  };

  // Get contractEntitiesMap
  // NOTE: Assuming each entity type is only mapped to a single contract
  // TODO: Decouple subgraph entities and contracts in watcher state
  const contractEntitiesMap = getContractEntitiesMap(graphWatcher.dataSources);

  const gqlClient = new GraphQLClient({ gqlEndpoint: SUBGRAPH_GQL_ENDPOINT });

  // Update state in a map for each contract in contractEntitiesMap
  const contractStatePromises = Array.from(contractEntitiesMap.entries())
    .map(async ([contractAddress, entities]): Promise<void> => {
      // Get all the updated entities at this block
      const updatedEntitiesListPromises = entities.map(async (entity): Promise<any[]> => {
        // Get entities for block from GQL query
        return getGQLEntitiesForBlock(gqlClient, entity, SNAPSHOT_BLOCKHASH);
      });

      const updatedEntitiesList = await Promise.all(updatedEntitiesListPromises);

      let checkpointData = { state: {} };

      // Populate state with all the updated entities of each entity type
      updatedEntitiesList.forEach((updatedEntities, index) => {
        const entityName = entities[index];

        updatedEntities.forEach((updatedEntity) => {
          assert(indexer.getRelationsMap);

          // Prepare diff data for the entity update
          const diffData = prepareGQLEntityState(updatedEntity, entityName, indexer.getRelationsMap());

          // Merge diffData for each entity
          checkpointData = merge(checkpointData, diffData);
        });
      });

      const { cid, data } = await createOrUpdateStateData(
        checkpointData,
        contractAddress,
        blockProgress,
        StateKind.Checkpoint
      );

      assert(data.meta);

      exportData.stateCheckpoints.push({
        contractAddress,
        cid: cid.toString(),
        kind: data.meta.kind,
        data
      });
    });

  await Promise.all(contractStatePromises);

  if (EXPORT_FILE) {
    const codec = await import('@ipld/dag-cbor');
    const encodedExportData = codec.encode(exportData);

    const filePath = path.resolve(EXPORT_FILE);
    const fileDir = path.dirname(filePath);

    if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir, { recursive: true });

    fs.writeFileSync(filePath, encodedExportData);
  } else {
    log(exportData);
  }

  log(`Export completed at height ${blockProgress.blockNumber}`);
  await database.close();
};

const getGQLEntitiesForBlock = async (gqlClient: GraphQLClient, entityName: string, blockHash: string) => {
  const queryName = pluralize(`${entityName.charAt(0).toLowerCase().concat(entityName.slice(1))}`);
  const importedQueries = queries as { [key: string]: string };
  const gqlQuery = importedQueries[queryName];

  const block = {
    hash: blockHash
  };

  const data = await gqlClient.query(
    gql(gqlQuery),
    {
      block,
      first: ENTITIES_QUERY_LIMIT
    }
  );

  return data[queryName];
};

main().catch(err => {
  log(err);
}).finally(() => {
  process.exit(0);
});
