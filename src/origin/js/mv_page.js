$('#confrim').on('click', async function(){
    if($('#confrim').hasClass('inactive'))return;
    let menm = convertMnemonics($('#mnword').val());
    console.log('menm:'+menm);
    let walletStr = await getWalletFromLocalEx();
    let {wallet} = accountImportMnemonics(menm,passwordInput.val(),true, walletStr, $('#username').val());
    pageJump('home.html');
});
var reg = new RegExp(/[\s]/);
var userreg = new RegExp(/[A-Za-z0-9]/);

const passwordInput = $('#passwordInput');
const passwordInput1 = $('#passwordInput1');
const textarea = $('#mnword');
const userInput = $('#username');

var mnwordOk = false;
var passwordOk = false;
var passwordAgainOk = false;
var usernameOk = false;


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
    // if(!userreg.test(userInput)){
    //     warnTips+='<p>- No spaces, line feeds, or carriage returns</p>'
    // }
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

textarea.on('input propertychange',()=>{
    $('#mnwordwordwarn').empty();
    $('#mnword').removeClass('input_warning');
    var data = $('#mnword').val();
    if(!isValidMnemonics(data)){
        $('#mnwordwordwarn').append('<p>- mnemonic phrase error</p>');
        $('#mnword').addClass('input_warning');
        mnwordOk = false;
    }else{
        mnwordOk = true;
    }
    checkConfirm();
});

passwordInput.on('keypress', function(e) {
    if (e.which === 32)
        return false;
});

passwordInput.bind('copy paste', function (e) {
    e.preventDefault();
});

passwordInput.on('input propertychange',()=>{
    $('#passwordwarn').empty();
    $('#passwordInput').removeClass('input_warning');
    $('#passworderror').removeClass('showup');
    $('#passwordcorrect').removeClass('showup');
    var userInput = $('#passwordInput').val();
    var warnTips ='';
    if(userInput==='')return;
    if(userInput.length<6 || userInput.length>16){
        warnTips+='<p>- 6-16 characters</p>'
    }
    if(warnTips.length>0){
        $('#passwordwarn').append(warnTips);
        $('#passworderror').addClass('showup');
        $('#passwordInput').addClass('input_warning');
        passwordOk= false;
    }else{
        $('#passwordcorrect').addClass('showup');
        passwordOk= true;
    }
    checkMatch();
    checkConfirm();
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

passwordInput1.bind('copy paste', function (e) {
    e.preventDefault();
});

passwordInput1.on('input propertychange',()=>{
    $('#password1warn').empty();
    $('#passwordInput1').removeClass('input_warning');
    $('#password1error').removeClass('showup');
    $('#password1correct').removeClass('showup');
    var userInput = $('#passwordInput1').val();
    var warnTips ='';
    if(userInput==='')return;
    if(userInput !==$('#passwordInput').val()){
        warnTips += '<p>- The two passwords don\'t match</p>'
    }

    if(warnTips.length>0){
        $('#passwordInput1').addClass('input_warning');
        $('#password1warn').append(warnTips);
        $('#password1error').addClass('showup');
        passwordAgainOk = false;
    }else{
        $('#password1correct').addClass('showup');
        passwordAgainOk = true;
    }
    checkConfirm();
});

function clearAgain(){
    $('#passwordwarn1').empty();
    $('#passwordInput1').removeClass('input_warning');
    $('#passworderror1').removeClass('showup');
    $('#passwordcorrect1').removeClass('showup');
    passwordAgainOk = false;
    checkConfirm();
}

function checkMatch(){
    $('#password1warn').empty();
    if($('#passwordInput1').val().length>0){
        if($('#passwordInput').val() !== $('#passwordInput1').val()){
            $('#password1warn').append('<p>- The two passwords don\'t match</p>');
            $('#passwordInput1').addClass('input_warning');
            $('#password1correct').removeClass('showup');
            $('#password1error').addClass('showup');
            passwordAgainOk = false;
            checkConfirm();
        }else{
            $('#password1warn').empty();
            $('#passwordInput1').removeClass('input_warning');
            $('#password1error').removeClass('showup');
            $('#password1correct').addClass('showup');
            passwordAgainOk = true;
            checkConfirm();
        }
    }else{
        $('#password1warn').empty();
        $('#passwordInput1').removeClass('input_warning');
        $('#password1error').removeClass('showup');
        $('#password1correct').removeClass('showup');
        checkConfirm();
    }
}

function checkConfirm(){
    const cofirmBtn = $('#confrim');
    if(mnwordOk && passwordOk && passwordAgainOk && usernameOk){
        cofirmBtn.removeClass('inactive')
    }else{
        cofirmBtn.addClass('inactive')
    }
}

const returnBtn = $('.returnBtnCorner');
returnBtn.on('click', function(){
    var href = window.location.href;
    href = href.split('/');
    href = href[href.length-1];
    switch (href) {
        case 'mv.html':
            pageJump('settings.html');
            break;
        case 'pkv.html':
            pageJump('settings.html');
            break;
        case 'mv.html?':
            pageJump('login.html');
            break;
        case 'pkv.html?':
            pageJump('login.html');
            break;
    }
});

function checkInput(input){
    for(var i=0; i<input.length; i++){
        if(!userreg.test(input[i])){
            return false
        }
    }
    return true
}

async function submit(){
    if($('#confrim').hasClass('inactive'))return;
    let menm = convertMnemonics($('#mnword').val());
    console.log('menm:'+menm);
    let walletStr = await getWalletFromLocalEx();
    let {wallet} = accountImportMnemonics(menm,passwordInput.val(),true, walletStr, $('#username').val());
    pageJump('home.html');
}