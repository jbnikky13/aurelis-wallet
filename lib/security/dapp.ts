import { isAddress, type Address, type Hex } from 'viem';

export type SafeDappTransaction = {
  from: Address;
  to: Address;
  value: bigint;
  data?: Hex;
  gas?: bigint;
  gasPrice?: bigint;
  nonce?: number;
  chainId: number;
};

function quantity(value: unknown, field: string): bigint {
  if (typeof value !== 'string' || !/^0x(?:0|[1-9a-fA-F][0-9a-fA-F]*)$/.test(value)) {
    throw new Error(`Invalid ${field}.`);
  }
  return BigInt(value);
}

function optionalQuantity(value: unknown, field: string): bigint | undefined {
  return value === undefined ? undefined : quantity(value, field);
}

function chainQuantity(value: unknown): number {
  const result = quantity(value, 'chainId');
  if (result <= 0n || result > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error('Invalid chainId.');
  return Number(result);
}

export function normalizeDappTransaction(
  params: unknown[],
  expectedChainId: number,
  expectedAccount: Address,
): SafeDappTransaction {
  if (!Array.isArray(params) || params.length !== 1 || !params[0] || typeof params[0] !== 'object') {
    throw new Error('eth_sendTransaction requires exactly one transaction object.');
  }

  const tx = params[0] as Record<string, unknown>;
  const allowed = new Set(['from', 'to', 'value', 'data', 'gas', 'gasPrice', 'nonce', 'chainId']);
  for (const key of Object.keys(tx)) if (!allowed.has(key)) throw new Error(`Unsupported transaction field: ${key}`);

  const from = tx.from;
  if (typeof from !== 'string' || !isAddress(from) || from.toLowerCase() !== expectedAccount.toLowerCase()) {
    throw new Error('Transaction sender does not match the active wallet account.');
  }

  const to = tx.to;
  if (typeof to !== 'string' || !isAddress(to)) throw new Error('Invalid transaction recipient.');

  const chainId = tx.chainId === undefined ? expectedChainId : chainQuantity(tx.chainId);
  if (chainId !== expectedChainId) throw new Error(`Wrong network: expected ${expectedChainId}, received ${chainId}.`);

  const data = tx.data === undefined ? undefined : tx.data;
  if (data !== undefined && (typeof data !== 'string' || !/^0x(?:[0-9a-fA-F]{2})*$/.test(data))) {
    throw new Error('Invalid transaction data.');
  }

  const gas = optionalQuantity(tx.gas, 'gas');
  const gasPrice = optionalQuantity(tx.gasPrice, 'gasPrice');
  const value = tx.value === undefined ? 0n : quantity(tx.value, 'value');
  const nonceValue = optionalQuantity(tx.nonce, 'nonce');
  if (nonceValue !== undefined && nonceValue > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error('Invalid nonce.');

  return {
    from: from as Address,
    to: to as Address,
    value,
    data: data as Hex | undefined,
    gas,
    gasPrice,
    nonce: nonceValue === undefined ? undefined : Number(nonceValue),
    chainId,
  };
}

export function describeDappTransaction(tx: SafeDappTransaction) {
  const hasData = tx.data !== undefined && tx.data !== '0x';
  return {
    action: hasData ? 'Contract interaction' : 'Send native asset',
    recipient: tx.to,
    amountWei: tx.value.toString(),
    network: tx.chainId,
    warning: hasData ? 'Review contract calldata before signing.' : undefined,
  };
}
