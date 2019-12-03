var reg = new RegExp(/[\s]/);
var userreg = new RegExp(/[A-Za-z0-9]/);

const pkInput = $('#privatekey');
const passwordInput = $('#passwordInput');
const passwordInput1 = $('#passwordInput1');
const userInput = $('#username');

var pkOk = false;
var passwordOk = false;
var passwordAgainOk = false;
var usernameOk = false;

$('#confrim').on('click', async function(){
    if($('#confrim').hasClass('inactive'))return;
    let walletStr = await getWalletFromLocalEx();
    let {wallet} = accountImportPrivateKey($('#privatekey').val(), passwordInput.val() , walletStr, $('#username').val());
    pageJump('home.html');
});

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

pkInput.on('keypress', function(e) {
    if (e.which === 32)
        return false;
});
pkInput.on('input propertychange', ()=>{
    $('#pkwarn').empty();
    $('#privatekey').removeClass('input_warning');
    $('#pkerror').removeClass('showup');
    $('#pkcorrect').removeClass('showup');
    if(isValidPrivateKey($('#privatekey').val())){
        $('#pkcorrect').addClass('showup');
        pkOk = true;
    }else{
        pkOk = false;
        $('#pkerror').addClass('showup');
        $('#privatekey').addClass('input_warning');
        $('#pkwarn').append('<p>- Invalid private key</p>');
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
    $('#passwordwarn').empty();
    $('#passwordInput').removeClass('input_warning');
    $('#passworderror').removeClass('showup');
    $('#passwordcorrect').removeClass('showup');
    var userInput = $('#passwordInput').val();
    var warnTips ='';
    if(userInput.length<6 || userInput.length>16){
        warnTips+='<p>- 6-16 characters\n</p>'
    }
    if(warnTips.length>0){
        $('#passwordwarn').append(warnTips);
        $('#passwordInput').addClass('input_warning');
        $('#passworderror').addClass('showup');
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
    $('#passwordwarn1').empty();
    $('#passwordInput1').removeClass('input_warning');
    $('#passworderror1').removeClass('showup');
    $('#passwordcorrect1').removeClass('showup');
    var userInput = $('#passwordInput1').val();
    var warnTips ='';
    if(userInput !==$('#passwordInput').val()){
        warnTips += '<p>- The two passwords don\'t match</p>'
    }

    if(warnTips.length>0){
        $('#passwordwarn1').append(warnTips);
        $('#passwordInput1').addClass('input_warning');
        $('#passworderror1').addClass('showup');
        passwordAgainOk = false;
    }else{
        $('#passwordcorrect1').addClass('showup');
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

function checkConfirm(){
    const confirmBtn = $('#confrim');
    if(pkOk && passwordOk && passwordAgainOk && usernameOk){
        confirmBtn.removeClass('inactive')
    }else{
        confirmBtn.addClass('inactive')
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

function checkMatch(){
    $('#passwordwarn1').empty();
    if($('#passwordInput1').val().length>0){
        if($('#passwordInput').val() !== $('#passwordInput1').val()){
            $('#passwordwarn1').append('<p>- The two passwords don\'t match</p>');
            $('#passwordInput1').addClass('input_warning');
            $('#passworderror1').addClass('showup');
            passwordAgainOk = false;
            checkConfirm();
        }else{
            $('#passwordwarn1').empty();
            $('#passwordInput1').removeClass('input_warning');
            $('#passworderror1').removeClass('showup');
            $('#passwordcorrect1').addClass('showup');
            passwordAgainOk = true;
            checkConfirm();
        }
    }else{
        $('#passwordwarn1').empty();
        $('#passwordInput1').removeClass('input_warning');
        $('#passworderror1').removeClass('showup');
        $('#passwordcorrect1').removeClass('showup');
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
    if($('#confrim').hasClass('inactive'))return;
    let walletStr = await getWalletFromLocalEx();
    let {wallet} = accountImportPrivateKey($('#privatekey').val(), passwordInput.val() , walletStr, $('#username').val());
    pageJump('home.html');
}