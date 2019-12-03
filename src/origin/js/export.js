var clipboard = new ClipboardJS('#copy_pk');

getWalletFromLocal((res)=>{
    var data = bg.exportAccount;
    let ret = getPrivateKey(res,data.password,data.address);
    $('#input_pk').text(ret);
})


clipboard.on('success', function(e){
    $('.toast-wrap').show();
    setTimeout(() => {
        $('.toast-wrap').fadeOut('slow');
    }, 1000);
});

$('#continue').on('click',()=>{
    bg.exportAccount = null;
    pageJump('home.html')
});




