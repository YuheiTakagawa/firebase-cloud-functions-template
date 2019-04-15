exports.getMsg = function(query){
    if (query.name !== undefined) {
    let param = query.name
        msg = "Hello " + param
    } else {
        msg = "Hello World"
    }
    return msg
}

// queryを使ってFirestoreからデータを取得する
// 返り値はデータを配列として返すPromise
exports.getFromQuery = function(query) {
    const datas = []
    return query.get()
    .then(snapshot => {
        snapshot.forEach(doc => {
            datas.push(doc.data().text)
        })
        return datas
    })
}
