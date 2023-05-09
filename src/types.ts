//
// Copyright 2021 Vulcanize, Inc.
//

export enum TaskReceiptStatus {
  awaitingExec = 'awaitingExec',
  execSuccess = 'execSuccess',
  execReverted = 'execReverted',
  canceled = 'canceled',
  expired = 'expired',
}

export enum Operation {
  Call = 'Call',
  Delegatecall = 'Delegatecall',
}

export enum DataFlow {
  None = 'None',
  In = 'In',
  Out = 'Out',
  InAndOut = 'InAndOut',
}
