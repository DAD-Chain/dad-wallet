import { MessageApi, Signature } from 'dad-dapi';
import { getPrivateKeyObject, getAddress } from '../api/accountApi';
import { Crypto, utils } from 'dad-ts-sdk';
import { isLogin, getPKByAddr } from './utils';

// import { messageVerify } from '../api/messageApi';
// import { getRequestsManager } from '../requestsManager';

// const messagePrefix = 'Ontology message:';
var bg : any = chrome.extension.getBackgroundPage();

export const messageApi: MessageApi = {

  async signMessageHash({ messageHash }): Promise<Signature> {
    throw new Error('UNSUPPORTED');
  },
  
  async verifyMessageHash({ messageHash, signature }): Promise<boolean> {
    throw new Error('UNSUPPORTED');
  },

  async signMessage({ message }): Promise<Signature> {

    //auto logout
    if (isLogin() !== true) {
      return Promise.reject('TIME_OUT');
    }

    const addr = getAddress(bg.wallet_str);
    const pk = getPKByAddr(addr);

    if (!pk) {
      bg.lastTime = 0;
      return Promise.reject('PK ERROR');
    }

    let pko :Crypto.PrivateKey = getPrivateKeyObject(pk);
    let publicKey = pko.getPublicKey();
    let messageHex = utils.str2hexstr(message)
    let sig = await pko.sign(messageHex);

    return {
      data: sig.serializeHex(),
      publicKey: publicKey.serializeHex()
    };

  },

  async verifyMessage({ message, signature }): Promise<boolean> {
    // return Promise.resolve(messageVerify(message, signature));
    throw new Error('UNSUPPORTED');
  }
}
