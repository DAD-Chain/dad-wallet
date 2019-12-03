/**
 * 
 * @param {string} walletEncoded 
 */
 function getWallet(walletEncoded) {
    if (walletEncoded == null) {
      throw new Error('Missing wallet data.');
    }
    return Ont.Wallet.parseJson(walletEncoded);
  }
  
  /**
   * 
   * @param {Wallet} wallet 
   */
 function encodeWallet(wallet) {
    return wallet.toJson();
  }