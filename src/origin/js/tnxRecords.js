var total = 0;
var currentPage = 1;
var loading = false;
var allItems = 0;
var coverBarTime;

async function fetchFistPage(){
    let allCache = await _getAssets(bg.wallet_addr); //getAssets()也可以
    let localTNXS = allCache.tnxs;
    if(localTNXS == undefined) localTNXS = [];
    refreshList(localTNXS);

    loading = true;

    getTransactionsByAddr(bg.wallet_addr,currentPage,10).then(ret=>{
        allItems = ret.result.total;
        let serverTNXS = ret.result.records;
        saveAssets({addr:bg.wallet_addr, tnxs:serverTNXS});
        let {newTNXS, removeTNXS} = compareTNXS(localTNXS,serverTNXS);
        pretendList(newTNXS);
        console.log('removeTNXS:'+JSON.stringify(removeTNXS));
        removeSelectItem(removeTNXS);
        loading = false;

        if(serverTNXS.length ==0 && localTNXS.length == 0){
            $('.no-data').removeClass('item-hide')
        }
    }).catch(err=>{
        loading = false;
        $('.toast-wrap').show();
        setTimeout(() => {
            $('.toast-wrap').fadeOut('slow');
        }, 1000);
        if(localTNXS.length == 0){
            $('.no-data').removeClass('item-hide')
        }
    })
}

function getAndRenderData(cb){
    getTransactionsByAddr(bg.wallet_addr,currentPage,10).then(ret=>{
        var list = ret.result.records;
        var text = '';
        allItems = ret.result.total;
        if(ret.result.total ==0){
            $('.no-data').removeClass('item-hide')
        }

        if(list.length>0){
            total += list.length;

            list.map((value)=>{

                text += renderItem(value)

            });
            $('#scroll-field').append(text);
            bindButton();
            if(cb){
                cb(list);
            }
        }
        loading = false;
    }).catch(err=>{
        $('.toast-wrap').show();
        setTimeout(() => {
            $('.toast-wrap').fadeOut('slow');
        }, 1000);
        loading = false;
    })
}

function setIcon(transfer){
    const type = getTransferType(transfer);
    if(type === 1){
        return '<div class="send-icon"></div>'
    }else if (type ===2){
        return '<div class="get-icon"></div>'
    }else if (type ===3){
        return '<div class="sc-icon"></div>'
    }
}

function bindButton(){
    $('.tnxItem').off('click');
    $('.tnxItem').on('click', function(){
        getTransactionInfo($(this).data('hash')).then(ret=>{
            initDetail(ret.result);
            openDetail();
        })
    })


}

$('#close-panel').on('click', function(){
    closeDetail();
});

$('.overlay').on('click', function(){
    closeDetail();
});

function getAmount(transfer){
    const type = getTransferType(transfer);

    if(type === 1){
        if(transfer.amount == 0){
            return '<p class="red">0</p>'
        }else{
            return '<p class="red">-'+transfer.amount+'</p>'
        }
    }else if (type ===2){
        if(transfer.amount == 0){
            return '<p class="green">0</p>'
        }else{
            return '<p class="green">+'+transfer.amount+'</p>'
        }
    }else if (type ===3){
        return '<p class="black">--</p>'
    }
}

function bindCopyButtons(){
    var clipboard1 = new ClipboardJS('#copy_from');
    var clipboard2 = new ClipboardJS('#copy_to');
    var clipboard3 = new ClipboardJS('#copy_hash');
    var clipboard4 = new ClipboardJS('#copy_block');
    clipboard1.on('success', function(e){
        $('.toast-wrap1').show();
        setTimeout(() => {
            $('.toast-wrap1').fadeOut('slow');
        }, 1000);
    });
    clipboard2.on('success', function(e){
        $('.toast-wrap1').show();
        setTimeout(() => {
            $('.toast-wrap1').fadeOut('slow');
        }, 1000);
    });
    clipboard3.on('success', function(e){
        $('.toast-wrap1').show();
        setTimeout(() => {
            $('.toast-wrap1').fadeOut('slow');
        }, 1000);
    });
    clipboard4.on('success', function(e){
        $('.toast-wrap1').show();
        setTimeout(() => {
            $('.toast-wrap1').fadeOut('slow');
        }, 1000);
    });

}


function initDetail(data){

    if(data.detail.transfers && data.detail.transfers[0]){
        $('#amount').text(renderAmount(data.detail.transfers[0]));
        $('#from_address').text(data.detail.transfers[0].from_address);
        $('#to_address').text(data.detail.transfers[0].to_address);
    }else{
        $('#amount').text('--');
        $('#from_address').text(bg.wallet_addr);
        $('#to_address').text('--');
    }

    $('#tx_hash').text(trim(data.tx_hash));
    $('#hash_4_copy').text(data.tx_hash);
    $('#timestamp').text(transferLocalTime(data.tx_time));
    $('#height').text(data.block_height)
}

