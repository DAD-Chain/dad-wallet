const bg : any = chrome.extension.getBackgroundPage();

export function isLogin() : boolean {
    //手动登出了，直接return false
    if(bg.isLogin !== true){
        return false;
    }

    //是否已经自动登出了？？
    if (bg.lastTime == undefined) {
        bg.lastTime = new Date().getTime();
    }
    let now = new Date().getTime();
    let before = bg.lastTime;
    let isLogin: boolean = (now - before) < 30*60*1000;
    return isLogin;
}

export function getPKByAddr(addr) {
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
  
    return pk;
  }