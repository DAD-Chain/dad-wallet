function pageJump(url) {
    window.location.href = url;

    // chrome.browserAction.setPopup({popup: "../pages/"+url});
}
function transferLocalTime(ns){

    Date.prototype.toLocaleString = function() {
        return this.getFullYear() + "/" + (this.getMonth() + 1) + "/" + this.getDate() + " " + getSeconds(this.getHours()) + ":" + getSeconds(this.getMinutes()) + ":" + getSeconds(this.getSeconds());
    };

    return new Date(parseInt(ns) * 1000).toLocaleString();
}

function getSeconds(data){
    if(data<10){
        return '0'+data
    }else{
        return data
    }
}


function trim(str){
    if(!str) return '---'
    if(str.length>22){
        return str.substring(0,12)+'...'+str.substring(str.length-12,str.length);
    }
}

function trim6(str){
    return str.substring(0,6)+'...'+str.substring(str.length-6,str.length);
}

async function loadScripts(scripts)
{
    return new Promise((resolve, reject)=>{
        let total = scripts.length;
        scripts.forEach(element => {
            $.getScript(element).done(function(script, textStatus) {
                console.log("finished loading and running "+element+" with a status of" + textStatus);
                if(textStatus == 'success'){
                    total--;
                    if(total == 0)resolve();
                }else{
                    reject();
                }
            });
        });
    })
}

function contains(array, tnx){
    for (let index = 0; index < array.length; index++) {
        if(array[index].tx_hash == tnx.tx_hash){
            return true;
        }
    }
    return false;
}

/**
 * 返回值：newTNXS -- 所有的新记录数组； isPageFull -- 页面数据是否满了
 * @param {array} localTNXS
 * @param {array} serverTNXS
 */
function compareTNXS(localTNXS, serverTNXS){
    let newTNXS = []; //新加入的记录
    let remainTNXS = []; //需要保留的记录
    let removeTNXS = []; //需删除的记录

    // 对比服务器和本地交易记录，本地不存在的记录存入newTNXS, 本地也存在的存入remainTNXS
    for (let index = 0; index < serverTNXS.length; index++) {
        if(!contains(localTNXS, serverTNXS[index])){
            newTNXS.push(serverTNXS[index]);
        }else{
            remainTNXS.push(serverTNXS[index]);
        }
    }

    // 从本地交易记录中，过滤掉需要保留的交易记录，剩下的就是需要删除的交易记录
    for (let index = 0; index < localTNXS.length; index++) {
        if(!contains(remainTNXS, localTNXS[index])){
            removeTNXS.push(localTNXS[index]);
        }
    }

    console.log('>>> compareTNXS, new:'+newTNXS.length + " remove:"+removeTNXS.length);

    return {
        newTNXS: newTNXS,
        removeTNXS: removeTNXS,
    }
}

/**
 *
 * @param {object} transfer
 * @param {string} addrStr 不传的话，会采用默认账号地址做比较
 */
async function isSendTransfer(transfer, addrStr = null)
{
    if(transfer == undefined || transfer == null)
    {
        throw new Error('Not a valid transfer object');
    }

    let address = addrStr;
    if(address = null)
    {
        let wallet = await getWalletFromLocalEx();
        address = wallet.defaultAccountAddress;
    }

    if(address == transfer.from_address){
        return true;
    }else if(address == transfer.to_address){
        return false;
    }else{
        throw new Error('Target address is not in transfer');
    }
}

/**
 * 返回钱包里所有账号，以及默认账号地址。如果不存在accounts.length = 0
 */
async function getAccountsFromLocal(){
    try {
        let walletStr = await getWalletFromLocalEx();
        let wallet = JSON.parse(walletStr);
        return {
            accounts: wallet.accounts,
            default: wallet.defaultAccountAddress
        }
    } catch (error) {
        console.log('Get Accounts fail:'+error);
        return {
            accounts: [],
            default: ""
        }
    }
}

async function isWalletFull(){
    let res = await getAccountsFromLocal();
    if(res.accounts.length == 10){
        return true;
    }else{
        return false;
    }
}

//================*分割线上面是工具函数下面是通用执行*=========================
bg = chrome.extension.getBackgroundPage();
setPermanentPage();
bindReturnButtons();
checkSession();
setupOnMessageLister();

function setupOnMessageLister() {
    // chrome.runtime.onMessage.addListener( (request, sender, sendResponse)=>{
    //     console.log('on message at tools , req:'+JSON.stringify(request));
    //     console.log(sender.tab ?
    //         "from a content script:" + sender.tab.url :
    //         "from the extension");
    //     if (request.dst == "tools" && request.op == 'logout'){
    //         setFromSettings(false);
    //         setIsLogin(false);
    //         pageJump('login_back.html')
    //         sendResponse({code:0});
    //     }
    //     return true;
    // })
}

function setFromSettings(isFrom)
{
    bg.isFromSettings = isFrom;
}

function isFromSettings()
{
    if(bg.isFromSettings === true){
        return true;
    }else{
        return false;
    }
}

var autoLastTime = null;
function setIsLogin(isLogin)
{
    console.log('call set islogin:'+isLogin);
    bg.isLogin = isLogin;
    clearInterval(autoLastTime);
    if(isLogin){
        bg.lastTime = new Date().getTime();
        console.log('keep session alive:'+bg.lastTime);
        autoLastTime = setInterval(()=>{
            bg.lastTime = new Date().getTime();
            console.log('keep session alive:'+bg.lastTime);
        }, 10*1000);
    }
}

