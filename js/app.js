const state = {
    currentCase: [],
    currentWin: null,
    winQueue: [],
    currentUser: null,

    stats:{
        opened:0,
        upgrades:0,
        deposited:0,
        withdrawn:0,
        withdrawnItems:0
    },

    authMode: "login",
    generatedCode: null,
    pendingUser: null,
    isSpinning: false,
    selectedCase: null,
    openAmount:1,
    bestDrop:null,
    balance: 1000
};

const $ = (selector) => document.querySelector(selector);

const ITEM_WIDTH = 160;

function createRoulettes(){

    const container =
    document.getElementById(
    "multiRouletteContainer"
    );

    if(!container) return;

    container.innerHTML = "";

    for(let i = 0; i < state.openAmount; i++){

        const roulette =
        document.createElement("div");

        roulette.className =
        "multi-roulette";

        roulette.innerHTML = `

        <div class="new-pointer"></div>

        <div class="multi-track"></div>

        `;

        container.appendChild(roulette);

        fillTrackPreview(
            roulette.querySelector(".multi-track")
        );
    }
}

function fillTrackPreview(track){

    track.innerHTML = "";

    for(let i = 0; i < 40; i++){

        const itemData =
        getRandomByChance(
        state.currentCase
        );

        const item =
        document.createElement("div");

        item.className = "item";

        item.innerHTML =
        itemData.emoji;

        item.style.border =
        `3px solid ${
        rarities[itemData.rarity].color
        }`;

        track.appendChild(item);
    }
}

/* OPEN */

function openCasePage(type) {
    const page = document.getElementById("openPage");
    page.style.display = "flex";

    state.currentCase = cases[type] || [];
    state.selectedCase = type;

    state.openAmount = 1;

    renderOpenAmounts();
    updateBestDrop();
    createRoulettes();
    renderCaseItems();
}

function renderOpenAmounts(){

    const container =
    document.getElementById(
    "openAmounts"
    );

    if(!container) return;

    container.innerHTML = "";

    const casePrice =
    casePrices[state.selectedCase];

    const max =
    Math.min(
        10,
        Math.floor(
        state.balance / casePrice
        )
    );

    if(max <= 0){
    container.innerHTML = `
    <div class="empty-inventory">
        Недостаточно средств
    </div>
    `;
    return;
}

    for(let i = 1; i <= max; i++){

        const btn =
        document.createElement("button");

        btn.className =
        "amount-btn";

        if(i === state.openAmount){

            btn.classList.add(
            "active"
            );
        }

        btn.innerText = i;

btn.onclick = () => {

state.openAmount = i;

renderOpenAmounts();

createRoulettes();

updateOpenPrice();

};

        container.appendChild(btn);
    }
}

/* CLOSE */

function closePage() {
    if (state.isSpinning) return;

    const page = document.getElementById("openPage");
    if (page) page.style.display = "none";

    const container = document.getElementById("multiRouletteContainer");
    if (container) container.innerHTML = "";
}

/* CHANCES */

function getRandomByChance(items){

    const rand =
    Math.random() * 100;

    let rarity;

    if(rand <= 3){

        rarity = "legendary";

    }else if(rand <= 8){

        rarity = "mythical";

    }else if(rand <= 25){

        rarity = "epic";

    }else if(rand <= 55){

        rarity = "rare";

    }else{

        rarity = "common";
    }

const filtered =
items.filter(
item => item.rarity === rarity
);

if(filtered.length === 0){

    return items[
        Math.floor(
        Math.random() * items.length
        )
    ];
}

return filtered[
Math.floor(
Math.random() *
filtered.length
)
];
}

function updateBestDrop(){

    if(
        !state.currentUser ||
        !state.currentUser.inventory ||
        state.currentUser.inventory.length === 0
    ){

        document.getElementById(
        "bestDropEmoji"
        ).innerText = "🏆";

        document.getElementById(
        "bestDropRarity"
        ).innerText = "Нет дропа";

        return;
    }

    const rarityOrder = {
        common:1,
        rare:2,
        epic:3,
        mythical:4,
        legendary:5
    };

const inventory = state.currentUser.inventory || [];

if (inventory.length === 0) {
    document.getElementById("bestDropEmoji").innerText = "🏆";
    document.getElementById("bestDropRarity").innerText = "Нет дропа";
    return;
}

const best = [...inventory].sort(
    (a,b)=> rarityOrder[b.rarity] - rarityOrder[a.rarity]
)[0];

    document.getElementById(
    "bestDropEmoji"
    ).innerText =
    best.emoji;

    document.getElementById(
    "bestDropRarity"
    ).innerText =
    best.rarity.toUpperCase();

    document.getElementById(
    "bestDropRarity"
    ).style.color =
    rarities[best.rarity].color;
}

