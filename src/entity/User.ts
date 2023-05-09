//
// Copyright 2021 Vulcanize, Inc.
//

import { Entity, PrimaryColumn, Column, Index } from 'typeorm';
import { bigintTransformer } from '@cerc-io/util';

@Entity()
@Index(['blockNumber'])
export class User {
  @PrimaryColumn('varchar')
    id!: string;

  @PrimaryColumn('varchar', { length: 66 })
    blockHash!: string;

  @Column('integer')
    blockNumber!: number;

  @Column('varchar')
    address!: string;

  @Column('numeric', { transformer: bigintTransformer })
    signUpDate!: bigint;

  @Column('varchar', { nullable: true })
    executor!: string;

  @Column('boolean', { default: false })
    isPruned!: boolean;
}
