

init(bg.tnxDetail)

function init(data){

    $('#amount').text(data.detail.transfers[0].amount);
    $('#from_address').text(data.detail.transfers[0].from_address);
    $('#to_address').text(data.detail.transfers[0].to_address);
    $('#tx_hash').text(data.tx_hash);
    $('#timestamp').text(transferLocalTime(data.tx_time));
    $('#height').text(data.block_height)
}