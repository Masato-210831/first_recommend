<template>
  <div class="hello">
    <h2>
      <router-link to="/">Go Home</router-link>
    </h2>
    <h3>requestData : {{ requestData }}</h3>
    <button type="button" @click="request">Request</button>
    <br>
    <h1 v-if="!uid">Hello Recommend items!!</h1>
    <h1 v-if="uid">Recommend {{ uid }}!!</h1>
    <h3>text</h3>
    <h3>{{ text }}</h3>
    <input v-model="text">
    <br>
    <button type="button" @click="save">Save</button>
    <div v-if="!isAuthenticated">
      <p>Email</p>
      <input type="text" v-model="email">
      <p>Password</p>
      <input type="password" v-model="password">
      <br>
      <button type="button" @click="login">Login</button>
    </div>
    <br><br>
    <div v-for="item in items" :key="item.id">
      <li>text: {{ item.text }}</li>
      <li>date: {{ item.dateStr }}</li>
      <li>DocId: {{ item.id }}</li>
      <button type="button" @click="deleteData(item.id)">Delete</button>
      <button type="button" @click="recommend(item.text)">Recommend</button>
      <button type="button" @click="predict(item.text)">Predict</button>
      <br><br>
    </div>
    <h2>Recommend</h2>
    <div v-for="recommend in recommends" :key="recommend.id">
      <p>{{ recommend }}</p>
    </div>
    <h2>Predict</h2>
    <div v-for="pred, predkey in predicts" :key="predkey">
      <p>{{ predkey }}: {{ pred }}</p>
    </div>
    <br>
    <div v-if="isAuthenticated">
      <button type="button" @click="logout">Logout</button>
    </div>
  </div>
</template>



<script>
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
import { 
  getFirestore, collection, setDoc, doc, onSnapshot, query, orderBy, deleteDoc
 } from "firebase/firestore"
 import axios from "axios"


const firebaseConfig = {
  apiKey: process.env.VUE_APP_apiKey,
  authDomain: process.env.VUE_APP_authDomain,
  projectId: process.env.VUE_APP_projectId,
  storageBucket: process.env.VUE_APP_storageBucket,
  messagingSenderId: process.env.VUE_APP_messagingSenderId,
  appId: process.env.VUE_APP_appId,
  measurementId: process.env.VUE_APP_measurementId
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const  db = getFirestore()

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data: () => ({
    text:"",
    email: "",
    password:"",
    isAuthenticated:false,
    uid:false,
    items:[],
    idToken: "",
    requestData: "",
    recommends:[],
    predicts:{},
  }),
  created(){ // コンポーネントのライフサイクルフック
    this.isAuthenticated = !!auth.currentUser
    if (this.isAuthenticated){
      auth.currentUser.getIdToken(true).then(token =>{
        this.idToken = token
      })
      this.listItems()
    }
  },
  methods: {
    recommend(text){
      // const url = "http://localhost:8000/recommend_items"
      const url = "https://recommend-jow3riwioq-uc.a.run.app/recommend_items"
      const headers =  {
        "Authorization": `Bearer ${ this.idToken }`
      }
      const configData = {
        method: "GET",
        url: url,
        headers: headers,
        params: {title: text}
      }
      axios(configData)
      .then(res => {
        this.recommends = res.data.result
      })
    },
    predict(text){
      // const url = "http://localhost:8000/predict"
      const url = "https://recommend-jow3riwioq-uc.a.run.app/predict"
      const headers =  {
        "Authorization": `Bearer ${ this.idToken }`
      }
      const configData = {
        method: "GET",
        url: url,
        headers: headers,
        params: {title: text}
      }
      axios(configData)
      .then(res => {
        this.predicts = res.data.result
      })
    },
    request(){
    // corsによるリクエストができるか確認用のメソッド
    // const url = "http://192.168.68.52:8000/"
      const url = "https://helloworld-jow3riwioq-uc.a.run.app/"
      const headers =  {
        "Authorization": `Bearer ${ this.idToken }`
      }
      const configData = {
        method: "GET",
        url: url,
        headers: headers,
        params: {text: this.text}
      }
      axios(configData)
      .then(res => {
        this.requestData = res.data.result
      })
    },
    deleteData(docId){
      deleteDoc(doc(db, "recommend", docId))
    },
    // dbから取得しデータの時刻の表現設定の関数
    toDateTime(seconds){
      const t = new Date(Date.UTC(1970, 0, 1))
      t.setUTCSeconds(seconds)
      return t
    },
    listItems(){
      const q = query(collection(db, "recommend"), orderBy("date", "desc")) //dbのrecommendコレクションのpath
      onSnapshot(q, (snapShot) => { // onSnapshotでdbとリアルタイム連動
        this.items = []
        snapShot.forEach((doc) => { //dbオブジェクトの各データを取り出す
          const data = doc.data()
          data.id = doc.id
          data.dateStr = this.toDateTime(data.date.seconds).toLocaleString() // 上記で作成した関数適用
          this.items.push(data)
        })
      })
    }, 
    save(){
      const data = { text:this.text, date:new Date() }
      const path = "recommend"
      const docPath = doc(collection(db, path)) // firebaseのdbのrecommendへのパス参照を設定, データを保存したい場所名(ドキュメント？)をpathに設定
      setDoc(docPath, data) // firebaseのdb：recommendにdataを保存
      .catch(err => {
        console.log("err:", err)
      })
      this.text = ""
    },
    login() {
      signInWithEmailAndPassword(
        auth,
        this.email,
        this.password,
      ).then(user => {
        this.uid = user.user.uid
        console.log("uid:", user.user.uid)
        console.log("email:", user.user.email)
        console.log("login_auth:", !!auth.currentUser)
        this.isAuthenticated = !!auth.currentUser
      })
    },
    logout(){
      auth.signOut()
      .then(() => {
        console.log("logout_auth:", !!auth.currentUser)
        this.isAuthenticated = !!auth.currentUser
        this.uid = false
      })
    }
  }
}
</script>