function renderAmount(transfer){
    const type = getTransferType(transfer);
    if(type === 1){
        if(transfer.amount == 0){
            return 0
        }else{
            return '-' + transfer.amount
        }
    }else if (type === 2){
        if(transfer.amount == 0){
            return 0
        }else{
            return '+' + transfer.amount
        }
    }else if (type === 3) {
        return '--';
    }
}

/**
 * type1: send, type2: recv, type3: contract
 * @param {*} transfer 
 */
function getTransferType (transfer) {
    if(transfer == undefined || transfer.from_address == undefined ){
        return 3;
    }

    if(transfer.from_address === bg.wallet_addr){
        return 1
    }else{
        return 2
    }
}

function setAddress(transfer){
    const type = getTransferType(transfer);
    if(type === 1){
        return trim6(transfer.to_address)
    }else if (type ===2){
        return trim6(transfer.from_address)
    }else if (type ===3){
        return "--"
    }
}

fetchFistPage();
bindCopyButtons();
scroll();
function scroll(){
    $('#scroll-field').scroll(function () {
        displayBar();
        //clientHeight是网页在浏览器中的可视高度，

        //scrollTop滚动条到顶部的垂直高度
        var scrollTop = $('#scroll-field').scrollTop();
        //通过判断滚动条的top位置与可视网页之和与整个网页的高度是否相等来决定是否加载内容；
        dataExtend(scrollTop);

    });
}

function dataExtend(scrollTop){
    var limit = (total * 50) - (500);
    console.log('loading: ', loading);
    console.log('total: ',total);
    console.log('allItems: ',allItems);
    if(total>=allItems)return;
    if(scrollTop >= limit){
        if(loading === true)return;
        loading = true;
        currentPage+=1;
        getAndRenderData();
    }
}

function displayBar(){
    clearTimeout(coverBarTime);
    $('#cover-bar').addClass('show-cover-bar');
    coverBarTime = setTimeout(()=>{
        $('#cover-bar').removeClass('show-cover-bar')
    },1500)
}

function openDetail(){
    const overlay = $('.overlay');
    const password_panel = $('#account_manager');
    overlay.removeClass('item-hide');
    overlay.addClass('fadeIn animated');
    password_panel.removeClass('item-hide');
    password_panel.addClass("fadeInLeft animated");
}

function closeDetail(){
    const overlay = $('.overlay');
    const password_panel = $('#account_manager');
    overlay.addClass('fadeOut animated');
    password_panel.addClass("fadeOutLeft animated");
    setTimeout(function(){
        password_panel.removeClass('fadeInLeft fadeOutLeft animated');
        password_panel.addClass('item-hide');
        overlay.removeClass('fadeIn fadeOut animated');
        overlay.addClass('item-hide');
    },500)
}

function renderItem(value){
    return '<div class="tnxItem" data-hash="'+value.tx_hash+'">\n' +
        setIcon(value.transfers[0]) +
        '            <div class="tnx-word">\n' +
        '                <p class="address">'+setAddress(value.transfers[0])+'</p>\n' +
        '                <p class="timestamp">'+transferLocalTime(value.tx_time)+'</p>\n' +
        '            </div>\n' +
        '            <div class="amount">\n' +
        getAmount(value.transfers[0]) +
        '            </div>\n' +
        '        </div>\n' +
        '        <div class="list_divider"></div>'
}

/**
 * 去除列表尾部的项目
 * @param {num} 去掉的个数
 */
function removeLisItems(num){
    const scroll = $('#scroll-field');
    var data = scroll.find('.tnxItem');
    var lines = scroll.find('.list_divider');
    let index = data.length;
    let times = num;
    while(times>0){
        index--;
        times--;
        $(data[index]).remove();
        $(lines[index]).remove();
    }
}

/**
 * 刷新整个列表
 * @param {list} 新的列表
 */
function refreshList(list){
    var text = '';
    const scroll = $('#scroll-field');
    scroll.empty();
    if(list.length>0){
        total = list.length;

        list.map((value)=>{

            text += renderItem(value)

        });
        scroll.append(text);
        bindButton();
    }
}
/**
 * 向页面头部添加项目
 * @param {list} 添加的列表
 */
function pretendList(list){
    var text = '';
    const scroll = $('#scroll-field');
    if(list.length>0){
        total += list.length;

        list.map((value)=>{

            text += renderItem(value)

        });
        scroll.prepend(text);
        bindButton();
    }
}


function removeSelectItem(list){
    var deleteHash = [];
    list.map((value)=>{
        deleteHash.push(value.tx_hash)
    });
    console.log(deleteHash);
    var data = $('#scroll-field').find('.tnxItem');
    var lines = $('#scroll-field').find('.list_divider');

    for(let i=0; i<data.length; i++){

        if(deleteHash.indexOf($(data[i]).data('hash'))>=0){

            $(data[i]).remove();
            $(lines[i]).remove();
        }
    }
}