import { EIP1193_ERRORS, ProviderRpcError } from './eip1193-errors';
import type { DappDecision } from './dapp-queue';
export function unwrapDappDecision(decision:DappDecision){if(!decision.approved){const e=decision.error??EIP1193_ERRORS.userRejected;throw new ProviderRpcError(e.code,e.message)}if(decision.result===undefined)throw new ProviderRpcError(-32000,'AURELIS approval completed without a signing result.');return decision.result}
