// Smart contracts

// Util classes
const { zerocollateral, tokens } = require("../utils/contracts");
const { printFullLoan, printOraclePrice } = require("../../test/utils/printer");
const ProcessArgs = require('../utils/ProcessArgs');
const processArgs = new ProcessArgs();

// Parameters
const loanId = 1;
const tokenName = 'DAI';

module.exports = async (callback) => {
    try {
        const getContracts = processArgs.createGetContracts(artifacts);
        const loansInstance = await getContracts.getDeployed(zerocollateral.loans(tokenName));
        const oracleInstance = await getContracts.getDeployed(zerocollateral.oracle(tokenName));
        const tokenInstance = await getContracts.getDeployed(tokens.get(tokenName));

        const loanIDCounter = await loansInstance.loanIDCounter();
        const loanCounter = parseInt(loanIDCounter.toString());

        console.log(`Total # Loans (${tokenName}): ${loanCounter}`);
        console.log('-'.repeat(70));

        const latestAnswer  = await oracleInstance.getLatestAnswer();
        const latestTimestamp = await oracleInstance.getLatestTimestamp();
        printOraclePrice(web3, tokenName, latestAnswer, latestTimestamp);
        console.log('-'.repeat(70));

        const tokenDecimals = parseInt(await tokenInstance.decimals());
        const loanInfo = await loansInstance.loans(loanId);

        printFullLoan(web3, { tokenName, tokenDecimals }, latestAnswer, loanInfo);
        
        console.log('>>>> The script finished successfully. <<<<');
        callback();
    } catch (error) {
        console.log(error);
        callback(error);
    }
};
