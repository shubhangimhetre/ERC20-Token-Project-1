const router= require('express').Router();
const serve=require('../controllers/sc_interaction');
const serve2=require('../controllers/metamask_interaction');


//**********Interaction With Smart contract ***********///

//user register 
router.post('/newUser',serve.newUser);

//get all transactions of given tokenAddress
router.get('/allTokenTransactions/:tokenAddress',serve.allTransactions);

//get all transactions of given accountAdresss
router.get('/accountTransactions/:accountAddress',serve.accountTransactions);

//totalSupply of the token.
router.get('/totalSupply',serve.totalSupply);

//account balance
router.get('/balanceOf/:tokenOwner',serve.balanceOf);

//Transfers amount of tokens from the owner to other address
router.post('/transfer',serve.transfer);

//Transfers amount of tokens from the one address to other address
router.post('/transferFrom',serve.transferFrom);

//allows the owner of the account spender to withdraw tokens from your account upto the value amount
router.get('/approve',serve.approve);

// Returns the amount that spender is still allowed to withdraw from owner
router.get('/allowance',serve.allowance);


///****************Interaction with Metamask****************////


//Returns the list of ERC-20 tokens transferred by an address, with optional filtering by token contract.
router.get('/tokenTransactions/:contractAddress/:accountAddress',serve2.tokenTransactions);


module.exports=router;


