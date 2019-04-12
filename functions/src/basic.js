exports.getMsg = function(query){
    if (query.name !== undefined) {
    let param = query.name
        msg = "Hello " + param
    } else {
        msg = "Hello World"
    }
    return msg
}
