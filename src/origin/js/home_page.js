var value=0;
var wallet;
var wallet_addr = '';
var cbUpdateWalletInfo = (res)=>{
    if(res){
        var data = JSON.parse(res);
        let account = data.accounts.find(e=>{return e.address == data.defaultAccountAddress;});
        wallet_addr = data.defaultAccountAddress;
        $('#title-pk').text(trim(wallet_addr));
        $('#input_pk').text(wallet_addr);
        if(account) $('.nickname').text(account.label);
        const address = wallet_addr;
        try {
            getBalance(address)  //Address类型参数
            .then(ret=>{
                console.log("getBalance succ:"+ JSON.stringify(ret));
                value = ret.result.dad;
                $('.value').text(ret.result.dad + ' DAD');
                $('#send').removeClass('inactive');
                saveAssets({addr:address, numb:ret.result.dad});
                delay2UpdateWalletInfo();
            })
            .catch(err=>{
                console.log("getBalance err:"+ JSON.stringify(err));
                delay2UpdateWalletInfo();
            });
        } catch (error) {
            delay2UpdateWalletInfo(1*1000);
        }

    }else{
        delay2UpdateWalletInfo();
    }
};
var coverBarTime;
getWalletFromLocal(initWallet);

$('.setting').on('click', function(){
    pageJump('settings.html')
});

$('.switchBtn').on('click', function(){
    const overlay = $('.overlay');
    const password_panel = $('#account_manager');
    overlay.removeClass('item-hide');
    overlay.addClass('fadeIn animated');
    password_panel.removeClass('item-hide');
    password_panel.addClass("fadeInLeft animated");
});

$('#close-panel').on('click', ()=>{
    closePanel();
});
$('.overlay').on('click', ()=>{
    closePanel();
});

function closePanel()
{
    const overlay = $('.overlay');
    const password_panel = $('#account_manager');
    overlay.addClass('fadeOut animated');
    password_panel.addClass("fadeOutLeft animated");
    setTimeout(function(){
        password_panel.removeClass('fadeInLeft fadeOutLeft animated');
        password_panel.addClass('item-hide');
        overlay.removeClass('fadeIn fadeOut animated');
        overlay.addClass('item-hide');
    },500)
}

$('#deleteCancel').on('click', function(){
    closeWarning()
});
$('.overlay1').on('click', function(){
    closeWarning()
});

let address2Delete = "";
$('#deleteConfirm').on('click', async function(){
    var wallet = await getWalletFromLocalEx();
    deleteAccount(address2Delete, wallet);
    removeAssets(address2Delete);
    refreshAccountList();
    closeWarning();
});

$('#record').on('click', ()=>{
    pageJump('tnxRecords.html');
});

$('#send').on('click', function(){
    if($('#send').hasClass('inactive')) return;
    pageJump('send.html?'+value+'&'+wallet_addr)
});

$('#receive').on('click', function(){
    pageJump('receive.html')
});

$('#scroll-field').scroll(()=>{
    clearTimeout(coverBarTime);
    $('#cover-bar').addClass('show-cover-bar');
    coverBarTime = setTimeout(()=>{
        $('#cover-bar').removeClass('show-cover-bar')
    },1500)
});

var clipboard = new ClipboardJS('#copy_pk');
clipboard.on('success', function(e){
    $('.toast-wrap').show();
    setTimeout(() => {
        $('.toast-wrap').fadeOut('slow');
    }, 1000);
});

setTimeout(() => {
    $.getScript("../lib/dad-sdk.js");
    $.getScript("../js/api/runtimeApi.js");
    $.getScript("../js/api/accountApi.js");
    $.getScript("../js/api/authApi.js");
}, 0.5*1000);

