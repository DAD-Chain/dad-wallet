import {Wallet} from 'dad-ts-sdk';

/**
 * 
 * @param {string} walletEncoded 
 */
export function getWallet(walletEncoded) {
    if (walletEncoded == null) {
      throw new Error('Missing wallet data.');
    }
    return Wallet.parseJson(walletEncoded);
  }
  
  /**
   * 
   * @param {Wallet} wallet 
   */
  export function encodeWallet(wallet) {
    return wallet.toJson();
  }