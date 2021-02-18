console.log("starting app");

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyBU8VcEBjyXIezoODSMZhIk1jHsnqU3Tv0",
  authDomain: "chat-a82a2.firebaseapp.com",
  databaseURL: "https://chat-a82a2-default-rtdb.firebaseio.com",
  projectId: "chat-a82a2",
  storageBucket: "chat-a82a2.appspot.com",
  messagingSenderId: "810216466940",
  appId: "1:810216466940:web:df53fd2beb132e3c092a79",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const database = firebase.database();
const database_messages = database.ref("Messages");
// get data
database_messages.on("value", gotData, errData);

const message_history = document.getElementById("msg_history");
const msg_received_audio = new Audio("./audio/msg_received.mp3");

const input_username = document.getElementById("input_user");
const input_msg = document.getElementById("input_msg");

let usersassignedcolors = new Object();
let numberclicklogo = 0;

//get username from webstorage
input_username.value = localStorage.getItem("user");

function gotData(data) {
  console.log("Got Data from Database");

  // clear msg history
  message_history.innerHTML = "";

  var all_msgs = data.val();

  if (all_msgs == null) {
    console.log("void msgs at database");
    return false;
  }

  var msg_keys = Object.keys(all_msgs);

  var last_msg = null;
  msg_keys.forEach((key) => {
    var msg_obj = all_msgs[key];
    last_msg = msg_obj;

    if (usersassignedcolors[msg_obj.user] == undefined) {
      console.log(msg_obj.user);
      usersassignedcolors[msg_obj.user] = getRandomColor();
    }
    var color = usersassignedcolors[msg_obj.user];

    var msg_time = msg_obj.datetime.split("T")[1];
    msg_time = msg_time.split(":")[0] + ":" + msg_time.split(":")[1];

    var mymessage = false;
    if (input_username.value == msg_obj.user) {
      mymessage = true;
    }

    addmessagetointerface(msg_time, msg_obj.user, msg_obj.msg, mymessage, color);
  });

  //check if was this user that sent the message
  if (last_msg.user != input_username.value) {
    msg_received_audio.play();
    console.log(" notify user");
  }
}

function errData(err) {
  console.log("error getting data from database");
  console.log(err);

  swal("ERROR!", "Error getting data from database", "error");
}

function sendMsg() {
  console.log("Send Message");

  var username = input_username.value;
  var message = input_msg.value;

  if (username == "" || message == "") {
    console.log("Fill the Username and Message Fields");
    swal("Fill Everything!", "You must fill the username and message fields", "warning");
    return false;
  }

  // store username
  localStorage.setItem("user", username);

  var obj_msg = new Object();
  obj_msg.user = username;
  obj_msg.msg = message;
  obj_msg.datetime = new Date().toISOString();

  database_messages.push(obj_msg).then((input_msg.value = ""));
}

function addmessagetointerface(time, user, msg, ismymessage, color) {
  var msg_container = document.createElement("div");
  msg_container.className = "msg_container";

  if (ismymessage) {
    msg_container.className = "msg_container_mymessage";
  } else {
    msg_container.style.backgroundColor = color;
  }

  var msg_time = document.createElement("p");
  msg_time.className = "msg_time";
  msg_time.innerText = time;

  var msg_user = document.createElement("p");
  msg_user.className = "msg_user";
  msg_user.innerText = user;

  var msg_text = document.createElement("p");
  msg_text.className = "msg_text";
  msg_text.innerText = msg;

  msg_container.appendChild(msg_time);
  msg_container.appendChild(msg_user);
  msg_container.appendChild(msg_text);

  message_history.appendChild(msg_container);

  message_history.scrollTo(0, message_history.scrollHeight);
}

function getRandomColor() {
  var color = "rgba(";
  color += String(Math.floor(Math.random() * 255));
  color += ",";
  color += String(Math.floor(Math.random() * 255));
  color += ",";
  color += String(Math.floor(Math.random() * 255));
  color += ",";
  color += ".3)";

  console.log(color);
  return color;
}

function clicklogo() {
  numberclicklogo += 1;
  if ((numberclicklogo += 3)) {
    swal({
      title: "Delete All Messages",
      text: "Once deleted, you will not be able to recover the messages!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        database_messages.remove();
        swal("Poof! Messages Deleted!", {
          icon: "success",
        });
      } else {
        swal("Messages keep!");
      }
    });
  }
}
