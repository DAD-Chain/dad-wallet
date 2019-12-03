import { client, provider } from 'dad-dapi';
import { assetApi as asset } from './dapp/asset';
import { identityApi as identity } from './dapp/identity';
import { messageApi as message } from './dapp/message';
import { networkApi as network } from './dapp/network';
import { providerApi } from './dapp/provider';
import { smartContractApi as smartContract } from './dapp/smartContract';
import { dadContractApi as dadContract } from './dapp/dadContract';
import { stateChannelApi as stateChannel } from './dapp/stateChannel';
import { browser } from 'webextension-polyfill-ts';

console.log('register dapi provider in backgroud.js');
provider.registerProvider({
    logMessages: false,
    provider: {
      asset,
      identity,
      message,
      network,
      provider: providerApi,
      smartContract,
      dadContract,
      stateChannel,
      utils: client.api.utils
    },
});

//popup manager
const width = 320;
const height = 600;
const bg : any = chrome.extension.getBackgroundPage();
let popupId = -1;
let closeActionFromIcon = false;

export async function showPopup() {

  bg.href = "pledge.html";
  let popup = await findPopup();

  //每次都弹出新popup，并关闭老popup
  if (popup) {
    await closePopup();
    popup = null;
  }

  popup = await browser.windows.create({
    height,
    type: 'popup',
    url: 'pages/contract.html',
    width,
  });
  popupId = popup.id!;

  console.log('add listener, popup id:'+popupId);
  browser.windows.onRemoved.removeListener(onPopupRemoved);
  browser.windows.onRemoved.addListener(onPopupRemoved);
}

function onPopupRemoved(popupId){
  console.log('on popup removed:'+popupId); 
  if(!closeActionFromIcon){ //如果用户是点击icon来关闭popup,则不需要reject，因为是用户可能现在里面进行智能合约操作
    bg.defer.resolve({
      code: -1,
      result: 'REJECT'
    });
  }
  closeActionFromIcon = false;
}

export async function closePopup(){
  await browser.windows.remove(popupId);
  popupId = -1;
}

export async function findPopup() {
  const windows = await browser.windows.getAll({
    windowTypes: ['popup'],
  });

  const ownWindows = windows.filter((w) => w.id === popupId);

  if (ownWindows.length > 0) {
    return ownWindows[0];
  } else {
    return null;
  }
}

//close any popup while click icon
chrome.browserAction.onClicked.addListener(function(tab) 
{ 
    console.log('browserAction.onClicked')
    closeActionFromIcon = true;
    closePopup();
});

//receive message
chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
  console.log('on message')
  console.log(request)

      if (request.op == "closePopup")
      {
        let popup = await findPopup();
        if(popup != null){
          closePopup();
        }
      }
});