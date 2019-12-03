var bg = chrome.extension.getBackgroundPage();
var count = 0;

initButtons();
bind();
var array;
var base = bg.acc.mnemonics.split(' ');
$('#confirm').on('click', function(){
    if($('#confirm').hasClass('inactive'))return;
    if(checkMatch($('#mnword').text().split(' '))){
        saveWallet2Local(bg.wallet, ()=>{
            setIsLogin(true);
            pageJump('home.html');
        });
    }else{
        $('#mnword').addClass('not-match');
        $('#mnwordwordwarn').append(
            '<p>- Mnemonic erro</p>'
        );
        $('#confirm').addClass('inactive')
    }

});

function initButtons(){
    array = bg.acc.mnemonics.split(' ');
    var data = randArr(array);
    const root = $('#buttonGroup');
    var output ='';
    data.map((value,index)=>{
        output += '<div class="mnemonic_item" id='+index+'>'+value+'</div>'
    });
    root.append(output)
}

function bind(){
    for(let i=0; i<12; i++){
        $('#'+i).on('click',()=>{
            $('#mnwordwordwarn').empty();
            $('#mnword').removeClass('not-match')
            if($('#'+i).hasClass('toggleOn')){
                if(count>0)count--;
                removeItem($('#'+i).text());
                $('#'+i).removeClass('toggleOn')
            }else{
                if(count<13)count++;
                $('#'+i).addClass('toggleOn')
                $('#mnword').text($('#mnword').text() +$('#'+i).text()+' ');
            }
            checkConfirm();
        })
    }
}

function removeItem(word){
    var arr = $('#mnword').text().split(' ');
    arr.splice(arr.length-1, 1);
    for(var i = 0; i < arr.length; i++) {
        if(arr[i] === word) {
            arr.splice(i, 1);
            break;
        }
    }
    var appendText = '';
    for(var j=0; j<arr.length; j++){
        appendText += arr[j] + ' '
    }
    $('#mnword').text(appendText)

}

function randArr(arr){
    for (var i = 0; i < arr.length; i++) {
        var iRand = parseInt(arr.length * Math.random());
        var temp = arr[i];
        arr[i] = arr[iRand];
        arr[iRand] = temp;
    }
    return arr;
}

function checkMatch(inputArray){
    var correct = true;
    for(let i=0; i<12; i++){
        if(inputArray[i] != base[i]){
            correct = false;
            break;
        }
    }
    return correct
}

function checkConfirm(){
    if(count === 12){
        $('#confirm').removeClass('inactive')
    }else{
        $('#confirm').addClass('inactive')
    }
}

