//**********Interaction With Smart contract ***********///

const req = require('express/lib/request');
const res = require('express/lib/response');
const { findSourceMap } = require('module');
const Web3 = require('web3');
const ethNetwork = process.env.ethNetwork;
const web3 = new Web3(new Web3.providers.HttpProvider(ethNetwork));
const contractABI = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "delegate", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "delegate", "type": "address" }, { "internalType": "uint256", "name": "numTokens", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "tokenOwner", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "receiver", "type": "address" }, { "internalType": "uint256", "name": "numTokens", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "buyer", "type": "address" }, { "internalType": "uint256", "name": "numTokens", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }]
const contractAddress = process.env.contract_address;
const contract = new web3.eth.Contract(contractABI, contractAddress);
const data = require('../model/datamodel');
const user = require('../model/usermodel');


exports.newUser = async (req, res) => {
    const existUser = await user.findOne({ accountAddress: req.body.accountAddress });
    const user1 = new user({
        username: req.body.username,
        accountAddress: req.body.accountAddress,
        accountPrivateKey: req.body.accountPrivateKey
    });
    if (existUser) return res.status(400).send({ message: "User already exist..", data: existUser });

    const savedUser = await user1.save();
    res.status(200).send({ message: "User Data saved successfully..", data: savedUser });
}

exports.allTransactions = async (req, res) => {
    try{
        const tokenAddress = req.params.tokenAddress;
        const transactions = await data.find({ tokenAddress: tokenAddress });
        res.status(200).send(transactions);
    }catch(err){
        res.status(400).send(err)
    }
}


exports.accountTransactions = async (req, res) => {
    const accountAddress = req.params.accountAddress;
    const transactions = await data.find({
        $or: [
            {
                transaction_from: accountAddress
            },
            {
                transaction_to: accountAddress
            }
        ]
    })
    res.status(200).send(transactions);
}

exports.totalSupply = (req, res) => {
    contract.methods.totalSupply().call()
        .then((data) => {
            res.status(200).send(data);
        }).catch((err) => {
            res.status(400).send(err);
        });
}

exports.balanceOf = (req, res) => {
    const tokenOwner = req.params.tokenOwner
    contract.methods.balanceOf(tokenOwner).call()
        .then((data) => {
            res.status(200).send(data);
        }).catch((err) => {
            res.status(400).send(err);
        });
}

exports.transfer = async (req, res) => {
    var MainAccountAddress = req.body.MainAccountAddress;
    const toAddress = req.body.receiver;
    const value = req.body.numTokens;
    const tokenAddress = req.body.tokenAddress;

    const userdata = await user.findOne({ accountAddress: req.body.MainAccountAddress });
    if (!userdata) return res.status(400).send("User is not registered with privateKey..");

    var MainAccountPrivateKey = userdata.accountPrivateKey;
    TransferERC20Token(toAddress, value, MainAccountAddress, MainAccountPrivateKey, tokenAddress)
        .then((data) => {
            res.status(200).send(data);
        }).catch((err) => {
            res.status(400).send(err);
        });


}


exports.transferFrom = async (req, res) => {
    var MainAccountAddress = req.body.MainAccountAddress;
    const toAddress = req.body.receiver;
    const value = req.body.numTokens;
    const tokenAddress = req.body.tokenAddress;
    const userdata = await user.findOne({ accountAddress: req.body.MainAccountAddress });
    if (!userdata) return res.status(400).send("User is not registered with privateKey..");
    var MainAccountPrivateKey = userdata.accountPrivateKey;

    TransferERC20Token(toAddress, value, MainAccountAddress, MainAccountPrivateKey, tokenAddress)
        .then((data) => {
            res.status(200).send(data);
        }).catch((err) => {
            res.status(400).send(err);
        })

}


exports.approve = async (req, res) => {
    const delegate = req.query.delegate;
    const numTokens = req.query.numTokens;
    await contract.methods.approve(delegate, numTokens).call()
        .then((data) => {
            res.status(200).send(data);
        }).catch((err) => {
            res.status(400).send(err);
        })
}

exports.allowance = (req, res) => {
    const owner = req.query.owner;
    const delegate = req.query.delegate;
    contract.methods.allowance(owner, delegate).call()
        .then((data) => {
            res.status(200).send(data);
        }).catch((err) => {
            res.status(400).send(err);
        })
}


//Function to transfer ERC20 token
async function TransferERC20Token(toAddress, value, MainAccountAddress, MainAccountPrivateKey, tokenAddress) {
    return new Promise(function (resolve, reject) {
        try {
            web3.eth.getBlock("latest", false, (error, result) => {
                if (error) { console.log(error); }
                var _gasLimit = result.gasLimit;
                // console.log(_gasLimit);
                let contract = new web3.eth.Contract(contractABI, contractAddress);
                contract.methods.decimals().call().then(function (result) {
                    try {
                        var decimals = result;
                        let amount = parseFloat(value) * Math.pow(10, decimals);
                        web3.eth.getGasPrice(function (error, result) {
                            if (error) { console.log(error); }
                            var _gasPrice = result;
                            // console.log(_gasPrice);
                            try {
                                const Tx = require('ethereumjs-tx').Transaction;
                                const privateKey = Buffer.from(MainAccountPrivateKey, 'hex');
                                var _hex_gasLimit = web3.utils.toHex((_gasLimit + 1000000).toString());
                                var _hex_gasPrice = web3.utils.toHex(_gasPrice.toString());
                                var _hex_value = web3.utils.toHex(amount.toString());
                                var _hex_Gas = web3.utils.toHex('60000');
                                web3.eth.getTransactionCount(MainAccountAddress).then(
                                    nonce => {
                                        var _hex_nonce = web3.utils.toHex(nonce);
                                        const rawTx =
                                        {
                                            nonce: _hex_nonce,
                                            from: MainAccountAddress,
                                            to: contractAddress,
                                            gasPrice: _hex_gasPrice,
                                            gasLimit: _hex_gasLimit,
                                            gas: _hex_Gas,
                                            value: '0x0',
                                            data: contract.methods.transfer(toAddress, _hex_value).encodeABI()
                                        };
                                        const tx = new Tx(rawTx, { 'chain': 'ropsten' });
                                        tx.sign(privateKey);
                                        var serializedTx = '0x' + tx.serialize().toString('hex');
                                        web3.eth.sendSignedTransaction(serializedTx.toString('hex'), async function (err, hash) {
                                            if (err) {
                                                // console.log(err)
                                                reject(err);
                                            } else {
                                                const data1 = await new data({
                                                    transaction_from: MainAccountAddress,
                                                    transaction_to: toAddress,
                                                    transaction_value: value,
                                                    transaction_hash: hash,
                                                    tokenAddress: tokenAddress
                                                })
                                                const data2 = await data1.save();
                                                resolve(data2);
                                            }
                                        })
                                    });
                            } catch (err) { reject(err); }
                        });
                    } catch (err) { reject(err); }
                });
            });
        } catch (err) { reject(err); }
    })
}