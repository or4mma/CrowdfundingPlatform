// tests/reward-distributor_test.ts

import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Ensure that rewards can be added, assigned, and claimed",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    // Add a reward (this should be called by the campaign-manager contract in practice)
    let block = chain.mineBlock([
      Tx.contractCall('reward-distributor', 'add-reward', [
        types.uint(1), // campaign-id
        types.ascii("Test Reward"),
        types.utf8("A test reward description"),
        types.uint(500000), // 0.5 STX
        types.uint(10) // 10 available
      ], deployer.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u1)');
    
    // Assign reward to a backer
    block = chain.mineBlock([
      Tx.contractCall('reward-distributor', 'assign-reward', [
        types.uint(1), // campaign-id
        types.principal(wallet1.address),
        types.uint(1) // reward-id
      ], deployer.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
    
    // Check backer rewards
    let result = chain.callReadOnlyFn('reward-distributor', 'get-backer-rewards', [types.uint(1), types.principal(wallet1.address)], deployer.address);
    let backerRewards = result.result.expectSome().expectList();
    assertEquals(backerRewards[0], types.uint(1));
    
    // Claim reward
    block = chain.mineBlock([
      Tx.contractCall('reward-distributor', 'claim-reward', [types.uint(1)], wallet1.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
    
    // Verify reward is claimed
    result = chain.callReadOnlyFn('reward-distributor', 'is-reward-claimed', [types.uint(1), types.principal(wallet1.address)], deployer.address);
    assertEquals(result.result, types.bool(true));
    
    // Try to claim again (should fail)
    block = chain.mineBlock([
      Tx.contractCall('reward-distributor', 'claim-reward', [types.uint(1)], wallet1.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u103)');
  },
});
