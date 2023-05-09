//
// Copyright 2021 Vulcanize, Inc.
//

import { Entity, PrimaryColumn, Column, Index } from 'typeorm';
import { bigintTransformer } from '@cerc-io/util';

@Entity()
@Index(['blockNumber'])
export class TaskReceipt {
  @PrimaryColumn('varchar')
    id!: string;

  @PrimaryColumn('varchar', { length: 66 })
    blockHash!: string;

  @Column('integer')
    blockNumber!: number;

  @Column('varchar')
    userProxy!: string;

  @Column('varchar')
    provider!: string;

  @Column('numeric', { transformer: bigintTransformer })
    index!: bigint;

  @Column('varchar', { array: true, nullable: true })
    tasks!: string[];

  @Column('numeric', { transformer: bigintTransformer })
    expiryDate!: bigint;

  @Column('numeric', { transformer: bigintTransformer })
    cycleId!: bigint;

  @Column('numeric', { transformer: bigintTransformer })
    submissionsLeft!: bigint;

  @Column('boolean', { default: false })
    isPruned!: boolean;
}
