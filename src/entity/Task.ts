//
// Copyright 2021 Vulcanize, Inc.
//

import { Entity, PrimaryColumn, Column, Index } from 'typeorm';
import { bigintTransformer } from '@cerc-io/util';

@Entity()
@Index(['blockNumber'])
export class Task {
  @PrimaryColumn('varchar')
    id!: string;

  @PrimaryColumn('varchar', { length: 66 })
    blockHash!: string;

  @Column('integer')
    blockNumber!: number;

  @Column('varchar', { array: true, nullable: true })
    conditions!: string[];

  @Column('varchar', { array: true, nullable: true })
    actions!: string[];

  @Column('numeric', { transformer: bigintTransformer })
    selfProviderGasLimit!: bigint;

  @Column('numeric', { transformer: bigintTransformer })
    selfProviderGasPriceCeil!: bigint;

  @Column('boolean', { default: false })
    isPruned!: boolean;
}
