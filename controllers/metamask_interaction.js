///****************Interaction with Metamask****************////
const apikey = process.env.api_key;
const axios = require('axios');
const data = require('../model/datamodel');


//Returns the list of ERC-20 tokens transferred by an address, with optional filtering by token contract.
exports.tokenTransactions = async (req, res) => {
    const contractAddress = req.params.contractAddress;
    const accountAddress = req.params.accountAddress;
    try {
        var response = await axios.get(`https://api-ropsten.etherscan.io/api?module=account&action=tokentx&contractaddress=${contractAddress}&address=${accountAddress}&page=1&offset=100&startblock=0&endblock=99999999&sort=asc&apikey=${apikey}`);
        if (response) {
            for (i of response.data.result) {
                const found = await data.findOne({ transaction_hash: i.hash });
                if (found.length == 0) {
                    const value = i.value / 1000000000000000000
                    const data1 = new data({
                        transaction_from: i.from,
                        transaction_to: i.to,
                        transaction_value: value,
                        transaction_hash: i.hash,
                        tokenAddress: i.contractAddress
                    })
                    await data1.save();
                }
            }
            res.status(200).send({ Message: "Data saved in database", data: response.data });
        }
    } catch (err) {
        res.status(400).send(err);
    }
}
