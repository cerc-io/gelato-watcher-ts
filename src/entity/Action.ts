//
// Copyright 2021 Vulcanize, Inc.
//

import { Entity, PrimaryColumn, Column, Index } from 'typeorm';
import { bigintTransformer } from '@cerc-io/util';

@Entity()
@Index(['blockNumber'])
export class Action {
  @PrimaryColumn('varchar')
    id!: string;

  @PrimaryColumn('varchar', { length: 66 })
    blockHash!: string;

  @Column('integer')
    blockNumber!: number;

  @Column('varchar')
    addr!: string;

  @Column('varchar')
    data!: string;

  @Column('numeric', { transformer: bigintTransformer })
    operation!: bigint;

  @Column('numeric', { transformer: bigintTransformer })
    dataFlow!: bigint;

  @Column('numeric', { transformer: bigintTransformer })
    value!: bigint;

  @Column('boolean')
    termsOkCheck!: boolean;

  @Column('boolean', { default: false })
    isPruned!: boolean;
}
