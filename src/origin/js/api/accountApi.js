
/**
 * 注册账户
 * @param {string} password
 * @param {string} accountName
 * @param {boolen} neo
 * @param {string | Wallet | null} wallet
 */
function accountSignUp(password, accountName = null, neo = true, wallet = null) {
  const mnemonics = Ont.utils.generateMnemonic(16);
  return accountImportMnemonics(mnemonics, password, neo, wallet,accountName,true);
}

/**
 * return null if failed
 * @param {string | Wallet |} wallet 
 * @param {string} password 
 * @param {string} address 如果不传，选取idx为0的account
 */
function getPrivateKey(wallet, password, addressStr = null)
{
  try {
    if (typeof wallet === 'string') {
      wallet = getWallet(wallet);
    }
    let account = wallet.accounts[0];
    if(addressStr != null){
      account = getAccount(wallet, addressStr);
    }
    let pk = account.exportPrivateKey(password);
    let pkStr = pk.serializeWIF();
    return pkStr;
  } catch (error) {
    console.log(error);
    return null;
  }
}

/**
 * 登陆账户: error:0, error:1
 * @param {string} password
 * @param {string | Wallet} wallet
 * @param {string} addressStr
 */
function accountSignIn(password, wallet, addressStr = null){
  console.log('accountSignIn,'+password + " "+wallet)
  if (typeof wallet === 'string') {
    wallet = getWallet(wallet);
  }

  try {
    let ret =  decryptAccount(wallet, password, addressStr);

    const account = getAccount(wallet, addressStr);
    const pk = account.exportPrivateKey(password).serializeWIF();

    console.log('login pk:'+pk);
    setIsLogin(true);
    savePK2Memory(pk, account.address.toBase58());
    return {
      error: 0,
      ...ret
    }
  } catch (error) {
    return {
      error: 1,
      msg: error
    }
  }
}

/**
 * 账户导入：以助记词的方式
 * @param {string} mnemonics
 * @param {string} password
 * @param {boolean} neo
 * @param {string | Wallet | null} wallet
 */
function accountImportMnemonics(
    mnemonics,
    password,
    neo = true,
    wallet = null,
    label=null,
    isSignUp = false
  ) {
    const bip32Path = neo ? "m/44'/888'/0'/0/0" : "m/44'/1024'/0'/0/0";
    const privateKey = Ont.Crypto.PrivateKey.generateFromMnemonic(mnemonics, bip32Path);
    const wif = privateKey.serializeWIF();

    const result = accountImportPrivateKey(wif, password, wallet,label, isSignUp);

    return {
      mnemonics,
      ...result,
    };
  }

/**
 * 账户导入：以私钥的方式
 * @param {string} privateKeyStr
 * @param {string} password
 * @param {string | Wallet | null} wallet
 * @param {string} label
 */
function accountImportPrivateKey(privateKeyStr, password, wallet = null, label=null,isSignUp = false) {
    if (wallet === null) {
      wallet = Ont.Wallet.create(uuid());
    } else if (typeof wallet === 'string') {
      wallet = getWallet(wallet);
    }

    const scrypt = wallet.scrypt;
    const scryptParams = {
      blockSize: scrypt.r,
      cost: scrypt.n,
      parallel: scrypt.p,
      size: scrypt.dkLen,
    };

    let privateKey; //PrivateKey

    if (privateKeyStr.length === 52) {
      privateKey = Ont.Crypto.PrivateKey.deserializeWIF(privateKeyStr);
    } else {
      privateKey = deserializePrivateKey(privateKeyStr);
    }

    if(label === null){
      label = uuid();
    }
    const account = Ont.Account.create(privateKey, password, label, scryptParams);

    //try to delete duplicated account.
    let res = deleteAccount(account.address.toBase58(), wallet, isSignUp);
    wallet = getWallet(res.wallet);

    wallet.addAccount(account);
    wallet.setDefaultAccount(account.address.toBase58());

    if(isSignUp == false){
      setIsLogin(true);
      saveWallet2Local(wallet.toJson());
    }

    savePK2Memory(privateKeyStr, account.address.toBase58());

    return {
      encryptedWif: account.encryptedKey.serializeWIF(),
      wallet: wallet.toJson(),
      wif: privateKey.serializeWIF(),
    };
  }


  /**
   *
   * @param {string | Wallet } wallet
   * @param {string} password
   * @param {string} addressStr
   */
  function decryptAccount(wallet, password, addressStr = null) {
    if (typeof wallet === 'string') {
      wallet = getWallet(wallet);
    }
    const account = getAccount(wallet, addressStr);
    const saltHex = buffer.Buffer.from(account.salt, 'base64').toString('hex');
    const encryptedKey = account.encryptedKey;
    const scrypt = wallet.scrypt;

    return encryptedKey.decrypt(password, account.address, saltHex, {
      blockSize: scrypt.r,
      cost: scrypt.n,
      parallel: scrypt.p,
      size: scrypt.dkLen,
    });
  }

  /**
   *  @param { string | Wallet} wallet
   *  @param {string} addressStr
   */
 function getAccount(wallet, addressStr = null) {
    if (typeof wallet === 'string') {
      wallet = getWallet(wallet);
    }

    let defaultAddress = wallet.defaultAccountAddress;

    if(addressStr != null)
    {
      defaultAddress = addressStr;
    }

    if (defaultAddress != null) {
      const account = wallet.accounts.find((a) => a.address.toBase58() === defaultAddress);

      if (account === undefined) {
        throw new Error('Default account not found in wallet');
      }
      return account;
    } else {
      return wallet.accounts[0];
    }
}


