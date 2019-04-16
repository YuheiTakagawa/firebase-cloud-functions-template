const basic = require('./src/basic')

const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()

const db = admin.firestore()
const settings = {timestampsInSnapshots: true}
db.settings(settings)

const storage = admin.storage()

exports.hello = functions.https.onRequest((request, response) => {
    switch (request.method) {
        case 'GET':
            msg = basic.getMsg(request.query)
            response.status(200).send(msg)
        break
        case 'POST':
            msg = basic.getMsg(request.body)
            response.status(200).send(msg)
        break
        default:
            response.status(400).send({ error: 'Something blew up!'})
        break
    }
})


exports.latest = functions.https.onRequest((req, response) => {
    const query = db.collection('messages')
                    .orderBy('timestamp', 'desc')
                    .limit(1)

    basic.getFromQuery(query)
    .then(data => {
        console.log(data)        
        response.status(200).send(data)
    })
})

exports.addMsg = functions.https.onRequest((req, response) => {
    switch (req.method) {
        case 'POST':
            basic.saveQuery(db.collection('messages'), {
                // name: "test",
                text: req.body.name,
                // profilePicUrl: "",
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            })
            msg = basic.getMsg(req.body)
            response.status(200).send(msg)
        break
        default:
            response.status(400).send({ error: 'Something blew up!'})
        break
    }
})

// reqでユーザ名を指定
// 指定したユーザ名が流したtextを取得する
// ただし、リクエストのユーザ名はASCIIコードではなくパーセントエンコーディング(%がついた16進数)
exports.testWhere = functions.https.onRequest((req, response) => {
    switch(req.method) {
        case 'GET': 
            if (req.query.name === undefined) {
                response.status(500).send({ error: 'Invalid parameters'})
                return 
            }
            console.log(req.query.name)
            const query = db.collection('messages')
                            .where("name", "==", req.query.name)
            basic.getFromQuery(query)
            .then(data => {
                console.log(data)        
                response.status(200).send(data)
            })
        break
        default: 
            response.status(400).send({ error: 'Something blew up!'})
        break
    }
})

exports.addWelcomeMessages = functions.auth.user().onCreate(async (user) => {
    console.log('A new user signed in for the first time.')
    const fullName = user.displayName || 'Anonumous'

    await admin.firestore().collection('messages').add({
        name: 'Forebase Bot',
        profilePicUrl: '/images/firebase-logo.png',
        text: `${fullName} signed in for the first time! Welcome!`,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    })
    console.log('Welcome message written to datadabse.')
})

// CloudFunctionsではstorageの参照の作り方が違う
// storage.bucket().file()で作成する
// storage.ref().child()とはまた違う
// リクエストパラメータにはpathとtextを入れる
exports.saveFile = functions.https.onRequest((req, response) => {
    switch(req.method){
        case 'POST':
            if (req.body.path === undefined || req.body.text === undefined){
                response.status(500).send({ error: 'Invalid params'})
                return 
            }
            storageRef = storage.bucket()
            basic.saveStorage(storageRef, req.body.path, req.body.text)
            .then(data => {
                response.status(200).send(data)
            }).then(() => {
                basic.getStorage(storageRef, req.body.path)
            })
        break
        default:
            response.status(400).send({ error: 'Something blew up!'})
        break
    }
})

// 外部APIを使う場合、無料枠のhostingだとアクセスできない
// ローカルなら利用できる
const fetch = require('node-fetch')
exports.accessAPI = functions.https.onRequest((req, response) => {
    fetch('https://jsonplaceholder.typicode.com/todos/1')
    .then(res => res.json())
    .then(json => {
        console.log(json)
        response.status(200).send(json)
   })
})
