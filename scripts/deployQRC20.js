const hre = require('hardhat')
const quais = require('quais')
const { pollFor } = require('quais-polling')

async function main() {
	// Define contract using hardhat runtime (for ABI and bytecode)
	const ethersContract = await hre.ethers.getContractFactory('QRC20')

	// Configure quai network provider based on hardhat network config
	const quaisProvider = new quais.providers.JsonRpcProvider(hre.network.config.url)

	// Configure quai wallet based on hardhat network config
	const walletWithProvider = new quais.Wallet(hre.network.config.accounts[0], quaisProvider)

	// Ensure provider is ready
	await quaisProvider.ready

	// Build contract factory using quai provider and wallet
	const QuaisContract = new quais.ContractFactory(
		ethersContract.interface.fragments,
		ethersContract.bytecode,
		walletWithProvider
	)

	// Deploy greeter contract with initial greeting
	const quaisContract = await QuaisContract.deploy({ gasLimit: 5000000 })

	// Use quais-polling shim to wait for contract to be deployed
	const deployReceipt = await pollFor(
		quaisProvider, // provider passed to poller
		'getTransactionReceipt', // method to call on provider
		[quaisContract.deployTransaction.hash], // params to pass to method
		1.5, // initial polling interval in seconds
		1 // request timeout in seconds
	)
	console.log('Contract deployed. Transaction receipt: ', deployReceipt)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