/**
 *
 * @param {string | Wallet} wallet
 */
function getAddress(wallet) {
  const account = getAccount(wallet);
  return account.address.toBase58();
}

/**
 *
 * @param {string} address
 * @param {string | Wallet} wallet
 */
function deleteAccount(address, wallet, isSignUp = false) {
  if (typeof wallet === 'string') {
    wallet = getWallet(wallet);
  }

  const account = wallet.accounts.find((a) => a.address.toBase58() === address);

  if (account !== undefined) {
    wallet.accounts = wallet.accounts.filter((a) => a.address.toBase58() !== address);
  }

  if (wallet.defaultAccountAddress === address) {
    wallet.defaultAccountAddress = wallet.accounts.length > 0 ? wallet.accounts[0].address.toBase58() : '';
  }

  if(!isSignUp){
    saveWallet2Local(wallet.toJson());
  }

  return {
    wallet: wallet.toJson(),
  };
}

/**
 * 设置新的默认账户,即切换账号. 返回值为新的钱包信息。未找到地址时抛出异常。
 * @param {*} address 
 * @param {*} wallet 
 */
function setDefaultAccount(address, wallet)
{
  if (typeof wallet === 'string') {
    wallet = getWallet(wallet);
  }

  const account = wallet.accounts.find((a) => a.address.toBase58() === address);

  if (account !== undefined) {
    wallet.defaultAccountAddress = account.address.toBase58();
  }else{
    throw new Error('Not found account address in wallet!');
  }

  saveWallet2Local(wallet.toJson());

  return {
    wallet: wallet.toJson(),
  };
}

/**
 *
 * @param {string} walletEncoded
 */
function getPublicKey(walletEncoded) {
  const wallet = getWallet(walletEncoded);

  const account = wallet.accounts.find((a) => a.address.toBase58() === wallet.defaultAccountAddress);
  if (account !== undefined) {
    return account.publicKey;
  } else {
    return '';
  }
}

function getPrivateKeyObject(privateKeyStr) {
  let privateKey= null;
  if (privateKeyStr.length === 52) {
    privateKey = Ont.Crypto.PrivateKey.deserializeWIF(privateKeyStr);
  } else {
    privateKey = deserializePrivateKey(privateKeyStr);
  }
  return privateKey;
}

/**
 *
 * @param {*} wallet
 */
function isLedgerKey(wallet) {
  return get(getAccount(wallet).encryptedKey, 'type') === 'LEDGER';
}
/**
 *
 * @param {string} str
 */
function deserializePrivateKey(str) {
    const b = new buffer.Buffer(str, 'hex');
    const r = new Ont2.Reader(b);

    if (b.length === 32) {
      // ECDSA
      const algorithm = Ont.Crypto.KeyType.ECDSA;
      const curve = Ont.Crypto.CurveLabel.SECP256R1;
      const sk = r.readBytes(32);
      return new Ont.Crypto.PrivateKey(sk.toString('hex'), algorithm, new Ont.Crypto.KeyParameters(curve));
    } else {
      const algorithmHex = r.readByte();
      const curveHex = r.readByte();
      const sk = r.readBytes(32);

      return new Ont.Crypto.PrivateKey(
        sk.toString('hex'),
        Ont.Crypto.KeyType.fromHex(algorithmHex),
        new Ont.Crypto.KeyParameters(Ont.Crypto.CurveLabel.fromHex(curveHex)),
      );
    }
  }

//======================私钥，助记词，地址验证

//私钥是否有效
function isValidPrivateKey(privateKeyStr)
{
  if(privateKeyStr === undefined || privateKeyStr === null){
    return false;
  }

  try {
    if (privateKeyStr.length === 52) {
      Ont.Crypto.PrivateKey.deserializeWIF(privateKeyStr);
    } else {
      // deserializePrivateKey(privateKeyStr);
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}

//助记词是否有效
function isValidMnemonics(nemonics)
{
  if(nemonics == undefined || nemonics == null){
    return false;
  }

  nemonics = convertMnemonics(nemonics);

  try {
    Ont.utils.parseMnemonic(nemonics);
    return true;
  } catch (error) {
    return false;
  }
}

function convertMnemonics(nemonics)
{
  if(nemonics == undefined || nemonics == null){
    return nemonics;
  }
    //用空格替换所有回车
    nemonics = nemonics.replace(/\r\n/g, " ");
    nemonics = nemonics.replace(/\n/g, " ");
  
    //按空格切分数组
    nemonics = nemonics.split(" ");
  
    //过滤掉空字符
    nemonics = nemonics.filter(e=> e != '');
  
    //重新组合字符串
    nemonics = nemonics.join(" ");
    return nemonics;
}

//地址是否有效
function isValidAddress(addressStr)
{
  if(addressStr === undefined || addressStr === null){
    return false;
  }

  try {
    // let test1 = Ont.Crypto.base58ToHex(addressStr);
    let test1 = new Ont.Crypto.Address(addressStr);
    let test2 = test1.toHexString();
    return true;
  } catch (error) {
    return false;
  }
}
