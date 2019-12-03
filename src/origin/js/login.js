var hasWallet = false;

getWalletFromLocal((res)=>{
    if(!res){
        $('#sign_in').addClass('item-hide');
        $('#new_account').removeClass('whiteBtn');
        $('#new_account').addClass('blueBtn');
        $('#restore_account').removeClass('transparentBtn');
        $('#restore_account').addClass('whiteBtn')
    }else{
        hasWallet = true;
    }
});


$('#sign_in').on('click', function(){
    if(hasWallet === false)return;
    pageJump('login_back.html');
});

$('#new_account').on('click', function(){
    isWalletFull().then(res=>{
        if(res){
            showToast();
        }else{
            pageJump('newAccount.html');
        }
    }).catch(err=>{
        showToast();
    })
});

$('#restore_account').on('click', function(){
    isWalletFull().then(res=>{
        if(res){
            showToast();
        }else{
            const overlay = $('.overlay');
            const password_panel = $('.password_panel');
            overlay.removeClass('item-hide');
            overlay.addClass('fadeIn animated');
            password_panel.removeClass('item-hide');
            password_panel.addClass("fadeInUp animated");
        }
    }).catch(err=>{
        showToast();
    })
});

$('#close-panel').on('click', function(){
    const overlay = $('.overlay');
    const password_panel = $('.password_panel');
    overlay.addClass('fadeOut animated');
    password_panel.addClass("fadeOutDown animated");
    setTimeout(function(){
        password_panel.removeClass('fadeInUp fadeOutDown animated');
        password_panel.addClass('item-hide');
        overlay.removeClass('fadeIn fadeOut animated');
        overlay.addClass('item-hide');
    },500)
});

$('#mn_phrase').on('click', function(){
    pageJump('mv.html?');
});

$('#pk').on('click', function(){
    pageJump('pkv.html?');
});


function showToast(){
    $('.toast-wrap').show();
    setTimeout(() => {
        $('.toast-wrap').fadeOut('slow');
    }, 1000);
}
