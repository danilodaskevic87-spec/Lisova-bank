const sb = supabase.createClient(
  "https://mefzopeenhfdqfatbjaq.supabase.co",
  "sb_publishable_LU94dUJoW2jwZJ9WIdfsMw_lEnMQobx"
);

let userId=null,balance=0,receiver=null;

/* 🔊 звуки */
const ok=new Audio("ok.mp3"), err=new Audio("err.mp3");

/* 🌗 тема */
function toggleTheme(){
  document.documentElement.classList.toggle("light");
  localStorage.setItem("theme",
    document.documentElement.classList.contains("light")?"light":"dark");
}
document.addEventListener("DOMContentLoaded",()=>{
  if(localStorage.getItem("theme")==="light")
    document.documentElement.classList.add("light");
});

/* 🔐 логін */
async function login(){
  const {data,error}=await sb.auth.signInWithPassword({
    email:email.value,password:password.value
  });
  if(error){err.play();alert("Помилка");return;}
  loadUserFromIndex(data.user);
}
async function loadUserFromIndex(u){
  loginBox.classList.add("hidden");panel.classList.remove("hidden");
  const {data}=await sb.from("bank")
    .select("name,idd,balance").eq("user_id",u.id).single();
  userId=u.id;balance=data.balance;
  name.innerText=data.name;idd.innerText=data.idd;
  balanceSpan.innerText=balance;
}
async function logout(){await sb.auth.signOut();location.reload();}

/* 🔁 баланс */
async function loadSessionAndBalance(){
  const {data:{user}}=await sb.auth.getUser();
  if(!user){location.href="index.html";return;}
  userId=user.id;
  const {data}=await sb.from("bank")
    .select("balance").eq("user_id",userId).single();
  balance=data.balance;
  document.querySelectorAll("#balance").forEach(e=>e.innerText=balance);
}

/* 🛎 покупка */
async function buy(price){
  if(balance<price){err.play();alert("Недостатньо");return;}
  balance-=price;
  await sb.from("bank").update({balance}).eq("user_id",userId);
  document.querySelectorAll("#balance").forEach(e=>e.innerText=balance);
  ok.play();
}

/* 🔍 пошук по idd */
async function findUser(){
  const iddVal=Number(toIdd.value);
  const {data,error}=await sb.from("bank")
    .select("user_id,name,balance").eq("idd",iddVal).single();
  if(error){err.play();alert("Не знайдено");return;}
  receiver=data;toName.innerText=data.name;
  confirmBox.classList.remove("hidden");
}

/* 🔐 PIN + підтвердження */
async function confirmTransfer(){
  const sum=Number(amount.value);
  const pinVal=pin.value;
  if(sum>balance){err.play();alert("Недостатньо");return;}

  const {data}=await sb.from("bank")
    .select("pin_hash").eq("user_id",userId).single();
  if(pinVal!==data.pin_hash){err.play();alert("PIN");return;}

  await sb.from("bank").update({balance:balance-sum}).eq("user_id",userId);
  await sb.from("bank").update({balance:receiver.balance+sum})
    .eq("user_id",receiver.user_id);

  ok.play();alert("Готово");location.href="index.html";
}
