import { getAccount, decryptAccount, getPrivateKeyObject, getAddress } from "./accountApi";
import {Crypto, RpcClient, DadAssetTxBuilder, TransactionBuilder, DadContractV2} from 'dad-ts-sdk';


const DEFAULT_GAS_LIMIT = 200000;
// const url_rpc  = "https://explorer.dad.one/test/rpc";
// const url_rest = "https://explorer.dad.one/test/api/v2";

const url_rpc  = "http://172.20.120.35:21336";
const url_rest = "http://172.20.120.35:8585/v2";

/**
 * 转账api
 * @param {string | Wallet} wallet
 * @param {string} ToAddr 
 * @param {string} password 
 * @param {bigint} amount 
 */
export async function transfer(wallet, ToAddr,  password, amount) {
    
    const account = getAccount(wallet);
    const from = account.address;
    const privateKey =  decryptAccount(wallet, password);
    const to = new Crypto.Address(ToAddr);

    amount = Math.floor(amount*Math.pow(10,9));

    console.log('send amount:'+amount);
    
    const tx = DadAssetTxBuilder.makeTransferTx(from, to, amount, "0", `${DEFAULT_GAS_LIMIT}`, from);
  
    await TransactionBuilder.signTransactionAsync(tx, privateKey);
  
    const client = new RpcClient(url_rpc);
    // const ret = await client.sendRawTransaction(tx.serialize(), false, true);
    const ret = await client.sendRawTransaction(tx.serialize(), false);
    return ret;
  }

  /**
   * @param {Address|string} address 
   */
  export async function getBalance(address)
  {
    if (typeof address === 'string') {
      address = new Crypto.Address(address);
    }
    const client = new RpcClient(url_rpc);
    const response = await client.getBalance(address);
    if(response && response.error == 0 && response.result && response.result.dad)
    {
      response.result.dad = response.result.dad/(Math.pow(10,9));
    }else {
       throw Error(response);
    }
    return response;
  }

  /**
   * 获取账户的交易记录：分页获取
   * @param {string} address 
   * @param {Number} pageNumber 
   * @param {Number} pageSize 
   */
  export async function getTransactionsByAddr(addr, pageNumb, pageSize)
  {
    let url = url_rest +'/addresses/'+ addr + '/transactions?page_number=' + pageNumb + '&page_size='+pageSize;
    console.log('url: '+url)
    return await doRequest(url);
  }

  /**
   * 获取单个交易详情
   * @param {string} trxHash 
   */
  export async function getTransactionInfo(trxHash)
  {
    let url = url_rest +"/transactions/"+ trxHash;
    console.log('url: '+url)
    return await doRequest(url);
  }

  export async function doRequest(url, type='get')
  {
      if(type==='get'){
        return new Promise((resolve, reject)=>{
          $.ajax({
            url: url,
            success: function(data){
                resolve(data)
            },
            error: function(data) {
                console.log('ajax fail:'+JSON.stringify(data));
                reject(data);
            },
            timeout: 5*1000 //in milliseconds
        });
        })
      }
  }

  export async function makeContributeTx(
    pkStr,
    walletStr,  
    action, //click
    orderID, //campaign_id
    publiserID) {//slot_id
      const pko =  getPrivateKeyObject(pkStr);
      let addr = getAddress(walletStr); 
      addr = new Crypto.Address(addr);
      const rpcClient = new RpcClient(url_rpc); 
      const txContribute = DadContractV2.makeContributeTx(addr, action,orderID, publiserID, addr,'0', '100000');
      TransactionBuilder.signTransaction(txContribute, pko);
      return await rpcClient.sendRawTransaction(txContribute.serialize());
  }
