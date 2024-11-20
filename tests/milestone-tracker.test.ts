// tests/milestone-tracker_test.ts

import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Ensure that milestones can be added and completed",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    // Add a milestone (this should be called by the campaign-manager contract in practice)
    let block = chain.mineBlock([
      Tx.contractCall('milestone-tracker', 'add-milestone', [
        types.uint(1), // campaign-id
        types.utf8("First milestone"),
        types.uint(500000) // 0.5 STX
      ], deployer.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u1)');
    
    // Get milestone info
    let result = chain.callReadOnlyFn('milestone-tracker', 'get-milestone-info', [types.uint(1)], deployer.address);
    let milestoneInfo = result.result.expectSome().expectTuple();
    assertEquals(milestoneInfo['completed'], types.bool(false));
    
    // Complete the milestone
    block = chain.mineBlock([
      Tx.contractCall('milestone-tracker', 'complete-milestone', [types.uint(1)], deployer.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
    
    // Verify milestone is completed
    result = chain.callReadOnlyFn('milestone-tracker', 'get-milestone-info', [types.uint(1)], deployer.address);
    milestoneInfo = result.result.expectSome().expectTuple();
    assertEquals(milestoneInfo['completed'], types.bool(true));
    
    // Get campaign milestones
    result = chain.callReadOnlyFn('milestone-tracker', 'get-campaign-milestones', [types.uint(1)], deployer.address);
    let campaignMilestones = result.result.expectSome().expectList();
    assertEquals(campaignMilestones[0], types.uint(1));
  },
});
