//
// Copyright 2021 Vulcanize, Inc.
//

import assert from 'assert';
import BigInt from 'apollo-type-bigint';
import debug from 'debug';
import Decimal from 'decimal.js';
import {
  GraphQLScalarType,
  GraphQLResolveInfo
} from 'graphql';

import {
  gqlTotalQueryCount,
  gqlQueryCount,
  getResultState,
  IndexerInterface,
  BlockHeight,
  OrderDirection,
  jsonBigIntStringReplacer,
  EventWatcher,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGQLCacheHints
} from '@cerc-io/util';

import { Indexer } from './indexer';

import { User } from './entity/User';
import { TaskReceiptWrapper } from './entity/TaskReceiptWrapper';
import { TaskReceipt } from './entity/TaskReceipt';
import { TaskCycle } from './entity/TaskCycle';
import { Task } from './entity/Task';
import { Provider } from './entity/Provider';
import { Condition } from './entity/Condition';
import { Action } from './entity/Action';
import { Executor } from './entity/Executor';

const log = debug('vulcanize:resolver');

export const createResolvers = async (indexerArg: IndexerInterface, eventWatcher: EventWatcher): Promise<any> => {
  const indexer = indexerArg as Indexer;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const gqlCacheConfig = indexer.serverConfig.gqlCache;

  return {
    BigInt: new BigInt('bigInt'),

    BigDecimal: new GraphQLScalarType({
      name: 'BigDecimal',
      description: 'BigDecimal custom scalar type',
      parseValue (value) {
        // value from the client
        return new Decimal(value);
      },
      serialize (value: Decimal) {
        // value sent to the client
        return value.toFixed();
      }
    }),

    Event: {
      __resolveType: (obj: any) => {
        assert(obj.__typename);

        return obj.__typename;
      }
    },

    Subscription: {
      onEvent: {
        subscribe: () => eventWatcher.getEventIterator()
      }
    },

    Mutation: {
      watchContract: async (_: any, { address, kind, checkpoint, startingBlock = 1 }: { address: string, kind: string, checkpoint: boolean, startingBlock: number }): Promise<boolean> => {
        log('watchContract', address, kind, checkpoint, startingBlock);
        await indexer.watchContract(address, kind, checkpoint, startingBlock);

        return true;
      }
    },

    Query: {
      user: async (
        _: any,
        { id, block = {} }: { id: string, block: BlockHeight },
        __: any,
        info: GraphQLResolveInfo
      ) => {
        log('user', id, JSON.stringify(block, jsonBigIntStringReplacer));
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('user').inc(1);
        assert(info.fieldNodes[0].selectionSet);

        // Set cache-control hints
        // setGQLCacheHints(info, block, gqlCacheConfig);

        return indexer.getSubgraphEntity(User, id, block, info.fieldNodes[0].selectionSet.selections);
      },

      users: async (
        _: any,
        { block = {}, first, skip }: { block: BlockHeight, first: number, skip: number },
        __: any,
        info: GraphQLResolveInfo
      ) => {
        log('users', JSON.stringify(block, jsonBigIntStringReplacer), first, skip);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('users').inc(1);
        assert(info.fieldNodes[0].selectionSet);

        // Set cache-control hints
        // setGQLCacheHints(info, block, gqlCacheConfig);

        return indexer.getSubgraphEntities(
          User,
          block,
          {},
          { limit: first, skip },
          info.fieldNodes[0].selectionSet.selections
        );
      },

      taskReceiptWrapper: async (
        _: any,
        { id, block = {} }: { id: string, block: BlockHeight },
        __: any,
        info: GraphQLResolveInfo
      ) => {
        log('taskReceiptWrapper', id, JSON.stringify(block, jsonBigIntStringReplacer));
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('taskReceiptWrapper').inc(1);
        assert(info.fieldNodes[0].selectionSet);

        // Set cache-control hints
        // setGQLCacheHints(info, block, gqlCacheConfig);

        return indexer.getSubgraphEntity(TaskReceiptWrapper, id, block, info.fieldNodes[0].selectionSet.selections);
      },

      taskReceiptWrappers: async (
        _: any,
        { block = {}, where, first, skip, orderBy, orderDirection }: { block: BlockHeight, where: { [key: string]: any }, first: number, skip: number, orderBy: string, orderDirection: OrderDirection },
        __: any,
        info: GraphQLResolveInfo
      ) => {
        log('taskReceiptWrappers', JSON.stringify(block, jsonBigIntStringReplacer), JSON.stringify(where, jsonBigIntStringReplacer), first, skip, orderBy, orderDirection);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('taskReceiptWrappers').inc(1);
        assert(info.fieldNodes[0].selectionSet);

        // Set cache-control hints
        // setGQLCacheHints(info, block, gqlCacheConfig);

        return indexer.getSubgraphEntities(
          TaskReceiptWrapper,
          block,
          where,
          { limit: first, skip, orderBy, orderDirection },
          info.fieldNodes[0].selectionSet.selections
        );
      },

      taskReceipt: async (
        _: any,
        { id, block = {} }: { id: string, block: BlockHeight },
        __: any,
        info: GraphQLResolveInfo
      ) => {
        log('taskReceipt', id, JSON.stringify(block, jsonBigIntStringReplacer));
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('taskReceipt').inc(1);
        assert(info.fieldNodes[0].selectionSet);

        // Set cache-control hints
        // setGQLCacheHints(info, block, gqlCacheConfig);

        return indexer.getSubgraphEntity(TaskReceipt, id, block, info.fieldNodes[0].selectionSet.selections);
      },

      taskReceipts: async (
        _: any,
        { block = {}, first, skip }: { block: BlockHeight, first: number, skip: number },
        __: any,
        info: GraphQLResolveInfo
      ) => {
        log('taskReceipts', JSON.stringify(block, jsonBigIntStringReplacer), first, skip);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('taskReceipts').inc(1);
        assert(info.fieldNodes[0].selectionSet);

        // Set cache-control hints
        // setGQLCacheHints(info, block, gqlCacheConfig);

        return indexer.getSubgraphEntities(
          TaskReceipt,
          block,
          {},
          { limit: first, skip },
          info.fieldNodes[0].selectionSet.selections
        );
      },

      taskCycle: async (
        _: any,
        { id, block = {} }: { id: string, block: BlockHeight },
        __: any,
        info: GraphQLResolveInfo
      ) => {
        log('taskCycle', id, JSON.stringify(block, jsonBigIntStringReplacer));
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('taskCycle').inc(1);
        assert(info.fieldNodes[0].selectionSet);

        // Set cache-control hints
        // setGQLCacheHints(info, block, gqlCacheConfig);

        return indexer.getSubgraphEntity(TaskCycle, id, block, info.fieldNodes[0].selectionSet.selections);
      },

      taskCycles: async (
        _: any,
        { block = {}, first, skip }: { block: BlockHeight, first: number, skip: number },
        __: any,
        info: GraphQLResolveInfo
      ) => {
        log('taskCycles', JSON.stringify(block, jsonBigIntStringReplacer), first, skip);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('taskCycles').inc(1);
        assert(info.fieldNodes[0].selectionSet);

        // Set cache-control hints
        // setGQLCacheHints(info, block, gqlCacheConfig);

        return indexer.getSubgraphEntities(
          TaskCycle,
          block,
          {},
          { limit: first, skip },
          info.fieldNodes[0].selectionSet.selections
        );
      },

      task: async (
        _: any,
        { id, block = {} }: { id: string, block: BlockHeight },
        __: any,
        info: GraphQLResolveInfo
      ) => {
        log('task', id, JSON.stringify(block, jsonBigIntStringReplacer));
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('task').inc(1);
        assert(info.fieldNodes[0].selectionSet);

        // Set cache-control hints
        // setGQLCacheHints(info, block, gqlCacheConfig);

        return indexer.getSubgraphEntity(Task, id, block, info.fieldNodes[0].selectionSet.selections);
      },

      tasks: async (
        _: any,
        { block = {}, first, skip }: { block: BlockHeight, first: number, skip: number },
        __: any,
        info: GraphQLResolveInfo
      ) => {
        log('tasks', JSON.stringify(block, jsonBigIntStringReplacer), first, skip);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('tasks').inc(1);
        assert(info.fieldNodes[0].selectionSet);

        // Set cache-control hints
        // setGQLCacheHints(info, block, gqlCacheConfig);

        return indexer.getSubgraphEntities(
          Task,
          block,
          {},
          { limit: first, skip },
          info.fieldNodes[0].selectionSet.selections
        );
      },

      provider: async (
        _: any,
        { id, block = {} }: { id: string, block: BlockHeight },
        __: any,
        info: GraphQLResolveInfo
      ) => {
        log('provider', id, JSON.stringify(block, jsonBigIntStringReplacer));
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('provider').inc(1);
        assert(info.fieldNodes[0].selectionSet);

        // Set cache-control hints
        // setGQLCacheHints(info, block, gqlCacheConfig);

        return indexer.getSubgraphEntity(Provider, id, block, info.fieldNodes[0].selectionSet.selections);
      },

      providers: async (
        _: any,
        { block = {}, first, skip }: { block: BlockHeight, first: number, skip: number },
        __: any,
        info: GraphQLResolveInfo
      ) => {
        log('providers', JSON.stringify(block, jsonBigIntStringReplacer), first, skip);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('providers').inc(1);
        assert(info.fieldNodes[0].selectionSet);

        // Set cache-control hints
        // setGQLCacheHints(info, block, gqlCacheConfig);

        return indexer.getSubgraphEntities(
          Provider,
          block,
          {},
          { limit: first, skip },
          info.fieldNodes[0].selectionSet.selections
        );
      },

      condition: async (
        _: any,
        { id, block = {} }: { id: string, block: BlockHeight },
        __: any,
        info: GraphQLResolveInfo
      ) => {
        log('condition', id, JSON.stringify(block, jsonBigIntStringReplacer));
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('condition').inc(1);
        assert(info.fieldNodes[0].selectionSet);

        // Set cache-control hints
        // setGQLCacheHints(info, block, gqlCacheConfig);

        return indexer.getSubgraphEntity(Condition, id, block, info.fieldNodes[0].selectionSet.selections);
      },

      conditions: async (
        _: any,
        { block = {}, first, skip }: { block: BlockHeight, first: number, skip: number },
        __: any,
        info: GraphQLResolveInfo
      ) => {
        log('conditions', JSON.stringify(block, jsonBigIntStringReplacer), first, skip);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('conditions').inc(1);
        assert(info.fieldNodes[0].selectionSet);

        // Set cache-control hints
        // setGQLCacheHints(info, block, gqlCacheConfig);

        return indexer.getSubgraphEntities(
          Condition,
          block,
          {},
          { limit: first, skip },
          info.fieldNodes[0].selectionSet.selections
        );
      },

      action: async (
        _: any,
        { id, block = {} }: { id: string, block: BlockHeight },
        __: any,
        info: GraphQLResolveInfo
      ) => {
        log('action', id, JSON.stringify(block, jsonBigIntStringReplacer));
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('action').inc(1);
        assert(info.fieldNodes[0].selectionSet);

        // Set cache-control hints
        // setGQLCacheHints(info, block, gqlCacheConfig);

        return indexer.getSubgraphEntity(Action, id, block, info.fieldNodes[0].selectionSet.selections);
      },

      actions: async (
        _: any,
        { block = {}, first, skip }: { block: BlockHeight, first: number, skip: number },
        __: any,
        info: GraphQLResolveInfo
      ) => {
        log('actions', JSON.stringify(block, jsonBigIntStringReplacer), first, skip);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('actions').inc(1);
        assert(info.fieldNodes[0].selectionSet);

        // Set cache-control hints
        // setGQLCacheHints(info, block, gqlCacheConfig);

        return indexer.getSubgraphEntities(
          Action,
          block,
          {},
          { limit: first, skip },
          info.fieldNodes[0].selectionSet.selections
        );
      },

      executor: async (
        _: any,
        { id, block = {} }: { id: string, block: BlockHeight },
        __: any,
        info: GraphQLResolveInfo
      ) => {
        log('executor', id, JSON.stringify(block, jsonBigIntStringReplacer));
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('executor').inc(1);
        assert(info.fieldNodes[0].selectionSet);

        // Set cache-control hints
        // setGQLCacheHints(info, block, gqlCacheConfig);

        return indexer.getSubgraphEntity(Executor, id, block, info.fieldNodes[0].selectionSet.selections);
      },

      executors: async (
        _: any,
        { block = {}, first, skip }: { block: BlockHeight, first: number, skip: number },
        __: any,
        info: GraphQLResolveInfo
      ) => {
        log('executors', JSON.stringify(block, jsonBigIntStringReplacer), first, skip);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('executors').inc(1);
        assert(info.fieldNodes[0].selectionSet);

        // Set cache-control hints
        // setGQLCacheHints(info, block, gqlCacheConfig);

        return indexer.getSubgraphEntities(
          Executor,
          block,
          {},
          { limit: first, skip },
          info.fieldNodes[0].selectionSet.selections
        );
      },

      events: async (_: any, { blockHash, contractAddress, name }: { blockHash: string, contractAddress: string, name?: string }) => {
        log('events', blockHash, contractAddress, name);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('events').inc(1);

        const block = await indexer.getBlockProgress(blockHash);
        if (!block || !block.isComplete) {
          throw new Error(`Block hash ${blockHash} number ${block?.blockNumber} not processed yet`);
        }

        const events = await indexer.getEventsByFilter(blockHash, contractAddress, name);
        return events.map(event => indexer.getResultEvent(event));
      },

      eventsInRange: async (_: any, { fromBlockNumber, toBlockNumber }: { fromBlockNumber: number, toBlockNumber: number }) => {
        log('eventsInRange', fromBlockNumber, toBlockNumber);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('eventsInRange').inc(1);

        const { expected, actual } = await indexer.getProcessedBlockCountForRange(fromBlockNumber, toBlockNumber);
        if (expected !== actual) {
          throw new Error(`Range not available, expected ${expected}, got ${actual} blocks in range`);
        }

        const events = await indexer.getEventsInRange(fromBlockNumber, toBlockNumber);
        return events.map(event => indexer.getResultEvent(event));
      },

      getStateByCID: async (_: any, { cid }: { cid: string }) => {
        log('getStateByCID', cid);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getStateByCID').inc(1);

        const state = await indexer.getStateByCID(cid);

        return state && state.block.isComplete ? getResultState(state) : undefined;
      },

      getState: async (_: any, { blockHash, contractAddress, kind }: { blockHash: string, contractAddress: string, kind: string }) => {
        log('getState', blockHash, contractAddress, kind);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getState').inc(1);

        const state = await indexer.getPrevState(blockHash, contractAddress, kind);

        return state && state.block.isComplete ? getResultState(state) : undefined;
      },

      getSyncStatus: async () => {
        log('getSyncStatus');
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getSyncStatus').inc(1);

        return indexer.getSyncStatus();
      }
    }
  };
};
