// tests/campaign-manager_test.ts

import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Ensure that users can create and back campaigns",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    // Create a campaign
    let block = chain.mineBlock([
      Tx.contractCall('campaign-manager', 'create-campaign', [
        types.ascii("Test Campaign"),
        types.utf8("A test campaign description"),
        types.uint(1000000), // 1 STX = 1000000 microSTX
        types.uint(144) // ~1 day in blocks
      ], wallet1.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u1)');
    
    // Back the campaign
    block = chain.mineBlock([
      Tx.contractCall('campaign-manager', 'back-campaign', [
        types.uint(1),
        types.uint(500000) // 0.5 STX
      ], wallet2.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
    
    // Check campaign info
    let result = chain.callReadOnlyFn('campaign-manager', 'get-campaign-info', [types.uint(1)], wallet1.address);
    let campaignInfo = result.result.expectSome().expectTuple();
    assertEquals(campaignInfo['raised'], types.uint(500000));
    
    // Check backer amount
    result = chain.callReadOnlyFn('campaign-manager', 'get-backer-amount', [types.uint(1), types.principal(wallet2.address)], wallet1.address);
    assertEquals(result.result, types.uint(500000));
    
    // Try to end campaign (should fail as it's too early)
    block = chain.mineBlock([
      Tx.contractCall('campaign-manager', 'end-campaign', [types.uint(1)], wallet1.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u102)');
    
    // Mine blocks to reach end of campaign
    chain.mineEmptyBlockUntil(145);
    
    // End campaign
    block = chain.mineBlock([
      Tx.contractCall('campaign-manager', 'end-campaign', [types.uint(1)], wallet1.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
    
    // Verify campaign is no longer active
    result = chain.callReadOnlyFn('campaign-manager', 'get-campaign-info', [types.uint(1)], wallet1.address);
    campaignInfo = result.result.expectSome().expectTuple();
    assertEquals(campaignInfo['is-active'], types.bool(false));
  },
});
