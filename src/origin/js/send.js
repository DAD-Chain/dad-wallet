var max = 0;
var wallet;
var amountOk = false;
var addressOk = false;
var passwordOk = false;
var passwordInput = $('#password');
var reg = new RegExp(/[\s]/);



$('#cancel').on('click',()=>{
    pageJump('home.html')
});

renderAddr();
getWalletFromLocal((res)=>{
    if(res){
        wallet = res;
        $('#continue').on('click', function(){
            submit()
        });
    }else{

    }
});


function submit(){
    if($('#continue').hasClass('inactive'))return;

    //验证密码是否正确
    let ret = accountSignIn($('#password').val(), wallet);
    if(ret.error !== 0){
        $('#password').addClass('input_warning');
        $('#passwordwarn').append('<p>- Password error</p>');
        $('#passworderror').addClass('showup');
        passwordOk= false;
        checkConfirm();
        return;
    }
    $('.loading').addClass('showup');
    $('#close-panel').addClass('inactive ');
    $('#continue').addClass('inactive');

    //密码正确，可以转账
    transfer(wallet, $('#address').val(),$('#password').val(), $('.amount').val())
        .then(ret=>{
            setTimeout(()=>{
                $('.loading').removeClass('showup');



                if(ret.error === 0){
                    //发送成功
                    $('.toast-wrap').text('Transaction successfully');
                    $('.toast-wrap').show();
                    setTimeout(() => {
                        // saveAssets(max - $('.amount').val());
                        pageJump('home.html');
                    }, 2000);
                }else if(ret.error === -1 && ret.result.includes('balance insufficient')){
                    $('#continue').removeClass('inactive');
                    $('#close-panel').removeClass('inactive');
                    $('.toast-wrap').text('balance insufficient');
                    $('.toast-wrap').show();
                    setTimeout(() => {
                        $('.toast-wrap').fadeOut('slow');
                    },2000);
                    //发送失败：余额不足
                }else {
                    $('#continue').removeClass('inactive');
                    $('#close-panel').removeClass('inactive');
                    $('.toast-wrap').text('Transaction failed');
                    $('.toast-wrap').show();
                    setTimeout(() => {
                        $('.toast-wrap').fadeOut('slow');
                    },2000);
                    //发送失败：其他错误
                }
            },2000)

        })
        .catch(err=>{
            setTimeout(()=>{
                $('#continue').removeClass('inactive');
                $('.loading').removeClass('showup');
                $('#close-panel').removeClass('inactive');
                $('.toast-wrap').text(err);
                $('.toast-wrap').show();
                setTimeout(() => {
                    $('.toast-wrap').fadeOut('slow');
                },2000);
            },1000);
        });
}


function renderAddr(){
    var data = window.location.search.replace('?','');
    data = data.split('&');
    max = data[0];
    $('.title-pk').text(data[1]);
    $('#max_button').removeClass('inactive');
    $('#max_button').on('click', ()=>{
        $('#amount_warn').empty();
        $('.amount').removeClass('input_warning');
        $('#amounterror').removeClass('showup');
        $('.amount').val(max);
        amountOk = true;
        checkConfirm();
    });
}

$('#confirm').on('click', function(){
    if($('#confirm').hasClass('inactive'))return;
    const overlay = $('.overlay');
    const password_panel = $('.password_panel');
    overlay.removeClass('item-hide');
    overlay.addClass('fadeIn animated');
    password_panel.removeClass('item-hide');
    password_panel.addClass("fadeInUp animated");
    setTimeout(()=>{
        passwordInput.focus();
    },500)
});

$('#close-panel').on('click', function(){
    if($('#close-panel').hasClass('inactive'))return;
    const overlay = $('.overlay');
    const password_panel = $('.password_panel');
    overlay.addClass('fadeOut animated');
    password_panel.addClass("fadeOutDown animated");
    setTimeout(function(){
        $('#password').val('')
        $('#passwordwarn').empty();
        $('#password').removeClass('input_warning');
        $('#passworderror').removeClass('showup');
        passwordOk = false;
        checkSendConfirm();
        password_panel.removeClass('fadeInUp fadeOutDown animated');
        password_panel.addClass('item-hide');
        overlay.removeClass('fadeIn fadeOut animated');
        overlay.addClass('item-hide');
    },500)
});

