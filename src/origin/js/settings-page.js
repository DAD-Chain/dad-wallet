var passwordInput = $('#password');
var wallet;

getWalletFromLocal((res)=>{
    wallet = res;
    $('#continue').on('click', ()=>{
        jumpToExport();
    });
});

function jumpToExport(){
    if($('#continue').hasClass('inactive'))return;
    let ret = accountSignIn($('#password').val(), wallet);
    if(ret.error !== 0){
        $('#password').addClass('input_warning');
        $('#passwordwarn').append('<p>- Password error</p>');
        $('#passworderror').addClass('showup');
        passwordOk= false;
        checkExportConfirm();
        return;
    }
    pageJump('export.html?'+$('#password').val());
}

$('.export').on('click', ()=>{
    pageJump('exportSelection.html');
    // const overlay = $('.overlay');
    // const password_panel = $('#export-panel');
    // overlay.removeClass('item-hide');
    // overlay.addClass('fadeIn animated');
    // password_panel.removeClass('item-hide');
    // password_panel.addClass("fadeInUp animated");
});

$('.new-account').on('click', ()=>{
    isWalletFull().then(res=>{
        if(res){
            showToast();
        }else{
            setFromSettings(true);
            pageJump('newAccount.html');
        }
    }).catch(err=>{
        showToast();
    });
});

$('.restore').on('click', function(){
    isWalletFull().then(res=>{
        if(res){
            showToast();
        }else{
            const overlay = $('.overlay');
            const password_panel = $('#restore-panel');
            overlay.removeClass('item-hide');
            overlay.addClass('fadeIn animated');
            password_panel.removeClass('item-hide');
            password_panel.addClass("fadeInUp animated");
        }
    }).catch(err=>{
        showToast();
    });
});

$('#close-panel').on('click', function(){
    const overlay = $('.overlay');
    const password_panel = $('#restore-panel');
    overlay.addClass('fadeOut animated');
    password_panel.addClass("fadeOutDown animated");
    setTimeout(function(){
        password_panel.removeClass('fadeInUp fadeOutDown animated');
        password_panel.addClass('item-hide');
        overlay.removeClass('fadeIn fadeOut animated');
        overlay.addClass('item-hide');
    },500)
});

$('.overlay').on('click', function(){
    const overlay = $('.overlay');
    const password_panel = $('#restore-panel');
    overlay.addClass('fadeOut animated');
    password_panel.addClass("fadeOutDown animated");
    setTimeout(function(){
        password_panel.removeClass('fadeInUp fadeOutDown animated');
        password_panel.addClass('item-hide');
        overlay.removeClass('fadeIn fadeOut animated');
        overlay.addClass('item-hide');
    },500)
});

$('#close-panel1').on('click', function(){
    const overlay = $('.overlay');
    const password_panel = $('#export-panel');
    overlay.addClass('fadeOut animated');
    password_panel.addClass("fadeOutDown animated");
    setTimeout(function(){
        password_panel.removeClass('fadeInUp fadeOutDown animated');
        password_panel.addClass('item-hide');
        overlay.removeClass('fadeIn fadeOut animated');
        overlay.addClass('item-hide');
        $('#password').val('')
        $('#passwordwarn').empty();
        $('#password').removeClass('input_warning');
        $('#passworderror').removeClass('showup');
        passwordOk = false;
        checkExportConfirm();
    },500)
});

$('.logout').on('click', ()=>{
    setFromSettings(false);
    setIsLogin(false);
    pageJump('login_back.html')
});

$('#mn_phrase').on('click', function(){
    pageJump('mv.html');
});

$('#pk').on('click', function(){
    pageJump('pkv.html');
});

passwordInput.keyup(()=>{
    if(event.key === 'Enter'){
        jumpToExport();
    }
});
passwordInput.on('keypress', function(e) {
    if (e.which === 32)
        return false;
});
passwordInput.on('input propertychange',()=>{
    $('#passwordwarn').empty();
    $('#password').removeClass('input_warning');
    $('#passworderror').removeClass('showup');
    var userInput = $('#password').val();
    var warnTips ='';
    if(userInput==='')return;
    if(userInput.length<6 || userInput.length>16){
        warnTips+='<p>- 6-16 characters</p>'
    }
    if(warnTips.length>0){
        $('#password').addClass('input_warning');
        $('#passwordwarn').append(warnTips);
        $('#passworderror').addClass('showup');
        passwordOk= false;
    }else{
        passwordOk= true;
    }
    checkExportConfirm();
});

function checkExportConfirm() {
    if(passwordOk){
        $('#continue').removeClass('inactive')
    }else{
        $('#continue').addClass('inactive')
    }
}

function showToast(){
    $('.toast-wrap').show();
    setTimeout(() => {
        $('.toast-wrap').fadeOut('slow');
    }, 1000);
}
