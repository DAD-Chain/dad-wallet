var reg = new RegExp(/[\s]/);
var passwordOk = false;
var selectAccount;
var coverBarTime

init();
$('#continue').on('click', function(){
    submit();
});

$('#password').on('keypress', function(e) {
    if (e.which === 32)
        return false;
});

$('#password').bind('copy paste', function (e) {
    e.preventDefault();
});

$('#password').keyup(()=>{
    if(event.key === 'Enter'){
        submit();
    }
});

$('#password').on('input propertychange',()=>{
    $('#passwordwarn').empty();
    $('#password').removeClass('input_warning');
    $('#passworderror').removeClass('showup');
    $('#passwordcorrect').removeClass('showup');
    var userInput = $('#password').val();
    var warnTips ='';
    if(userInput==='')return;
    if(userInput.length<6 || userInput.length>16){
        warnTips+='<p>- 6-16 characters</p>'
    }
    if(warnTips.length>0){
        $('#passwordwarn').append(warnTips);
        $('#passworderror').addClass('showup');
        $('#password').addClass('input_warning');
        passwordOk= false;
    }else{
        $('#passwordcorrect').addClass('showup');
        passwordOk= true;
    }
    checkConfirm();
});

$('#selectButton').on('click', ()=>{
    const overlay = $('.overlay');
    const password_panel = $('#account_panel');
    overlay.removeClass('item-hide');
    overlay.addClass('fadeIn animated');
    password_panel.removeClass('item-hide');
    password_panel.addClass("fadeInUp animated");
});

$('#close-panel').on('click', ()=>{
    close();
});
$('.overlay').on('click', ()=>{
    close();
});
$('#scroll-field').scroll(()=>{
    clearTimeout(coverBarTime);
    $('#cover-bar').addClass('show-cover-bar');
    coverBarTime = setTimeout(()=>{
        $('#cover-bar').removeClass('show-cover-bar')
    },1500)
});


function checkConfirm(){
    const cofirmBtn = $('#continue');
    if(passwordOk){
        cofirmBtn.removeClass('inactive')
    }else{
        cofirmBtn.addClass('inactive')
    }
}

function submit(){
    if($('#continue').hasClass('inactive'))return;
    if(passwordOk){
        getWalletFromLocal((res)=>{
            if(!res){
                $('#passwordwarn').append('<p>- Password error</p>');
                $('#passwordcorrect').removeClass('showup');
                $('#passworderror').addClass('showup');
                $('#password').addClass('input_warning');
                passwordOk= false;
                checkConfirm();
            }else{
                let ret = accountSignIn($('#password').val(), res, selectAccount);
                console.log(ret)
                if(ret.error === 0){
                    setDefaultAccount(selectAccount, res);
                    pageJump('home.html');
                }else{
                    $('#passwordwarn').append('<p>- Password error</p>');
                    $('#passwordcorrect').removeClass('showup');
                    $('#passworderror').addClass('showup');
                    $('#password').addClass('input_warning');
                    passwordOk= false;
                    checkConfirm();
                }
            }
        })
    }
}

function bindButton(){
    $('.account_item').on('click',function (){
        var address = $(this).data('address');
        var label = $(this).data('toggle');
        if(address != selectAccount){
            $('#passwordwarn').empty();
            $('#password').removeClass('input_warning');
            $('#passworderror').removeClass('showup');
            $('#passwordcorrect').removeClass('showup');
            $('#password').val('');
        }
        selectAccount = address;
        $('#selectButton').text(label);
        close();
    })
}

function close(){
    const overlay = $('.overlay');
    const password_panel = $('#account_panel');
    overlay.addClass('fadeOut animated');
    password_panel.addClass("fadeOutDown animated");
    setTimeout(function(){
        password_panel.removeClass('fadeInUp fadeOutDown animated');
        password_panel.addClass('item-hide');
        overlay.removeClass('fadeIn fadeOut animated');
        overlay.addClass('item-hide');
    },500)
}


async function init() {
    var text ='';
    let res =  await getAccountsFromLocal();
    let array = res.accounts;
    array.map((value, index)=>{
        text+='<div class="divider"></div>\n';
        text+='<div class="account_item" data-toggle="'+value.label+'" data-address="'+value.address+'">\n' +
            '            <p>'+value.label+'</p>\n' +
            '        </div>';
        if(value.address === res.default){
            $('#selectButton').text(value.label);
            selectAccount = value.address;
        }
    });

    $('#scroll-field').append(text)
    bindButton();
}

setTimeout(() => {
    $.getScript("../lib/dad-sdk.js");
    $.getScript("../lib/ontology-crypto.js");
}, 0.5*1000);

