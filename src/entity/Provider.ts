//
// Copyright 2021 Vulcanize, Inc.
//

import { Entity, PrimaryColumn, Column, Index } from 'typeorm';
import { bigintTransformer } from '@cerc-io/util';

@Entity()
@Index(['blockNumber'])
export class Provider {
  @PrimaryColumn('varchar')
    id!: string;

  @PrimaryColumn('varchar', { length: 66 })
    blockHash!: string;

  @Column('integer')
    blockNumber!: number;

  @Column('varchar')
    addr!: string;

  @Column('varchar')
    module!: string;

  @Column('numeric', { transformer: bigintTransformer })
    taskCount!: bigint;

  @Column('boolean', { default: false })
    isPruned!: boolean;
}
