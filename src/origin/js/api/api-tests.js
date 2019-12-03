function testSignUp()
{
   let acc =  accountSignUp('test123456', 'binhan',true, null);
   console.log('testSignUp:'+JSON.stringify(acc));
}

function testImportByPrivateKey()
{
    // let privateKey = "Ky6q9zQCt6TxutyCy3YebZ1388nKXTLB7CfgEQo7ytcVHa9zmvdZ";
    let privateKey = "Ky1usZcE1pGi9VopDXCs7eRzvo9gAffoNBQZGQQdqtYf95jtC2zA";
    let password = "test123456";
    let ret = accountImportPrivateKey(privateKey, password , null);
    console.log("testImportByPrivateKey:"+ JSON.stringify(ret));
    return ret;
}

function testImportByMnemonics()
{
    let mnemonics = "flame eternal error flight meadow credit empty entire such case creek broccoli extra frequent skill domain enough twice knee paddle similar vault adjust diary";
    let password = "test123456";
    let ret = accountImportMnemonics(mnemonics,password,true, null);
    console.log("testImportByMnemonics:"+ JSON.stringify(ret));
}


function testTransfer()
{
    let {wallet} = testImportByPrivateKey();
    transfer(wallet, 'AecaeSEBkt5GcBCxwz1F41TvdjX3dnKBkJ','test123456', 100000)
    .then(ret=>{
        console.log("testTransfer ok:"+ JSON.stringify(ret))
    })
    .catch(err=>{
        console.log("testTransfer err:"+ JSON.stringify(err))
    });
}

function testSignIn()
{
    let {wallet} = testImportByPrivateKey();
    let ret = accountSignIn('test12345', wallet);
    console.log("testSignIn:"+ JSON.stringify(ret))
}

function testGetBalance()
{
    let {wallet} = testImportByPrivateKey();
    const account = getAccount(wallet);
    const address = account.address;

    //两种参数皆可
    // getBalance(address.value);  //string类型参数
    getBalance(address)  //Address类型参数
    .then(ret=>{
        console.log("testGetBalance ok:"+ JSON.stringify(ret))
    })
    .catch(err=>{
        console.log("testGetBalance err:"+ JSON.stringify(err))
    });
}


//私钥是否有效
function testIsValidPrivateKey()
{
    let key = "1202f7a2addb08e6a0f0c5f4282463654054b7b38ebf826369192c206ac87d87400f03f96829d8e1f345f7db9bfeb1731922bdda821f7d723d304fec665c1a1baf5911";
    console.log('testIsValidPrivateKey:'+isValidPrivateKey(key));
}


function testCreatePrivateKey()
{
    let pk = new Ont.Crypto.PrivateKey.random();
    console.log('testCreatePrivateKey:'+ JSON.stringify(pk));

}

//地址是否有效
function testIsValidAddress()
{
    let addr = 'AdPtntLH6NRSPW9zoyXhJQmHupFkgmvR1';
    console.log('testIsValidAddress:'+isValidAddress(addr));

}

//助记词是否有效
function testIsValidMnemonics()
{
    let menm = "flame eternal error flight meadow credit empty entire such case creek broccoli extra frequent skill domain enough twice knee paddle similar vault adjust \r\ndiary  ";
    console.log('testIsValidMnemonics:'+isValidMnemonics(menm));
}

function testGetPrivateKey()
{

    //创建含有三个账户的钱包 <--仅测试用，实际使用仅需调用testSetDefaultAccount
    let szCount = 10;
    let walletStr = null;
    for (let index = 0; index < szCount; index++) {
        let {wallet,wif} =  accountSignUp('test123456', 'binhan',true, walletStr);
        walletStr = wallet;
        wallet = JSON.parse(wallet);
        console.log('wallet acount wif:'+wif);
        console.log('wallet acount size:'+JSON.stringify(wallet.accounts.length));  
        console.log('wallet defaultAccountAddress:'+JSON.stringify(wallet.defaultAccountAddress));   
    }
    wallet = JSON.parse(walletStr);

    let ret = getPrivateKey(walletStr,'test123456', wallet.accounts[1].address); //return null if fail
    console.log('getPrivateKey:'+ret);
}

