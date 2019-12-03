var bg = chrome.extension.getBackgroundPage();

registerWallet();

$('#continue').on('click', function(){
    pageJump('mwv.html');
});

var clipboard = new ClipboardJS('#copy_pk');
clipboard.on('success', function(e){
    $('.toast-wrap').show();
    setTimeout(() => {
        $('.toast-wrap').fadeOut('slow');
    }, 1000);
});

function registerWallet(){
    if(bg.acc){
        let acc =  bg.acc;
        renderPK(acc.wif);
        renderMw(acc.mnemonics)
    }else{
        pageJump('login.html')
    }
}

function renderPK(data){
    $('#input_pk').text(data)
}

function renderMw(data){
    var input = data.split(' ');
    $('#mnemonic_words').empty();
    var output = '';
    input.map(function(value){
        output += '<div class="mnemonic_item">'+value+'</div>'
    })
    $('#mnemonic_words').append(output)

}