function initWallet(res){
    var data = JSON.parse(res);
    wallet = data;

    let account = data.accounts.find(e=>{return e.address == data.defaultAccountAddress;});
    wallet_addr = data.defaultAccountAddress;
    $('#title-pk').text(trim(wallet_addr));
    $('#input_pk').text(wallet_addr);
    if(account) $('.nickname').text(account.label);
    initMultiAccount(data);
    bindAccountButton();
    bg.wallet_addr = wallet_addr;
    bg.wallet = wallet;
    bg.wallet_str = res;
    bg.acc = account;
    cbUpdateWalletInfo(res);
    getAssets(wallet_addr, (res1)=>{
        if(res1){
            value = res1.numb;
            $('.value').text(res1.numb + ' DAD');
            $('#send').removeClass('inactive');
        }else{
            $('.value').text('0 DAD');
        }
    })
}

var delay2UpdateWalletInfo = (t=3*1000)=>{
    setTimeout(() => {
        getWalletFromLocal(cbUpdateWalletInfo)
    }, t);
};

function initMultiAccount(data){
    var text = '';
    data.accounts.map((value)=>{
        if(value.address === wallet_addr){
            text += '<div class="account_item2"><div class="account_item account_item_select" data-address="'+value.address+'">\n' +
                '            <img class="selectAccount" data-address="'+value.address+'" src="../img/select.svg">\n' +
                '            <p class="account_username account_username_select">'+value.label+'</p>\n' +
                '            <div class="deleteAccount_select" data-address="'+value.address+'"></div>\n' +
                '            <p class="account_address">'+trim(value.address)+'</p>\n' +
                '        </div></div>'
        }else{
            text += '<div class="account_item1"></dic><div class="account_item selectable" data-address="'+value.address+'">\n' +
                '            <p class="account_username">'+value.label+'</p>\n' +
                '            <div class="deleteAccount" data-address="'+value.address+'"></div>\n' +
                '            <p class="account_address">'+trim(value.address)+'</p>\n' +
                '        </div></div>'
        }
    });
    removePlaceHolder();
    text += '<div class="placeHolder"></div>';
    $('#scroll-field').append(text);
}

function removePlaceHolder(){
    var data = $('#scroll-field').find('.placeHolder')
    for(let i=0; i<data.length; i++){
        $(data[i]).remove()
    }
}

function openWarning(){
    const overlay = $('.overlay1');
    const password_panel = $('.password_panel');
    overlay.removeClass('item-hide');
    overlay.addClass('fadeIn animated');
    password_panel.removeClass('item-hide');
    password_panel.addClass("fadeInUp animated");
}

function closeWarning(){
    const overlay = $('.overlay1');
    const password_panel = $('.password_panel');
    overlay.addClass('fadeOut animated');
    password_panel.addClass("fadeOutDown animated");
    setTimeout(function(){
        password_panel.removeClass('fadeInUp fadeOutDown animated');
        password_panel.addClass('item-hide');
        overlay.removeClass('fadeIn fadeOut animated');
        overlay.addClass('item-hide');
    },500)
}

function refreshAccountList(){
    $('.account_item1').remove();
    $('.account_item2').remove();
    getWalletFromLocal(initWallet);
}

function bindAccountButton(){
    $('.account_item1').hover(function(){
        console.log($(this));
        $(this).find('.selectable').addClass('hoverItem')
    }, function(){
        console.log($(this));
        $(this).find('.selectable').removeClass('hoverItem')
    });


    $('.deleteAccount').on('click', async function(e){
        e.stopPropagation();
        let res =  await getAccountsFromLocal();
        if(res.accounts.length <= 1) {
            console.log('delete account fail, accounts length:'+res.accounts.length)
            return;
        }

        address2Delete = $(this).data('address');
        openWarning();
    });
    $('.deleteAccount_select').on('click', async function(e){
        e.stopPropagation();
        let res =  await getAccountsFromLocal();
        if(res.accounts.length <= 1) {
            console.log('delete account fail, accounts length:'+res.accounts.length)
            return;
        }

        address2Delete = $(this).data('address');
        openWarning();
    });

    $('.account_item').on('click', async function(){
        var address = $(this).data('address');
        var wallet = await getWalletFromLocalEx();
        let pk = getPKByAddr(address);
        
        savePK2Memory(pk, address);
        setDefaultAccount(address,wallet);
        refreshAccountList();
        closePanel();

    })
}

//anyway, close any popup
chrome.runtime.sendMessage({op:'closePopup'}, null);









