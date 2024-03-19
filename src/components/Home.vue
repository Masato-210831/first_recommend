<template>
  <div class="hello">
    <h2>
      <router-link to="/recommend">Go to recommend</router-link>
    </h2>
    <h1 v-if="!uid">Hello User!!</h1>
    <h1 v-if="uid">Hello {{ uid }}!!</h1>
    <div v-if="!isAuthenticated">
      <p>Email</p>
      <input type="text" v-model="email">
      <p>Password</p>
      <input type="password" v-model="password">
      <br>
      <button type="button" @click="login">Login</button>
    </div>

    <br><br>
    <div v-if="isAuthenticated">
      <button type="button" @click="logout">Logout</button>
    </div>
  </div>
</template>

<script>
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
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

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data: () => ({
    email: "",
    password:"",
    isAuthenticated:false,
    uid:false
  }),
  methods: {
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
