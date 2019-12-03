var bg = chrome.extension.getBackgroundPage();
bg.acc ='';
$('#continue').on('click', function(){
    submit()
});

var userreg = new RegExp(/[A-Za-z0-9]/);
var reg = new RegExp(/[\s]/);
const userInput = $('#username');
const passwordInput = $('#password');
const passwordInput1 = $('#password1');
var usernameOk = false;
var passwordOk = false;
var passwordAgainOk = false;

userInput.on('keypress', function(e) {
    if (e.which === 32)
        return false;
});

userInput.on('input propertychange',()=>{
    $('#usernamewarn').empty();
    $('#username').removeClass('input_warning');
    $('#usernameerror').removeClass('showup');
    $('#usernamecorrect').removeClass('showup');
    var userInput = $('#username').val();
    var warnTips ='';
    if(userInput==='')return;
    if(userInput.length<4 || !checkInput(userInput)){
        warnTips+='<p>- At least four letters or numbers</p>'
    }
    if(warnTips.length>0){
        $('#usernamewarn').append(warnTips);
        $('#username').addClass('input_warning');
        $('#usernameerror').addClass('showup');
        usernameOk = false;
    }else{
        usernameOk = true;
        $('#usernamecorrect').addClass('showup');
    }
    checkConfirm();
});


passwordInput.bind('copy paste', function (e) {
    e.preventDefault();
});

passwordInput.on('keypress', function(e) {
    if (e.which === 32)
        return false;
});

passwordInput.on('input propertychange',()=>{
    $('#password').removeClass('input_warning');
    $('#passwordwarn').empty();
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
    checkMatch();
    checkConfirm();
});

passwordInput1.bind('copy paste', function (e) {
    e.preventDefault();
});

passwordInput1.keyup(()=>{
    if(event.key === 'Enter'){
        submit();
    }
});

passwordInput1.on('keypress', function(e) {
    if (e.which === 32)
        return false;
});

passwordInput1.on('input propertychange',()=>{
    $('#password1warn').empty();
    $('#password1').removeClass('input_warning');
    $('#password1error').removeClass('showup');
    $('#password1correct').removeClass('showup');
    var userInput = $('#password1').val();
    var warnTips ='';
    if(userInput==='')return;
    if(userInput !==$('#password').val()){
        warnTips += '<p>- The two passwords don\'t match</p>'
    }
    if(warnTips.length>0){
        checkMatch()
    }else{
        $('#password1correct').addClass('showup');
        passwordAgainOk = true;
    }
    checkConfirm();
});


function clearAgain(){
    $('#password1warn').empty();
    $('#password1').removeClass('input_warning');
    $('#password1').val('');
    $('#password1error').removeClass('showup');
    $('#password1correct').removeClass('showup');
    passwordAgainOk = false;
    checkConfirm();
}

function checkMatch(){
    $('#password1warn').empty();
    if($('#password1').val().length>0){
        if($('#password').val() !== $('#password1').val()){
            $('#password1warn').append('<p>- The two passwords don\'t match</p>');
            $('#password1').addClass('input_warning');
            $('#password1error').addClass('showup');
            passwordAgainOk = false;
            checkConfirm();
        }else{
            $('#password1warn').empty();
            $('#password1').removeClass('input_warning');
            $('#password1error').removeClass('showup');
            $('#password1correct').addClass('showup');
            passwordAgainOk = true;
            checkConfirm();
        }
    }else{
        $('#password1warn').empty();
        $('#password1').removeClass('input_warning');
        $('#password1error').removeClass('showup');
        $('#password1correct').removeClass('showup');
    }
}

function checkConfirm(){
    const cofirmBtn = $('#continue');
    if(usernameOk && passwordOk && passwordAgainOk){
        cofirmBtn.removeClass('inactive')
    }else{
        cofirmBtn.addClass('inactive')
    }
}

function checkInput(input){
    for(var i=0; i<input.length; i++){
        if(!userreg.test(input[i])){
            return false
        }
    }
    return true
}

async function submit(){
    if($('#continue').hasClass('inactive'))return;
    if(usernameOk && passwordOk && passwordAgainOk){
        let walletStr = await getWalletFromLocalEx();
        let ret =  accountSignUp($('#password').val(), $('#username').val(),true, walletStr);
        bg.acc = ret;
        bg.wallet = ret.wallet;
        bg.wallet_str = JSON.stringify(ret.wallet);
        pageJump('mapk.html')
    }
}

const returnBtn = $('.returnBtnCorner');
returnBtn.on('click', function(){
    if(!isFromSettings())
    {
        pageJump('login.html');
    }else{
        pageJump('settings.html');
    }
});