/* TRACK */

function fillTrack(track, items){

    if(!track) return;

    track.innerHTML = "";

    for(let i = 0; i < 40; i++){

        const randomItem =
        getRandomByChance(items);

        const item =
        document.createElement("div");

        item.className = "item";

        item.innerHTML = randomItem.emoji;

        item.style.border =
        `3px solid ${
        rarities[randomItem.rarity].color
        }`;

        track.appendChild(item);
    }
}

function updateProfileUI(isLogged){

    document.getElementById(
    "loginBtn"
    ).style.display =
    isLogged ? "none" : "block";

    document.getElementById(
    "registerBtn"
    ).style.display =
    isLogged ? "none" : "block";

    document.getElementById(
    "profileBtn"
    ).style.display =
    isLogged ? "block" : "none";

    document.getElementById(
    "logoutBtn"
    ).style.display =
    isLogged ? "block" : "none";
}

function updateBalanceUI() {
    $("#balance").innerText = state.balance;

    const profileBalance = $("#profileBalance");
    if(profileBalance){
        profileBalance.innerText = state.balance;
    }
}

document.addEventListener("click", (e) => {

    const menus =
    document.querySelectorAll(".withdraw-hover");

    menus.forEach(menu => {

        const item =
        menu.closest(".inventory-item");

        if(item && !item.contains(e.target)){

            menu.style.display = "none";
        }

    });

});

function toggleTheme(){

    document.body.classList.toggle(
    "light-theme"
    );

    const toggle = document.getElementById("themeToggle");
if (toggle) {
    toggle.checked = document.body.classList.contains("light-theme");
}

localStorage.setItem(
"theme",
document.body.classList.contains("light-theme") ? "true" : "false"
);
}

function startUpgrade(){

    const success = Math.random() < 0.48;

    document.getElementById("upgradeResult")
        .style.display = "flex";

    if(success){

        document.getElementById("upgradeResultEmoji")
            .innerHTML = "👑";

        document.getElementById("upgradeResultText")
            .innerHTML = "АПГРЕЙД УСПЕШЕН";

    }else{

        document.getElementById("upgradeResultEmoji")
            .innerHTML = "💥";

        document.getElementById("upgradeResultText")
            .innerHTML = "НЕ УДАЛОСЬ";
    }
}

function closeUpgradeResult(){

    document.getElementById("upgradeResult")
        .style.display = "none";
}

function renderCaseItems(){

const container =
document.getElementById(
"caseItemsList"
);

if(!container) return;

container.innerHTML = "";

state.currentCase.forEach(item => {

const div =
document.createElement("div");

div.className =
"case-item-card";

div.innerHTML = `

<div
class="case-item-emoji"
style="
border:3px solid ${rarities[item.rarity].color};
">
${item.emoji}
</div>

<div
class="case-item-rarity"
style="
color:${rarities[item.rarity].color};
">
${item.rarity.toUpperCase()}
</div>

<div class="case-item-price">
${item.price}
</div>

`;

container.appendChild(div);

});
}

/* SPIN */

async function openCase(count = state.openAmount) {
    if (state.isSpinning) return;
    if (!state.selectedCase) return alert("Выберите кейс");
    if (!state.currentUser) return openAuth("login");

    const price = casePrices[state.selectedCase] * count;

    if (state.balance < price) {
        return alert("Недостаточно средств");
    }

    state.isSpinning = true;

    // списываем баланс
state.currentUser.balance -= price;
state.balance = state.currentUser.balance;

saveUsers();
updateBalanceUI();

    const wins = [];

    for (let i = 0; i < count; i++) {
        const item = getRandomByChance(state.currentCase);
        wins.push(item);

        if (!state.currentUser.inventory) {
            state.currentUser.inventory = [];
        }

        state.currentUser.inventory.push(item);

        addLiveDrop(state.currentUser.nickname, item);
    }

    // статистика
    state.stats.opened += count;
    saveStats();

    saveUsers();
    renderInventory();

    state.isSpinning = false;

    // показываем последний выигрыш
    state.winQueue = wins;
    showNextWin();
}

