import { DeployFunction } from 'hardhat-deploy/types'

const genesis: DeployFunction = async (hre) => {
  const { getNamedAccounts, deployments, contracts, ethers, network } = hre
  const { deployer } = await getNamedAccounts()

  const tellerProtocol = await deployments.deploy('TellerProtocol_v1', {
    from: deployer,
    args,
  })

  // const chainlinkAggregator = await deployments.save('PriceAggregator_v1', {
  // })
}

export default genesis
genesis.tags = ['genesis']
