import { describe, expect, it } from 'vitest';
import { maxUint256 } from 'viem';
import { buildErc20Approval, buildErc20Revoke, buildErc20Transfer, describeAllowance, erc20CallData } from '../lib/wallet/erc20-ops';

const token = '0x0000000000000000000000000000000000000010' as `0x${string}`;
const recipient = '0x0000000000000000000000000000000000000020' as `0x${string}`;
const spender = '0x0000000000000000000000000000000000000030' as `0x${string}`;

describe('ERC-20 transaction safety', () => {
  it('builds a token transfer with a non-negative amount', () => {
    const call = buildErc20Transfer(token, recipient, 25n);
    expect(call.functionName).toBe('transfer');
    expect(call.args).toEqual([recipient, 25n]);
    expect(erc20CallData(call).value).toBe(0n);
  });

  it('rejects negative token amounts', () => {
    expect(() => buildErc20Transfer(token, recipient, -1n)).toThrow();
  });

  it('requires explicit confirmation for unlimited approval', () => {
    expect(() => buildErc20Approval(token, spender, maxUint256)).toThrow(/Unlimited/i);
    expect(buildErc20Approval(token, spender, maxUint256, true).args).toEqual([spender, maxUint256]);
  });

  it('supports limited approvals and revocation', () => {
    expect(buildErc20Approval(token, spender, 100n).args).toEqual([spender, 100n]);
    expect(buildErc20Revoke(token, spender).args).toEqual([spender, 0n]);
  });

  it('classifies allowance risk', () => {
    expect(describeAllowance(0n).state).toBe('none');
    expect(describeAllowance(100n).state).toBe('limited');
    expect(describeAllowance(maxUint256).state).toBe('unlimited');
    expect(describeAllowance(maxUint256).warning).toMatch(/Unlimited/);
  });
});
