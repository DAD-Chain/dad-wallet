var bg  = chrome.extension.getBackgroundPage();

//当用户异常关闭popup，defer可能已经完成拒绝操作。
if(bg.defer && bg.defer.isDone()){
    console.log('defer is done');
    pageJump('home.html')
}

var op = bg.op;
var args = bg.args;
updateUI(op, args);

function updateUI(op, args) {
    console.log('update ui in contract page 2, op:'+op + ' args:'+JSON.stringify(args));

    let isPledge = false;
    //设置函数名
    $('.func-value-raw').text(op);
    if(op == 'makePledgeTx'){
        isPledge = true;
        $('.func-value-raw').text("pledge");
    }else if(op === 'makeChangeStatusOrderPlacedTx'){
        $('.func-value-raw').text("modifyStatus");
    }else if(op === 'makeChangeAppStatusTx'){
        $('.func-value-raw').text("modifyStatus");
    }else if(op === 'makePlacePublisherTx'){
        $('.func-value-raw').text("placePublisher");
    }else if(op === 'makeContributeTx'){
        $('.func-value-raw').text("contribute");
    }else if(op === 'makePlaceADTx'){
        $('.func-value-raw').text("placeAd");
    }

    //设置函数cost
    $('.cost-value').text(0);
    if(isPledge){
        let value = args['bid']/Math.pow(10,9);
        $('.cost-value').text(value)
    }

    //设置网站名
    if(args['host']){
        $('#site-name').text(args['host']);
    }

    //设置网站参数
    let args_txt = "";
    let keys = Object.keys(args);
    for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        let value = args[key];
        if( (key === 'bid' && isPledge ) || 
            (key === 'host')){
            continue;
        }

        if( key === 'bid'){
            value = value/Math.pow(10,9);
        }

        if(typeof value === 'object'){
            let value_txt = '<br />';
            value_txt += '{<br />';
            Object.keys(value).forEach(element => {
                value_txt += "  "+element+": "+ value[element] +"<br />";
            });
            value_txt += "}"
            value = value_txt;
        }

        args_txt += key+": "+ value +"<br />";
    }
    $('.args-details').html(args_txt);
}

$('#btn-show-args').on('click', ()=>{
    console.log('on click show');
    $('#btn-show-args').css('display', 'none');
    $('#btn-hide-args').css('display', 'inline');
    $('.args-container').css('display', 'inline');
})

$('#btn-hide-args').on('click', ()=>{
    $('#btn-show-args').css('display', 'inline');
    $('#btn-hide-args').css('display', 'none');
    $('.args-container').css('display', 'none');
})

$('#reject').on('click', ()=>{
    console.log('click reject button');
    bg.defer.resolve({
        code: -1,
        result: 'REJECT'
    });
    pageJump('home.html')
})

$('#accept').on('click', ()=>{
    $('.loading').addClass('showup');
    $('#reject').addClass('inactive');
    $('#accept').addClass('inactive');

    onAccept().then(res=>{
        console.log('contract deploy return:'+ JSON.stringify(res));
        console.log( bg.defer)
        bg.defer.resolve({
            code: res.error,
            result: res.result
        });
        
        if(res.error == 0){
            $('.toast-wrap').text('Operation success');
        }else{
            $('.toast-wrap').text('Operation failed, please try again');
        }

        $('.loading').removeClass('showup');
        $('.toast-wrap').show();
        setTimeout(() => {
            pageJump('home.html');
        }, 2000);

    }).catch(err=>{
        console.log('contract deploy fail:'+err.message);
        console.log( bg.defer)
        bg.defer.resolve({
            code: 1,
            result: err.message
        });

        $('.toast-wrap').text('Operation failed, please try again');
        $('.loading').removeClass('showup');
        $('.toast-wrap').show();

        setTimeout(() => {
            pageJump('home.html');
        }, 2000);
    })
})

async function onAccept() {
    console.log('call on accept');
    
    if(op == 'makePledgeTx'){
        return await makePledge(args);
    }else if(op === 'makeChangeStatusOrderPlacedTx'){
        return await makeChangeStatusOrderPlaced(args);
    }else if(op === 'makeChangeAppStatusTx'){
        return await makeChangeAppStatus(args);
    }else if(op === 'makePlacePublisherTx'){
        return await makePlacePublisher(args);
    }else if(op === 'makeContributeTx'){
        return await makeContribute(args);
    }else if(op === 'makePlaceADTx'){
        return await makePlaceAD(args);
    }else{
        return Promise.reject('UNSPPORT')
    }
}

async function makePledge(args) {
    console.log('call makePledge:'+JSON.stringify(args));
    const {token,advertiser,bid,orderID} = args;
    return await makePledgeTx(token,advertiser,bid,orderID);
}

async function makeChangeStatusOrderPlaced(args) {
    const {orderID,status} = args;
    return await makeChangeStatusOrderPlacedTx(orderID, status);
}

async function makeChangeAppStatus(args) {
    const {orderID,status} = args;
    return await makeChangeAppStatusTx(orderID, status);
}

async function makePlacePublisher(args) {
    const {appType,webwapType,appTypeApp} = args;
    return await makePlacePublisherTx(appType, webwapType, appTypeApp);
}

async function makeContribute(args) {
    const {userAddress,action,orderID,publiserID} = args;
    return await makeContributeTx(userAddress, action, orderID, publiserID);
}

async function makePlaceAD(args) {
    const {
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
        creative
    } = args;
    return await makePlaceADTx(advertiser,adType,token,bid,begin,expire,orderID,capaignName,capaignLink,contries,slots,creative);
}