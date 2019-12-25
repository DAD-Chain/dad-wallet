import { DadContract } from 'dad-dapi';
import { showPopup } from '../background';
import { Deferred} from '../deffered'
import { isLogin, getPKByAddr} from './utils'
import { makeContributeTx } from '../api/runtimeApi';
import { getAddress, getPrivateKeyObject } from '../api/accountApi';

const bg : any = chrome.extension.getBackgroundPage();

export const dadContractApi: DadContract = {

  async makePledgeTx({ token, advertiser, bid, orderID }): Promise<any> {
    console.log('on call makePledgeTx');
  },

  async invoke({ operation, args }): Promise<any>{
    //auto logout
    if(isLogin() !== true){
      return Promise.reject('TIME_OUT');
    }

    const addr = getAddress(bg.wallet_str);
    const pk  = getPKByAddr(addr);

    if(!pk){
      bg.lastTime = 0;
      return Promise.reject('PK ERROR');
    }

    //非法的操作
    if( operation !== 'makePledgeTx' && 
        operation !== 'makeChangeStatusOrderPlacedTx' &&
        operation !== 'makeChangeAppStatusTx' &&
        operation !== 'makePlacePublisherTx' &&
        operation !== 'makeContributeTx' &&
        operation !== 'makePlaceSlotTx' &&
        operation !== 'makeChangeSlotStatusTx' &&
        operation !== 'makePlaceADTx' ){
      return Promise.reject('UNSUPPORTED');
    }

    if(operation === 'makeContributeTx'){
      console.log('call makeContributeTx');
      let argsObj : any = JSON.parse(args);
      let {action, orderID, publiserID} = argsObj;
      return await makeContributeTx(pk, bg.wallet_str, action, orderID, publiserID);
    }

    let argsObj : any = JSON.parse(args);
    bg.op = operation;
    bg.args = argsObj;
    bg.defer = new Deferred();

    await showPopup();

    return bg.defer.promise;
  },

  async makePlaceADTx({ token, advertiser, bid, orderID, adType, begin, expire }) : Promise<any> {
    console.log('on call makePlaceADTx');
    throw new Error('UNSUPPORTED');
  },

  async makeContributeTx({ userAddress, action, publiserID, orderID }): Promise<any> {
    console.log('on call makeContributeTx');
    throw new Error('UNSUPPORTED');
  },

  async makeChangeStatusOrderPlacedTx({ orderID, status }): Promise<any> {
    console.log('on call makeChangeStatusOrderPlacedTx');
    throw new Error('UNSUPPORTED');
  }
};