$('.overlay').on('click', function(){
    if($('#close-panel').hasClass('inactive'))return;
    const overlay = $('.overlay');
    const password_panel = $('.password_panel');
    overlay.addClass('fadeOut animated');
    password_panel.addClass("fadeOutDown animated");
    setTimeout(function(){
        $('#password').val('')
        $('#passwordwarn').empty();
        $('#password').removeClass('input_warning');
        $('#passworderror').removeClass('showup');
        passwordOk = false;
        checkSendConfirm();
        password_panel.removeClass('fadeInUp fadeOutDown animated');
        password_panel.addClass('item-hide');
        overlay.removeClass('fadeIn fadeOut animated');
        overlay.addClass('item-hide');
    },500)
});


$('.amount').on('keypress', function(e) {
    if (e.which === 32)
        return false;
});

$('.amount').keyup(()=>{
    if(event.key === 'Enter'){
        if($('#confirm').hasClass('inactive'))return;
        const overlay = $('.overlay');
        const password_panel = $('.password_panel');
        overlay.removeClass('item-hide');
        overlay.addClass('fadeIn animated');
        password_panel.removeClass('item-hide');
        password_panel.addClass("fadeInUp animated");
        setTimeout(()=>{
            passwordInput.focus();
        },500)
    }
});

$('.amount').on('input propertychange',()=>{
    // console.log($('.amount').val())
    // console.log(isNaN($('.amount').val()));
    if(isNaN($('.amount').val())){
        $('.amount').val($('.amount').val().substr(0,$('.amount').val().length-1))
    }
    if($('.amount').val().length>1 && $('.amount').val().length<3 && $('.amount').val()[0] === '0' && $('.amount').val()!=='0.'){
        $('.amount').val($('.amount').val()[1])
    }

    // $('.amount').val(parseFloat($('.amount').val()));
    $('#amount_warn').empty();
    $('.amount').removeClass('input_warning');
    $('#amounterror').removeClass('showup');
    var input = $('.amount').val();
    console.log(input*1)
    if((input*1)>(max*1)){
        $('#amount_warn').append('<p>- Not enough assets</p>');
        $('.amount').addClass('input_warning');
        amountOk = false;
        $('#amounterror').addClass('showup');
        checkConfirm();
    }else{
        if(input<0){
            amountOk = false;
            $('#amounterror').addClass('showup');
            $('.amount').addClass('input_warning');
            $('#amount_warn').append('<p>- Incorrect format</p>');
            checkConfirm();
        }else{
            if(input.length ===0){
                amountOk = false;

                checkConfirm();
            }else{
                amountOk = true;
                checkConfirm();
            }
        }
    }
});

$('#address').on('keypress', function(e) {
    if (e.which === 32)
        return false;
});
$('#address').on('input propertychange', ()=>{
    $('#addresswarn').empty();
    $('#address').removeClass('input_warning');
    $('#addresscorrect').removeClass('showup');
    $('#addresserror').removeClass('showup');
    var input = $('#address').val();
    if(input.length===0){
        addressOk = false;
        checkConfirm();
    }else{
        if(!isValidAddress(input) || $('#address').val() == $('.title-pk').text()){
            addressOk = false;
            checkConfirm();
            $('#addresserror').addClass('showup');
            $('#address').addClass('input_warning');
            $('#addresswarn').append('<p>- invalid address</p>');

        }else{
            addressOk = true;
            checkConfirm();

            $('#addresscorrect').addClass('showup');
        }
    }
});
passwordInput.keyup(()=>{
    if(event.key === 'Enter'){
        submit();
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
    checkSendConfirm();
});

function checkSendConfirm(){
    if(passwordOk){
        $('#continue').removeClass('inactive')
    }else{
        $('#continue').addClass('inactive')
    }
}

function checkConfirm(){
    if(addressOk && amountOk){
        $('#confirm').removeClass('inactive')
    }else{
        $('#confirm').addClass('inactive')
    }
}

function setInputFilter(textbox, inputFilter) {
    ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function(event) {
        textbox.addEventListener(event, function() {
            if (inputFilter(this.value)) {
                this.oldValue = this.value;
                this.oldSelectionStart = this.selectionStart;
                this.oldSelectionEnd = this.selectionEnd;
            } else if (this.hasOwnProperty("oldValue")) {
                this.value = this.oldValue;
                this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
            }
        });
    });
}

setInputFilter(document.getElementById("Text2"), function(value) {
    return /^\d*\.?\d*$/.test(value);
});