var coverBarTime;
var selectAddress;
var wallet;

bindButtons();
getWalletFromLocal((res)=>{
    var data = JSON.parse(res);
    wallet = res;
    initMultiAccount(data);
});
bindInput();


$('#scroll-field').scroll(()=>{
    clearTimeout(coverBarTime);
    $('#cover-bar').addClass('show-cover-bar');
    coverBarTime = setTimeout(()=>{
        $('#cover-bar').removeClass('show-cover-bar')
    },1500)
});

function initMultiAccount(data){
    var text = '';
    data.accounts.map((value)=>{
        text += '<div class="account_item" data-address="'+value.address+'">\n' +
            '            <div class="nickname">'+value.label+'</div>\n' +
            '            <div class="address">'+trim(value.address)+'</div>\n' +
            '        </div>'
    });
    $('#scroll-field').append(text);
    bindButtons();
}

function bindButtons(){
    $('.account_item').on('click', function(){
        selectAddress = $(this).data('address');
        openPasswordPanel();
    });

    $('#continue').on('click', ()=>{
        jumpToExport();
    });

    $('#close-panel1').on('click', ()=>{
        closePasswordPanel();
    });
    $('.overlay').on('click', ()=>{
        closePasswordPanel();
    })
}

function openPasswordPanel(){
    const overlay = $('.overlay');
    const password_panel = $('#export-panel');
    overlay.removeClass('item-hide');
    overlay.addClass('fadeIn animated');
    password_panel.removeClass('item-hide');
    password_panel.addClass("fadeInUp animated");
}

function closePasswordPanel(){
    const overlay = $('.overlay');
    const password_panel = $('#export-panel');
    overlay.addClass('fadeOut animated');
    password_panel.addClass("fadeOutDown animated");
    setTimeout(function(){
        password_panel.removeClass('fadeInUp fadeOutDown animated');
        password_panel.addClass('item-hide');
        overlay.removeClass('fadeIn fadeOut animated');
        overlay.addClass('item-hide');
        $('#password').val('');
        $('#passwordwarn').empty();
        $('#password').removeClass('input_warning');
        $('#passworderror').removeClass('showup');
        passwordOk = false;
        checkExportConfirm();
    },500)
}

function checkExportConfirm() {
    if(passwordOk){
        $('#continue').removeClass('inactive')
    }else{
        $('#continue').addClass('inactive')
    }
}

function jumpToExport(){
    if($('#continue').hasClass('inactive'))return;
    let ret = accountSignIn($('#password').val(), wallet, selectAddress);
    if(ret.error !== 0){
        $('#password').addClass('input_warning');
        $('#passwordwarn').append('<p>- Password error</p>');
        $('#passworderror').addClass('showup');
        passwordOk= false;
        checkExportConfirm();
        return;
    }
    bg.exportAccount = {
        password:$('#password').val(),
        address:selectAddress
    };

    pageJump('export.html');
}

function bindInput(){
    var passwordInput = $('#password');
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
}

