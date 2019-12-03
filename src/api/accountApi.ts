import { getWallet } from "./authApi";
import { get } from 'lodash';
import { Reader, Address } from 'ontology-ts-crypto';
import { Account, Crypto, utils, Wallet } from 'dad-ts-sdk';
import { v4 as uuid } from 'uuid';

/**
 * 注册账户
 * @param {string} password
 * @param {string} accountName
 * @param {boolen} neo
 * @param {string | Wallet | null} wallet
 */
export function accountSignUp(password, accountName = null, neo = true, wallet = null) {
  const mnemonics = utils.generateMnemonic(16);
  return accountImportMnemonics(mnemonics, password, neo, wallet,accountName,true);
}

/**
 * return null if failed
 * @param {string | Wallet |} wallet 
 * @param {string} password 
 * @param {string} address 如果不传，选取idx为0的account
 */
export function getPrivateKey(wallet, password, addressStr = null)
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
    return null;
  }
}

export function getPrivateKeyObject(privateKeyStr) : Crypto.PrivateKey{
    let privateKey: Crypto.PrivateKey = null;
  if (privateKeyStr.length === 52) {
    privateKey = Crypto.PrivateKey.deserializeWIF(privateKeyStr);
  } else {
    privateKey = deserializePrivateKey(privateKeyStr);
  }
  return privateKey;
}

/**
 * 登陆账户: error:0, error:1
 * @param {string} password
 * @param {string | Wallet} wallet
 * @param {string} addressStr
 */
export function accountSignIn(password, wallet, addressStr = null){
  console.log('accountSignIn,'+password + " "+wallet)
  if (typeof wallet === 'string') {
    wallet = getWallet(wallet);
  }

  try {
    let ret =  decryptAccount(wallet, password, addressStr);
    // setIsLogin(true);

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
export function accountImportMnemonics(
    mnemonics,
    password,
    neo = true,
    wallet = null,
    label=null,
    isSignUp = false
  ) {
    const bip32Path = neo ? "m/44'/888'/0'/0/0" : "m/44'/1024'/0'/0/0";
    const privateKey = Crypto.PrivateKey.generateFromMnemonic(mnemonics, bip32Path);
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
export function accountImportPrivateKey(privateKeyStr, password, wallet = null, label=null,isSignUp = false) {
    if (wallet === null) {
      wallet = Wallet.create(uuid());
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
      privateKey = Crypto.PrivateKey.deserializeWIF(privateKeyStr);
    } else {
      privateKey = deserializePrivateKey(privateKeyStr);
    }

    if(label === null){
      label = uuid();
    }
    const account = Account.create(privateKey, password, label, scryptParams);

    //try to delete duplicated account.
    let res = deleteAccount(account.address.toBase58(), wallet, isSignUp);
    wallet = getWallet(res.wallet);

    wallet.addAccount(account);
    wallet.setDefaultAccount(account.address.toBase58());

    // if(isSignUp == false){
    //   setIsLogin(true);
    //   saveWallet2Local(wallet.toJson());
    // }

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
  export function decryptAccount(wallet, password, addressStr = null) {
    if (typeof wallet === 'string') {
      wallet = getWallet(wallet);
    }
    const account = getAccount(wallet, addressStr);
    const saltHex = Buffer.from(account.salt, 'base64').toString('hex');
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
 export function getAccount(wallet, addressStr = null) {
    if (typeof wallet === 'string') {
      wallet = getWallet(wallet);
    }else {
      wallet = getWallet(JSON.stringify(wallet));
    }

    console.log('type of wallet: '+ typeof wallet);

    let defaultAddress = wallet.defaultAccountAddress;

    if(addressStr != null)
    {
      defaultAddress = addressStr;
    }

    if (defaultAddress != null) {
      console.log('type of address: '+ typeof wallet.accounts[0].address);
      const account = wallet.accounts.find((a) => {
        if(typeof a.address === 'string'){
          return a.address === defaultAddress
        }else if (typeof a.address === 'object'){
          return a.address.toBase58() === defaultAddress
        }
        return false;
      });

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
export function getAddress(wallet) {
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

  // if(!isSignUp){
  //   saveWallet2Local(wallet.toJson());
  // }

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

  // saveWallet2Local(wallet.toJson());

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
    const b = new Buffer(str, 'hex');
    const r = new Reader(b);

    if (b.length === 32) {
      // ECDSA
      const algorithm = Crypto.KeyType.ECDSA;
      const curve = Crypto.CurveLabel.SECP256R1;
      const sk = r.readBytes(32);
      return new Crypto.PrivateKey(sk.toString('hex'), algorithm, new Crypto.KeyParameters(curve));
    } else {
      const algorithmHex = r.readByte();
      const curveHex = r.readByte();
      const sk = r.readBytes(32);

      return new Crypto.PrivateKey(
        sk.toString('hex'),
        Crypto.KeyType.fromHex(algorithmHex),
        new Crypto.KeyParameters(Crypto.CurveLabel.fromHex(curveHex)),
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
      Crypto.PrivateKey.deserializeWIF(privateKeyStr);
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
    utils.parseMnemonic(nemonics);
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
    let test1 = new Crypto.Address(addressStr);
    let test2 = test1.toHexString();
    return true;
  } catch (error) {
    return false;
  }
}