function getIsLogin(){
    if(bg.isLogin == undefined){
        return false;
    }
    return bg.isLogin;
}

function getLastTime(){
    if(bg.lastTime == undefined){
        return  new Date().getTime();
    }
    return bg.lastTime;
}

function bindReturnButtons(){
    const returnBtn = $('.returnBtnCorner');
    if(returnBtn){

        returnBtn.on('click', function(){
            var href = window.location.pathname;

            href = href.split('/');
            href = href[href.length-1];
            switch (href) {
                case 'login_back.html':
                    pageJump('login.html');
                    break;
                case 'mapk.html':
                    pageJump('newAccount.html');
                    break;
                case 'mwv.html':
                    pageJump('mapk.html');
                    break;
                case 'send.html':
                    pageJump('home.html');
                    break;
                case 'receive.html':
                    pageJump('home.html');
                    break;
                case 'export.html':
                    bg.exportAccount = null;
                    pageJump('exportSelection.html');
                    break;
                case 'tnx.html':
                    pageJump('home.html');
                    break;
                case 'tnxRecords.html':
                    pageJump('home.html');
                    break;
                case 'contract.html':
                    pageJump('home.html');
                    break;
                case 'settings.html':
                    pageJump('home.html');
                    break;
                case 'exportSelection.html':
                    pageJump('settings.html');
                    break;
                case 'newAccount.html':
                    pageJump('login.html');
                    break;
                case 'mv.html':
                    pageJump('exportSelection.html');
                    break;
                case 'pkv.html':
                    pageJump('exportSelection.html');
                    break;
                case 'mv.html?':
                    pageJump('login.html');
                    break;
                case 'pkv.html?':
                    pageJump('login.html');
                    break;
            }
        })
    }
}

function setPermanentPage(){
    var href = window.location.href;
    href = href.split('/');
    href = href[href.length-1];
    console.log('>>> open with1 '+href);
    var href2 = bg.href;
    if(href2 && href2 === "contract.html"){
        href = href2;
        window.location.href = href;
        bg.href = null;
        console.log('>>> open with2 '+href);
    }
    console.log('>>> open with3 '+href);
    chrome.browserAction.setPopup({popup: "../pages/"+href});
}


  //===================== save&restore wallet string from local file system
  /**
 *
 * @param {string} wallet
 */
function saveWallet2Local(wallet, cb = null){
    chrome.storage.local.set({wallet: wallet}, function() {
        console.log('saveWallet2Local: ' + wallet);
        if(cb) cb();
      });
}

function savePK2Memory(pk, addr = null) {
    console.log(`save pk:${pk}, for addr:${addr}`);

    if(!bg.pks){
        bg.pks = {};
    }
  
    if(addr){
        bg.pks[addr] = pk;
    }
  }
  
function getPKByAddr(addr) {
    let pk = null;

    if (!bg.pks) {
        bg.pks = {};
    }

    if (addr) {
        pk = bg.pks[addr];
    }

    if (pk === undefined) {
        pk = null;
    }

    console.log(`get pk:${pk}, by addr:${addr}`);
    return pk;
}

function getWalletFromLocal(cb){
let before = new Date().getTime();
chrome.storage.local.get(['wallet'], function(result) {
    console.log('getWalletFromLocal : '+result);
    cb(result.wallet)
  });
}

async function getWalletFromLocalEx()
{
    return new Promise((reslove,reject)=>{
        chrome.storage.local.get(['wallet'], function(result) {
            if(result.wallet){
                reslove(result.wallet);
            }else{
                reslove(null);
            }
          });
    })
}

async function checkSession(){
    if(getIsLogin()){
        let now = new Date().getTime();
        let before = getLastTime();
        if(now -before > 30*60*1000){ //30 min auto logout
            console.log('already time out, jump to login_back.html');
            setFromSettings(false);
            setIsLogin(false);
            pageJump('login_back.html')
        }else{
            setIsLogin(true);
            console.log('login but not time out, just remain at:'+window.location.pathname);
        }
    }else{
        console.log('not login, no need jump to login_back.html')
    }
}

/**
 * addr必须含有， 其他至少要有一个
 * @param {object} assetObj  {addr, numb, ...}
 */
async function saveAssets(assetObj){
    let addr = assetObj.addr;
    let assetObjOld = await _getAssets(addr);

    let keys = Object.getOwnPropertyNames(assetObj);
    keys.forEach(key => {
        assetObjOld[key] = assetObj[key];
    });
    let obj = {};
    obj[addr] = assetObjOld;
    // console.log('call saveAssets:'+JSON.stringify(obj));
    chrome.storage.local.set(obj, function() {
    });
}

function getAssets(addr, cb){
    chrome.storage.local.get([addr], function(result) {
        // console.log('call getAssets:'+JSON.stringify(result[addr]));
        cb(result[addr])
    });
}

async function _getAssets(addr){
    return new Promise((reslove, reject)=>{
        chrome.storage.local.get([addr], function(result) {
            if(result && result[addr]){
                reslove(result[addr]);
            }else{
                reslove({});
            }
        });
    })
}

function removeAssets(addr,cb = null){
    chrome.storage.local.remove([addr], function(result) {
        if(cb != null) cb()
    });
}


