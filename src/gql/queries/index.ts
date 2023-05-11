import fs from 'fs';
import path from 'path';

export const events = fs.readFileSync(path.join(__dirname, 'events.gql'), 'utf8');
export const eventsInRange = fs.readFileSync(path.join(__dirname, 'eventsInRange.gql'), 'utf8');
export const user = fs.readFileSync(path.join(__dirname, 'user.gql'), 'utf8');
export const taskReceiptWrapper = fs.readFileSync(path.join(__dirname, 'taskReceiptWrapper.gql'), 'utf8');
export const taskReceipt = fs.readFileSync(path.join(__dirname, 'taskReceipt.gql'), 'utf8');
export const taskCycle = fs.readFileSync(path.join(__dirname, 'taskCycle.gql'), 'utf8');
export const task = fs.readFileSync(path.join(__dirname, 'task.gql'), 'utf8');
export const provider = fs.readFileSync(path.join(__dirname, 'provider.gql'), 'utf8');
export const condition = fs.readFileSync(path.join(__dirname, 'condition.gql'), 'utf8');
export const action = fs.readFileSync(path.join(__dirname, 'action.gql'), 'utf8');
export const executor = fs.readFileSync(path.join(__dirname, 'executor.gql'), 'utf8');
export const getSyncStatus = fs.readFileSync(path.join(__dirname, 'getSyncStatus.gql'), 'utf8');
export const getStateByCID = fs.readFileSync(path.join(__dirname, 'getStateByCID.gql'), 'utf8');
export const getState = fs.readFileSync(path.join(__dirname, 'getState.gql'), 'utf8');

// TODO: Generate multiple entities queries in codegen
export const taskReceiptWrappers = fs.readFileSync(path.join(__dirname, 'taskReceiptWrappers.gql'), 'utf8');