function openUpgradeMenu(){
    document.getElementById("upgradePage").style.display = "flex";
}

function closeUpgradeMenu(){
    document.getElementById("upgradePage").style.display = "none";
}

function openProfile(){

    if (!document.getElementById("profilePage")) return;

    if(!state.currentUser){
        alert("Сначала войдите");
        return;
    }

    const page = document.getElementById("profilePage");

    page.style.display = "flex";

    document.getElementById("profileName").innerText =
        state.currentUser.nickname;

    document.getElementById("profileBalance").innerText =
        state.balance;

    renderInventory();

    updateStatsUI();

    page.animate([
        { transform:"scale(0.9)", opacity:0 },
        { transform:"scale(1)", opacity:1 }
    ], {
        duration:200,
        easing:"ease-out"
    });
}

document.querySelectorAll(
".multi-open-btn"
).forEach(btn => {

btn.onclick = () => {

const count =
Number(btn.dataset.count);

state.openAmount = count;

document.querySelectorAll(
".multi-open-btn"
).forEach(b =>
b.classList.remove("active")
);

btn.classList.add("active");

renderOpenAmounts();

};

});

/* SEARCH */

function searchCases(){

const input =
document.getElementById(
"searchInput"
).value.toLowerCase();

const casesList =
document.querySelectorAll(".case");

casesList.forEach(card => {

const name =
card.querySelector(".case-name")
.innerText.toLowerCase();

if(name.includes(input)){

card.style.display = "flex";

}else{

card.style.display = "none";
}
});
}

const liveContainer =
document.getElementById("liveContainer");

const usernames = [

"Shadow","Blaze","Ghost","Venom","Orion",
"Razor","Hunter","Skylix","Toxic","Storm",
"Krypton","Night","Falcon","Inferno","Vortex",
"Alpha","Reaper","Nova","Flame","Matrix",
"Ordboy","Sniper","Dragon","Pixel","Cyber"

];

const allDrops = [];

Object.values(cases).forEach(caseItems => {
    caseItems.forEach(item => {
        allDrops.push(item);
    });
});

function createLiveDrop(username,item){

    if(!liveContainer) return;

    const div = document.createElement("div");

    div.className =
    `live-drop ${item.rarity}`;

    div.innerHTML = `

    <div class="live-emoji">
        ${item.emoji}
    </div>

    <div class="live-info">

        <div class="live-user">
            ${username}
        </div>

        <div class="live-rarity">
            ${item.rarity.toUpperCase()}
        </div>

    </div>

    `;

    liveContainer.prepend(div);

    if(liveContainer.children.length > 20){

        liveContainer.removeChild(
        liveContainer.lastChild
        );
    }
}

function randomLiveDrop(){

    const username =
    usernames[
        Math.floor(
        Math.random() * usernames.length
        )
    ];

    const item =
    allDrops[
        Math.floor(
        Math.random() * allDrops.length
        )
    ];

    createLiveDrop(username,item);
}

for(let i = 0; i < 20; i++){
    randomLiveDrop();
}

setInterval(randomLiveDrop,1000);

/* WIN */

function showWin(item){

    state.currentWin = item;

    const popup =
    document.getElementById(
    "winPopup"
    );

    document.getElementById(
    "winEmoji"
    ).innerText = item.emoji;

    document.getElementById(
    "winRarity"
    ).innerText =
    item.rarity.toUpperCase();

    document.getElementById(
    "winRarity"
    ).style.color =
    rarities[item.rarity].color;

    document.getElementById(
    "winPrice"
    ).innerText =
    item.price;

    popup.style.display = "flex";
}

function closeWin(){

document.getElementById(
"winPopup"
).style.display = "none";
}

function showNextWin(){

    if(state.winQueue.length <= 0){

        state.currentWin = null;

        return;
    }

    const nextItem =
    state.winQueue.shift();

    showWin(nextItem);
}

function takeWin(){

    closeWin();

    showNextWin();
}

