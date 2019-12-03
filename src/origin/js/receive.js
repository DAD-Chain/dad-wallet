getWalletFromLocal((res)=>{
    var data = JSON.parse(res);
    $('#input_pk').text(data.defaultAccountAddress);
    $("#qrcode").qrcode({
        width: 128,
        height: 128,
        render: 'canvas',
        text: data.defaultAccountAddress
    });
})

var clipboard = new ClipboardJS('#copy_pk');
clipboard.on('success', function(e){
    $('.toast-wrap').show();
    setTimeout(() => {
        $('.toast-wrap').fadeOut('slow');
    }, 1000);
});