//获取某个地址下的分页交易信息
async function testGetTransactionsByAddr()
{
    let addr = 'AG7ayoCTEYFqK7CUg1agWib6iAr6vXim1i';
    try {
        let trns = await getTransactionsByAddr(addr,1,10);
        console.log('testGetTransactionsByAddr ok:'+JSON.stringify(trns));
    } catch (error) {
        console.log('testGetTransactionsByAddr error:'+JSON.stringify(error));
    }

}

//获取单个交易信息
async function testGetTransactionInfo()
{
    let trxHash = 'e4eefd8c0c6e45a24e2fc44f56902c623986645346aea723646657168ba0d304';
    try {
        let trxInfo = await getTransactionInfo(trxHash);
        console.log('getTransactionInfo ok:'+JSON.stringify(trxInfo));
    } catch (error) {
        console.log('getTransactionInfo error:'+JSON.stringify(error));
    }
}

//删除账号
function testDeleteAccount()
{
    //创建含有三个账户的钱包 <--仅测试用，实际使用仅需调用deleteAccount
    let szCount = 3;
    let walletStr = null;
    for (let index = 0; index < szCount; index++) {
        let {wallet} =  accountSignUp('test123456', 'binhan',true, walletStr);
        walletStr = wallet;
        wallet = JSON.parse(wallet);
        console.log('wallet acount size:'+JSON.stringify(wallet.accounts.length));  
        console.log('wallet defaultAccountAddress:'+JSON.stringify(wallet.defaultAccountAddress));   
    }

    wallet = JSON.parse(walletStr);

    //删除默认账户
    console.log('before delete, wallet defaultAccountAddress:'+JSON.stringify(wallet.defaultAccountAddress)); 
    console.log('before delete, wallet acount size:'+JSON.stringify(wallet.accounts.length));    
    wallet2 = deleteAccount(wallet.defaultAccountAddress, walletStr);
    wallet2 = JSON.parse(wallet2.wallet);
    console.log('after delete, wallet defaultAccountAddress:'+JSON.stringify(wallet2.defaultAccountAddress)); 
    console.log('after delete, wallet acount size:'+JSON.stringify(wallet2.accounts.length));   
}

//切换账号
function testSetDefaultAccount()
{
    //创建含有三个账户的钱包 <--仅测试用，实际使用仅需调用testSetDefaultAccount
    let szCount = 10;
    let walletStr = null;
    for (let index = 0; index < szCount; index++) {
        let {wallet} =  accountSignUp('test123456', 'binhan',true, walletStr);
        walletStr = wallet;
        wallet = JSON.parse(wallet);
        console.log('wallet acount size:'+JSON.stringify(wallet.accounts.length));  
        console.log('wallet defaultAccountAddress:'+JSON.stringify(wallet.defaultAccountAddress));   
    }
    wallet = JSON.parse(walletStr);

    //把第3个设置为钱包默认地址
    console.log('before set, wallet defaultAccountAddress:'+JSON.stringify(wallet.defaultAccountAddress)); 
    let wallet2 = setDefaultAccount(wallet.accounts[2].address, walletStr);
    wallet = JSON.parse(wallet2.wallet);
    console.log('after set, wallet defaultAccountAddress:'+JSON.stringify(wallet.defaultAccountAddress)); 
}

//获取本地钱包里面所有账号以及默认的账号地址
async function testGetAccountsFromLocal()
{

        let res =  await getAccountsFromLocal();
        console.log('get accounts:'+JSON.stringify(res));
        if(res.accounts.length == 0){
            console.log('本地不存在钱包。。。');
        }
}

// testIsValidPrivateKey();
// testCreatePrivateKey();
// testIsValidAddress();
// testIsValidMnemonics();
// testTransfer();
// testGetPrivateKey();
// testGetTransactionsByAddr();
// testGetTransactionInfo();

// testDeleteAccount();
// testSetDefaultAccount();
// testGetAccountsFromLocal();