function addLiveDrop(username,item){

const div =
document.createElement("div");

div.className =
`drop-item ${item.rarity}-drop`;

div.innerHTML = `

<div class="drop-emoji">
${item.emoji}
</div>

<div class="drop-info">

<div class="drop-user">
${username} выбил
</div>

<div class="drop-rarity">
${item.rarity.toUpperCase()}
</div>

</div>

`;

liveContainer.prepend(div);

if(liveContainer.children.length > 20){

liveContainer.removeChild(
liveContainer.lastChild
);

}
}

function renderInventory(){

const grid = document.getElementById("inventoryGrid");

if(!grid) return;

grid.innerHTML = "";

    if(
        !state.currentUser ||
        !state.currentUser.inventory ||
        state.currentUser.inventory.length === 0
    ){

        grid.innerHTML = `
        <div class="empty-inventory">
            Инвентарь пуст
        </div>
        `;

        return;
    }

    state.currentUser.inventory.forEach((item,index) => {

        const div = document.createElement("div");

        div.className = "inventory-item";

        div.innerHTML = `

        <div
        class="inventory-emoji"
        style="border:3px solid ${rarities[item.rarity].color};">
            ${item.emoji}
        </div>

        <div
        class="inventory-rarity"
        style="color:${rarities[item.rarity].color};">
            ${item.rarity.toUpperCase()}
        </div>

        <div class="inventory-bottom">

            <div class="inventory-price">
    ${item.price || "0₽"}
</div>

            <div class="inventory-actions">

                <button
                class="inventory-btn sell-btn"
                onclick="sellInventoryItem(${index})">
                    💰
                </button>

                <button
                class="inventory-btn menu-btn"
                onclick="toggleWithdraw(this, event)">
                    ⋯
                </button>

            </div>

        </div>

        <div class="withdraw-hover">
            <button class="withdraw-btn">
                Вывести
            </button>
        </div>

        `;

        grid.appendChild(div);
    });

    updateBestDrop();
}

function sellInventoryItem(index){

    if(!state.currentUser) return;

    const item = state.currentUser.inventory[index];
    if(!item) return;

    const value = Number((item.price || "0").replace(/[^\d]/g, ""));

state.balance += value;
state.currentUser.balance = state.balance;

    state.stats.withdrawnItems += 1; // 🔥 FIX

    saveStats();
    saveBalance();

    state.currentUser.inventory.splice(index, 1);

    updateBalanceUI();
    saveUsers();
    renderInventory();
    updateBestDrop();
}

function sellWin(){

    if(!state.currentWin) return;

    const value = Number(state.currentWin.price.replace(/[^\d]/g, ""));

    state.currentUser.balance += value;
    state.balance = state.currentUser.balance;

    syncBalance();
    saveUsers();

    closeWin();

    showNextWin();
}

function changeNickname(){

    const value =
    document.getElementById(
    "newNickname"
    ).value.trim();

    if(!value){

        alert("Введите ник");
        return;
    }

    if(value.length < 3){

        alert("Минимум 3 символа");
        return;
    }

    if(!state.currentUser) return;

    state.currentUser.nickname = value;

    saveUsers();

    $("#nickname").innerText = value;

    $("#profileName").innerText = value;

    alert("Ник изменен");
}

function changePassword(){

    const oldPassword =
    document.getElementById(
    "oldPassword"
    ).value.trim();

    const newPassword =
    document.getElementById(
    "newPasswordSettings"
    ).value.trim();

    if(!state.currentUser) return;

    if(oldPassword !== state.currentUser.password){

        alert("Старый пароль неверный");
        return;
    }

    if(newPassword.length < 8){

        alert("Минимум 8 символов");
        return;
    }

    state.currentUser.password =
    newPassword;

    saveUsers();

    alert("Пароль изменен");
}

function deleteAccount(){

    if(!confirm(
    "Удалить аккаунт?"
    )) return;

    let users =
    JSON.parse(
    localStorage.getItem("users")
    ) || [];

    users =
    users.filter(
    u => u.email !== state.currentUser.email
    );

    localStorage.setItem(
    "users",
    JSON.stringify(users)
    );

    logout();

    closeSettings();

    alert("Аккаунт удален");
}

function saveUsers(){

    if(!state.currentUser) return;

    let users = JSON.parse(
        localStorage.getItem("users")
    ) || [];

    const index = users.findIndex(
        u => u.email === state.currentUser.email
    );

    if(index !== -1){

    users[index] = {
    ...users[index],
    ...state.currentUser
};

}else{

    users.push(state.currentUser);
}

    localStorage.setItem(
        "users",
        JSON.stringify(users)
    );
}

