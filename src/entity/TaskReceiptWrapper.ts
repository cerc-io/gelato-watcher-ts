//
// Copyright 2021 Vulcanize, Inc.
//

import { Entity, PrimaryColumn, Column, Index } from 'typeorm';
import { TaskReceiptStatus } from '../types';
import { bigintTransformer } from '@cerc-io/util';

@Entity()
@Index(['blockNumber'])
export class TaskReceiptWrapper {
  @PrimaryColumn('varchar')
    id!: string;

  @PrimaryColumn('varchar', { length: 66 })
    blockHash!: string;

  @Column('integer')
    blockNumber!: number;

  @Column('varchar')
    user!: string;

  @Column('varchar')
    taskReceipt!: string;

  @Column('varchar')
    submissionHash!: string;

  @Column({ type: 'enum', enum: TaskReceiptStatus })
    status!: TaskReceiptStatus;

  @Column('numeric', { transformer: bigintTransformer })
    submissionDate!: bigint;

  @Column('varchar')
    selectedExecutor!: string;

  @Column('numeric', { nullable: true, transformer: bigintTransformer })
    executionDate!: bigint;

  @Column('varchar', { nullable: true })
    executionHash!: string;

  @Column('boolean')
    selfProvided!: boolean;

  @Column('boolean', { default: false })
    isPruned!: boolean;
}
