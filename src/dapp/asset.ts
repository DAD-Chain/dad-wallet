import { AssetApi } from 'dad-dapi';
import { getAccount } from '../api/accountApi';
import { isLogin } from './utils';
var bg : any = chrome.extension.getBackgroundPage();

export const assetApi: AssetApi = {
  getAccount(): Promise<string> {
    // no account
    const wallet = bg.wallet_str;
    if (wallet === undefined || wallet === null) {
      return Promise.reject('NO_ACCOUNT');
    }

    // auto logout
    if (isLogin() !== true) {
      return Promise.reject('TIME_OUT');
    }

    let account : any = getAccount(wallet);
    return Promise.resolve(account.address);
  },

  getPublicKey(): Promise<string> {
    // const state = getStore().getState();
    // const wallet = state.wallet.wallet;

    // if (wallet === null) {
    //   return Promise.reject('NO_ACCOUNT');
    // }

    // return Promise.resolve(getPublicKey(wallet));
    return Promise.reject('NO_ACCOUNT');
  },

  async send({ to, asset, amount }): Promise<string> {
    // return await getRequestsManager().initTransfer({ recipient: to, asset, amount });
    return Promise.reject('NO_ACCOUNT');
  },
};
