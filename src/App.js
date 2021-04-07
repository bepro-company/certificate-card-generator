import React from "react";
import firebase from "firebase";
import './App.css';
import Main from "./Main"

const firebaseConfig = {

};

firebase.initializeApp(firebaseConfig);

function App() {
  return (
    <div className="App">
      <Main/>
    </div>
  );
}

export default App;
