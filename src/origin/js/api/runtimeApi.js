var bg = chrome.extension.getBackgroundPage();

const DEFAULT_GAS_LIMIT = 200000;
const url_rpc  = "https://explorer.dad.one/test/rpc";
const url_rest = "https://explorer.dad.one/test/api/v2";

// const url_rpc  = "http://172.20.120.35:21336";
// const url_rest = "http://172.20.120.35:8585/v2";

/**
 * 转账api
 * @param {string | Wallet} wallet
 * @param {string} ToAddr 
 * @param {string} password 
 * @param {bigint} amount 
 */
async function transfer(wallet, ToAddr,  password, amount) {

    const account = getAccount(wallet);
    const from = account.address;
    const privateKey =  decryptAccount(wallet, password);
    const to = new Ont.Crypto.Address(ToAddr);

    amount = Math.floor(amount*Math.pow(10,9));

    console.log('send amount:'+amount);
    
    const tx = Ont.DadAssetTxBuilder.makeTransferTx(from, to, amount, 0, `${DEFAULT_GAS_LIMIT}`, from);
  
    await Ont.TransactionBuilder.signTransactionAsync(tx, privateKey);
  
    const client = new Ont.RpcClient(url_rpc);
    const ret = await client.sendRawTransaction(tx.serialize(), false, true);
    return ret;
  }

  /**
   * @param {Address|string} address 
   */
  async function getBalance(address)
  {
    if (typeof address === 'string') {
      address = new Ont.Crypto.Address(address);
    }
    const client = new Ont.RpcClient(url_rpc);
    const response = await client.getBalance(address);
    if(response && response.result && response.result.dad)
    {
      response.result.dad = response.result.dad/(Math.pow(10,9));
    }
    return response;
  }

  /**
   * 获取账户的交易记录：分页获取
   * @param {string} address 
   * @param {Number} pageNumber 
   * @param {Number} pageSize 
   */
  async function getTransactionsByAddr(addr, pageNumb, pageSize)
  {
    let url = url_rest +'/addresses/'+ addr + '/transactions/v2?page_number=' + pageNumb + '&page_size='+pageSize;
    console.log('url: '+url)
    return await doRequest(url);
  }

  /**
   * 获取单个交易详情
   * @param {string} trxHash 
   */
  async function getTransactionInfo(trxHash)
  {
    let url = url_rest +"/transactions/"+ trxHash;
    console.log('url: '+url)
    return await doRequest(url);
  }

  async function doRequest(url, type='get')
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

  // Smart Contract calls
  async function makePlaceADTx(    
    advertiser,
    adType,
    token,
    bid,
    begin,
    expire,
    orderID,
    capaignName,
    capaignLink,
    contries,
    slots,
    creative) {
      let addr = getAddress(bg.wallet_str);
      const pk  = getPKByAddr(addr);
      const pko =  getPrivateKeyObject(pk);

      advertiser = new Ont.Crypto.Address(advertiser);
      addr = new Ont.Crypto.Address(addr);
      
      const rpcClient = new Ont.RpcClient(url_rpc); 
      const txPlaceAD = Ont.DadContractV2.makePlaceADTx(advertiser,
                                                        adType,
                                                        token,
                                                        bid,
                                                        begin,
                                                        expire,
                                                        orderID,
                                                        capaignName,
                                                        capaignLink,
                                                        contries,
                                                        slots,
                                                        creative,
                                                        addr,
                                                        0,
                                                        100000);

      Ont.TransactionBuilder.signTransaction(txPlaceAD, pko);
      return await rpcClient.sendRawTransaction(txPlaceAD.serialize());
  }

  async function makeContributeTx(    
    userAddress,
    action,
    orderID,
    publiserID) {
      let addr = getAddress(bg.wallet_str);
      const pk  = getPKByAddr(addr);
      const pko =  getPrivateKeyObject(pk);

      userAddress = new Ont.Crypto.Address(userAddress);
      addr = new Ont.Crypto.Address(addr);

      const rpcClient = new Ont.RpcClient(url_rpc); 
      const txContribute = Ont.DadContractV2.makeContributeTx(userAddress, action,orderID, publiserID, addr,0,100000);

      Ont.TransactionBuilder.signTransaction(txContribute, pko);
      return await rpcClient.sendRawTransaction(txContribute.serialize());
  }

  async function makePlacePublisherTx(    
    appType,
    webwapType,
    appTypeApp ) {
      let addr = getAddress(bg.wallet_str);
      const pk  = getPKByAddr(addr);
      const pko =  getPrivateKeyObject(pk);

      addr = new Ont.Crypto.Address(addr);
      if(webwapType){
        webwapType.creator = new Ont.Crypto.Address(webwapType.creator);
      }
      if(appTypeApp){
        appTypeApp.creator = new Ont.Crypto.Address(appTypeApp.creator);
      }

      const rpcClient = new Ont.RpcClient(url_rpc); 
      const publisherTx1 = await Ont.DadContractV2.makePlacePublisherTx(appType,webwapType,appTypeApp,addr,0,100000);

      Ont.TransactionBuilder.signTransaction(publisherTx1, pko);
      return await rpcClient.sendRawTransaction(publisherTx1.serialize());
  }

  async function makeChangeAppStatusTx(    
    appID,
    status,) {
      let addr = getAddress(bg.wallet_str);
      const pk  = getPKByAddr(addr);
      const pko =  getPrivateKeyObject(pk);

      addr = new Ont.Crypto.Address(addr);

      const rpcClient = new Ont.RpcClient(url_rpc);
      const chanAppS2 = await Ont.DadContractV2.makeChangeAppStatusTx(appID,status,addr,0,100000);

      Ont.TransactionBuilder.signTransaction(chanAppS2, pko);
      return await rpcClient.sendRawTransaction(chanAppS2.serialize());
  }

  async function makeChangeStatusOrderPlacedTx(    
    orderID,
    status,) {
      let addr = getAddress(bg.wallet_str);
      const pk  = getPKByAddr(addr);
      const pko =  getPrivateKeyObject(pk);

      addr = new Ont.Crypto.Address(addr);

      const rpcClient = new Ont.RpcClient(url_rpc);
      const txChangeOrder = Ont.DadContractV2.makeChangeStatusOrderPlacedTx(orderID, status, addr,0,100000);
      Ont.TransactionBuilder.signTransaction(txChangeOrder, pko);
      return await rpcClient.sendRawTransaction(txChangeOrder.serialize());
  }

  async function makePledgeTx(    
    token,
    advertiser,
    bid,
    orderID) {
      let addr = getAddress(bg.wallet_str);
      const pk  = getPKByAddr(addr);
      const pko =  getPrivateKeyObject(pk);
      const rpcClient = new Ont.RpcClient(url_rpc);

      advertiser = new Ont.Crypto.Address(advertiser);
      addr = new Ont.Crypto.Address(addr);

      const tx = Ont.DadContractV2.makePledgeTx(token, advertiser, bid, orderID, addr, 0, 100000);
      Ont.TransactionBuilder.signTransaction(tx, pko);
      return await rpcClient.sendRawTransaction(tx.serialize());
  }