/* AUTH */

function openAuth(mode){
    state.authMode = mode;

    document.getElementById("authPopup").style.display = "flex";

    document.getElementById("authTitle").innerText =
        mode === "login" ? "Вход" : "Регистрация";
}

function closeAuth(){

    document.getElementById(
    "authPopup"
    ).style.display = "none";
}

function sendVerificationCode(email){

    state.generatedCode =
    Math.floor(
    100000 + Math.random() * 900000
    );

    emailjs.send(
    "service_9okzrkg",
    "template_arn6e7i",
    {
        to_email: email,
        code: state.generatedCode
    })

    .then(() => {

        closeAuth();

        document.getElementById(
        "verifyPopup"
        ).style.display = "flex";
    });
}

function submitAuth(){

    const email =
    document.getElementById(
    "authEmail"
    ).value.trim();

    const password =
    document.getElementById(
    "authPassword"
    ).value.trim();

    if(!email || !password){

        alert("Заполните поля");
        return;
    }

    if(password.length < 8){

        alert("Минимум 8 символов");
        return;
    }

    let users =
    JSON.parse(
    localStorage.getItem("users")
    ) || [];

    /* LOGIN */

    if(state.authMode === "login"){

        const user =
        users.find(
        u =>
        u.email === email &&
        u.password === password
        );

        if(!user){

            alert("Неверные данные");
            return;
        }

        state.pendingUser = user;

        if(user.twofa){

        sendVerificationCode(email);
        return;
        }

    }else{

        /* REGISTER */

        const exists =
        users.find(
        u => u.email === email
        );

        if(exists){

            alert("Аккаунт уже существует");
            return;
        }

        state.pendingUser = {
            
            twofa:false,

            email,
            password,

            nickname:
            "user" +
            Math.floor(
            Math.random() * 1000
            ),

            balance:1000,

            inventory:[]
        };
    }

    state.generatedCode =
    Math.floor(
    100000 + Math.random() * 900000
    );

    emailjs.send(
    "service_9okzrkg",
    "template_arn6e7i",
    {
        to_email: email,
        code: state.generatedCode
    })

    .then(() => {

        closeAuth();

        document.getElementById(
        "verifyPopup"
        ).style.display = "flex";

        alert("Код отправлен");

    })

.catch((error) => {

    console.log(error);

    alert("Ошибка отправки email кода");

});
}

function openDeleteConfirm(){

    document.getElementById(
    "deleteConfirm"
    ).style.display = "flex";
}

function confirmDelete(){

    let users =
    JSON.parse(
    localStorage.getItem("users")
    ) || [];

    users = users.filter(
    u => u.email !== state.currentUser.email
    );

    localStorage.setItem(
    "users",
    JSON.stringify(users)
    );

    logout();

    location.reload();
}

let currentCasePrice = 100;

function selectAmount(amount, event){

    openAmount = amount;

    document.querySelectorAll(".amount-btn")
        .forEach(btn => btn.classList.remove("active"));

    if (event && event.target) {
        event.target.classList.add("active");
    }

    updateOpenPrice();
}

function syncBalance(){

    if(!state.currentUser) return;

    state.currentUser.balance =
    state.balance;

    saveUsers();
}

function updateOpenPrice(){

    const total =
    (casePrices[state.selectedCase] || 0)
    * state.openAmount;

    const el =
    document.querySelector(".btn-subtext");

    if(el){
        el.innerText = total + "₽";
    }
}

function togglePasswordSettings(){

    const content =
    document.getElementById(
    "passwordContent"
    );

    const arrow =
    document.getElementById(
    "passwordArrow"
    );

    content.classList.toggle("open");

    arrow.classList.toggle("rotate");
}

function nextAuthStep(){

    const email =
    document.getElementById(
    "authEmail"
    ).value.trim();

    const password =
    document.getElementById(
    "authPassword"
    ).value.trim();

    if(!email || !password){

        alert("Заполните поля");
        return;
    }

    if(password.length < 8){

        alert("Пароль минимум 8 символов");
        return;
    }

    submitAuth();
}

