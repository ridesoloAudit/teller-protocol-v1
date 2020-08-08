// JS Libraries
const withData = require('leche').withData;
const { t, createMocks } = require('../utils/consts');

// Mock contracts
const Mock = artifacts.require("./mock/util/Mock.sol");

// Smart contracts
const MarketsState = artifacts.require("./base/MarketsState.sol");

const actions = { Supply: 'Supply', Borrow: 'Borrow', Repay: 'Repay' };

contract('MarketsStateGetSupplyToDebtTest', function (accounts) {
    const owner = accounts[0];
    let mocks;
    let instance;
    
    beforeEach('Setup for each test', async () => {
        instance = await MarketsState.new();
        instance.addWhitelisted(owner, { from: owner});
        mocks = await createMocks(Mock, 10);
    });

    const newAmount = (amount, type, borrowedIndex, collateralIndex) => ({amount, type, borrowedIndex, collateralIndex});

    withData({
        // (500 borrow - 100 repay) / 2000 Supply = 0.2
        _1_scenario: [
            [
                newAmount(1000, actions.Supply, 0, 1),
                newAmount(1000, actions.Supply, 0, 1),
                newAmount(500, actions.Borrow, 0, 1),
                newAmount(100, actions.Repay, 0, 1),
            ], 0, 1, 0.2 * 10000
        ],
        // (2000 borrow - 1000 repay) / 2000 Supply = 0.5
        _2_scenario: [
            [
                newAmount(1000, actions.Supply, 0, 1),
                newAmount(1000, actions.Supply, 0, 1),
                newAmount(500, actions.Borrow, 0, 1),
                newAmount(500, actions.Repay, 0, 1),
                newAmount(500, actions.Repay, 0, 1),
                newAmount(1500, actions.Borrow, 0, 1),
            ], 0, 1, 0.5 * 10000
        ],
        // (2500 borrow - 0 repay) / 2500 Supply = 1
        _3_scenario: [
            [
                newAmount(1000, actions.Supply, 0, 1),
                newAmount(500, actions.Borrow, 0, 1),
                newAmount(1500, actions.Supply, 0, 1),
                newAmount(1500, actions.Borrow, 0, 1),
                newAmount(500, actions.Borrow, 0, 1),
            ], 0, 1, 1 * 10000
        ],
        // (0 borrow - 0 repay) / 1000 Supply = 0
        _4_scenario: [
            [
                newAmount(1000, actions.Supply, 0, 1),
            ], 0, 1, 0 * 10000
        ],
        // (0 borrow - 0 repay) / 0 Supply = 0
        _5_scenario: [
            [], 0, 1, 0 * 10000
        ],
    }, function(previousAmounts, borrowedIndexToTest, collateralIndexToTest, expectedResult) {
        it(t('user', 'getSupplyToDebt', 'Should be able to get the supply to debt value.', false), async function() {
            // Setup
            for (const { amount, type, borrowedIndex, collateralIndex } of previousAmounts) {
                const borrowedAssset = mocks[borrowedIndex];
                const collateralAssset = mocks[collateralIndex];
                if(type === actions.Supply) {
                    await instance.increaseSupply(borrowedAssset, collateralAssset, amount, { from: owner });
                }
                if(type === actions.Borrow) {
                    await instance.increaseBorrow(borrowedAssset, collateralAssset, amount, { from: owner });
                }
                if(type === actions.Repay) {
                    await instance.increaseRepayment(borrowedAssset, collateralAssset, amount, { from: owner });
                }
            }
            const borrowedAsssetToTest = mocks[borrowedIndexToTest];
            const collateralAsssetToTest = mocks[collateralIndexToTest];

            // Invocation
            const result = await instance.getSupplyToDebt(
                borrowedAsssetToTest,
                collateralAsssetToTest
            );

            // Assertions
            assert.equal(result.toString(), expectedResult.toString());
        });
    });
});