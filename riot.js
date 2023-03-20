window.onload = function () {
    console.log("App started");
    rpc.init();
}

class Champion {
    constructor(champion, games, wins) {
        this.champion = champion;
        this.games = games;
        this.wins = wins;
    }
}

class RiotApiConnect {
    constructor(name, riotApiKey) {
        this.name = name;
        this.riotApiKey = riotApiKey;
    }

    init(){
        document.getElementById("saveButton").addEventListener("click", 
            (e) => this.getName(e));
    }

    getName(e) {    
        this.name = document.getElementById("summonerName").value;
        this.riotApiKey = document.getElementById("riotApiKey").value;

        if(this.name === ""){
            console.log("Brak nazwy");
            return;
        }
        e.preventDefault();
        this.apiMenu();
    }

    apiMenu() {
        this.summonerByNameUrl = `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${this.name}?api_key=${this.riotApiKey}`;
        this.summonerInfoByName();
    }
    // pobranie z api informacji o puuid gracza
    async summonerInfoByName() {
        const response = await fetch(this.summonerByNameUrl);
        const data = await response.json();
        this.summoner = data;
        this.matchesByPuuidUrl = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${this.summoner.puuid}/ids?type=ranked&start=0&count=5&api_key=${this.riotApiKey}`
        this.matchesListByPuuid();
        console.log("First fetch works");
    }
    // pobranie z api id listy ostatnich meczy poprzez puuid gracza
    async matchesListByPuuid() {
        const response = await fetch(this.matchesByPuuidUrl);
        const data = await response.json();
        this.matchesListIds = data;
        this.matchUrl = `https://europe.api.riotgames.com/lol/match/v5/matches/${this.matchesListIds[0]}?api_key=${this.riotApiKey}`
        this.matchById();
        console.log("Matches list by id works", this.matchesListIds);
    }
    // pobranie z api informacji na temat konkretnego meczu poprzez id meczu
    async matchById() {
        const response = await fetch(this.matchUrl);
        const data = await response.json();
        this.match = data;
        console.log("Match by id works", this.match);
        this.champion = this.match.info.participants[6].championName;
        this.summonerId = this.match.metadata.participants.indexOf(this.summoner.puuid)
        console.log("Champion name works: ", this.champion);
        console.log("summonerIdInMatch works: ", this.summonerId);
        ui.addInfoToTable();
        this.matchesIdsResponse();
        this.matchesByIds();
    }
    // pobranie z api informacji na temat ostatnich meczy poprzez id meczy
    async matchesByIds() {
        const response = await Promise.all(this.matchesArray.map(url => fetch(url)));
        const data = await Promise.all(response.map(res => res.json()));
        this.danebane = data;
        this.champ = {
            champion: this.champion,
            games: 0,
            wins: 0
        }
        console.log("MultiFetch works", this.danebane);
        this.danebane.forEach((el, index) => {
            index = el.metadata.participants.indexOf(this.summoner.puuid);
            console.log("INDEX WYNOSI: ", index);
            const champTemp = el.info.participants[6].championName;
            console.log("CHAMP NAME: ", champTemp);

        });
    }
    // stworzenie tablicy z zapytaniami do api z id meczy pobranych z funkcji matchesListByPuuid
    matchesIdsResponse() {
        this.matchesArray = [];
        this.matchesListIds.forEach(element => {
            const matchesUrls = `https://europe.api.riotgames.com/lol/match/v5/matches/${element}?api_key=${this.riotApiKey}`
            this.matchesArray.push(matchesUrls);
        });
        console.log("Fetch array works: ", this.matchesArray);
    }

}

class Ui {

    addInfoToTable() {
        console.log("Player info: ", rpc.summoner);
        // console.log("Player puuid: ", this.playerData.puuid);

        const tbody = document.querySelector("#dataTable tbody");
        const tr = document.createElement("tr");
        tr.classList.add("bg-white", "border-b", "dark:bg-gray-900", "dark:border-gray-700");
        tr.innerHTML = `
            <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"> ${rpc.summoner.name} </th>
            <td> ${rpc.summoner.puuid} </td>
            <td> ${rpc.champion} </td>
        `;


        tbody.appendChild(tr);
    }
}

const rpc = new RiotApiConnect();
const ui = new Ui();