function loginUser(user){

    state.currentUser = user;

    state.balance = user.balance ?? 1000;
    state.currentUser.balance = state.balance;

    state.currentUser.inventory = state.currentUser.inventory || [];

    state.stats = user.stats ?? {
        opened:0,
        upgrades:0,
        deposited:0,
        withdrawn:0,
        withdrawnItems:0
    };

    updateStatsUI();

    /* LOAD 2FA */

    const toggle =
    document.getElementById("twofaToggle");

    if(toggle){
        toggle.checked = !!user.twofa;
    }

    localStorage.setItem(
        "currentUser",
        user.email
    );

    $("#nickname").innerText = user.nickname;

    updateBalanceUI();

    updateProfileUI(true);

    renderOpenAmounts();
}

function logout() {
    state.currentUser = null;
    state.selectedCase = null;
    state.currentCase = [];
    state.isSpinning = false;

    localStorage.removeItem("currentUser");

    $("#nickname").innerText = "Гость";

    state.balance = 1000;

    updateBalanceUI();
    updateProfileUI(false);

    const grid = $("#inventoryGrid");
    if (grid) grid.innerHTML = "";

    const profilePage = document.getElementById("profilePage");
    if (profilePage) profilePage.style.display = "none";

    state.stats = {
        opened: 0,
        upgrades: 0,
        deposited: 0,
        withdrawn: 0,
        withdrawnItems: 0
    };

    updateStatsUI();
}

function getUsers() {
    try {
        return JSON.parse(localStorage.getItem("users")) || [];
    } catch {
        return [];
    }
}

/* AUTO LOGIN */

window.addEventListener("load", () => {

    const email = localStorage.getItem("currentUser");

    if(email){
        const user = getUsers().find(u => u.email === email);
        if(user){
            loginUser(user);
            renderInventory();
        }
    }

    if(localStorage.getItem("theme") === "true"){
        document.body.classList.add("light-theme");
    }

    updateBalanceUI();
    updateProfileUI(false);
});

/* SAVE BALANCE */

function saveBalance(){

    if(!state.currentUser) return;

    state.currentUser.balance =
    state.balance;

    saveUsers();
}

function updateStatsUI(){

    const opened = $("#openedCases");
    const upgrades = $("#upgradeCount");
    const deposit = $("#depositAmount");
    const withdraw = $("#withdrawAmount");
    const items = $("#withdrawItems");

    if(opened) opened.innerText = state.stats.opened;
    if(upgrades) upgrades.innerText = state.stats.upgrades;
    if(deposit) deposit.innerText = state.stats.deposited + "₽";
    if(withdraw) withdraw.innerText = state.stats.withdrawn + "₽";
    if(items) items.innerText = state.stats.withdrawnItems;
}

function saveStats(){

    if(!state.currentUser) return;

    state.currentUser.stats = state.stats;

    saveUsers();
}

function closeProfile(){

    const page =
    document.getElementById("profilePage");

    if(page){
        page.style.display = "none";
    }
}

function confirmCode(){

    if(!state.pendingUser){
        alert("Ошибка авторизации");
        return;
    }

    const twofa = document.getElementById("twofaToggle");
state.pendingUser.twofa = twofa ? twofa.checked : false;

    const code =
    document.getElementById(
    "verifyCode"
    ).value.trim();

    if(Number(code) !== Number(state.generatedCode)){

        alert("Неверный код");
        return;
    }

    let users =
    JSON.parse(
    localStorage.getItem("users")
    ) || [];

    /* REGISTER */

    if(state.authMode === "register"){

        users.push(state.pendingUser);

        localStorage.setItem(
        "users",
        JSON.stringify(users)
        );
    }

    loginUser(state.pendingUser);

    state.pendingUser = null;

    saveUsers();

    updateOnline();

    document.getElementById(
    "verifyPopup"
    ).style.display = "none";

    saveBalance();
    saveStats();
    document.getElementById(
    "verifyCode"
    ).value = "";
}

updateBalanceUI();
updateProfileUI(false);

window.addEventListener("DOMContentLoaded", () => {
    console.log("Emoji Drops loaded");
});

const twofaToggle = document.getElementById("twofaToggle");

if (twofaToggle) {
    twofaToggle.addEventListener("change", () => {
        if (!state.currentUser) return;

        state.currentUser.twofa = twofaToggle.checked;
        saveUsers();
    });
}

console.log("Emoji Drops loaded");
