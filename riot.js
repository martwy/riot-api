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
        this.champions = [];
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
        this.getData();
    }

    apiMenu() {
        // this.summonerByNameUrl = `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${this.name}?api_key=${this.riotApiKey}`;
        // this.summonerInfoByName();
    }
    // pobranie z api informacji o puuid gracza
    async getData() {
        const summonerByNameUrl = `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${this.name}?api_key=${this.riotApiKey}`;
        let response = await fetch(summonerByNameUrl);
        let data = await response.json();
        // this.summoner = data;
        const summonerPuuid = data.puuid;
        const matchesByPuuidUrl = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${data.puuid}/ids?type=ranked&start=0&count=19&api_key=${this.riotApiKey}`
        // this.matchesListByPuuid();
        console.log("First fetch works", data);

        response = await fetch(matchesByPuuidUrl);
        data = await response.json();
        // this.matchesListIds = data;
        const matchUrl = `https://europe.api.riotgames.com/lol/match/v5/matches/${data[0]}?api_key=${this.riotApiKey}`
        // this.matchById();

        console.log("Matches list by id works", data);

        const matchesArray = [];
        data.forEach(element => {
            const matchesUrls = `https://europe.api.riotgames.com/lol/match/v5/matches/${element}?api_key=${this.riotApiKey}`
            matchesArray.push(matchesUrls);
        });
        console.log("Fetch array works: ", matchesArray);

        response = await Promise.all(matchesArray.map(url => fetch(url)));
        data = await Promise.all(response.map(res => res.json()));;
        console.log("MultiFetch works", data);
        // let games = 0;
        // let win = 0;
        // const champ1 = new Champion("JarvanIV", 0, 0);
        // const champ2 = new Champion("Mundo", 2, 1);
        // this.champions.push(champ1);
        // this.champions.push(champ2)
        // console.log(this.champions);
        // console.log(champ1);

        // console.log(this.champions.find(obj => obj["champion"])?.["champion"]);
        // this.champions.forEach((el, index) => {
        //     // console.log(el.champion, index);
        //     if(el.champion === "JarvanIV"){
        //         console.log('exists');
        //     } else {
        //         console.log('not exist');
        //     }
        // });

        // console.log(this.champions.some(el => el.champion === "Nunu"));
        // console.log(this.siem1 = this.champions.find(el => el.champion === "JarvanIV"));
        // console.log(this.siem1);




        data.forEach((el, index) => {
            index = el.metadata.participants.indexOf(summonerPuuid);
            const champTemp = el.info.participants[index].championName;
            const found = this.champions.find(el => el.champion === champTemp);
            const winFlag = el.info.participants[index].win;
            if(typeof found !== "undefined"){
                found.games++;
                if(winFlag) found.wins++;
            } else {
                this.champions.push(new Champion(champTemp, 1, winFlag ? 1 : 0));
            }
        });

        console.log(this.champions);
        ui.addInfoToTable();
    }

    
    // pobranie z api id listy ostatnich meczy poprzez puuid gracza
    // async matchesListByPuuid() {
    //     const response = await fetch(this.matchesByPuuidUrl);
    //     const data = await response.json();
    //     this.matchesListIds = data;
    //     this.matchUrl = `https://europe.api.riotgames.com/lol/match/v5/matches/${this.matchesListIds[0]}?api_key=${this.riotApiKey}`
    //     // this.matchById();

    //     console.log("Matches list by id works", this.matchesListIds);
        
    //     const response = await fetch(this.matchUrl);

    //     const data = await response.json();
    //     this.match = data;
    //     console.log("Match by id works", this.match);
    //     this.champion = this.match.info.participants[6].championName;
    //     this.summonerId = this.match.metadata.participants.indexOf(this.summoner.puuid)
    //     console.log("Champion name works: ", this.champion);
    //     console.log("summonerIdInMatch works: ", this.summonerId);
    //     ui.addInfoToTable();
    //     this.matchesIdsResponse();
    //     this.matchesByIds();
    // }
    // pobranie z api informacji na temat konkretnego meczu poprzez id meczu
    // async matchById() {
    //     const response = await fetch(this.matchUrl);
    //     const data = await response.json();
    //     this.match = data;
    //     console.log("Match by id works", this.match);
    //     this.champion = this.match.info.participants[6].championName;
    //     this.summonerId = this.match.metadata.participants.indexOf(this.summoner.puuid)
    //     console.log("Champion name works: ", this.champion);
    //     console.log("summonerIdInMatch works: ", this.summonerId);
    //     ui.addInfoToTable();
    //     this.matchesIdsResponse();
    //     this.matchesByIds();
    // }
    // // pobranie z api informacji na temat ostatnich meczy poprzez id meczy
    // async matchesByIds() {
    //     const response = await Promise.all(this.matchesArray.map(url => fetch(url)));
    //     const data = await Promise.all(response.map(res => res.json()));
    //     this.danebane = data;
    //     this.champ = {
    //         champion: this.champion,
    //         games: 0,
    //         wins: 0
    //     }
    //     console.log("MultiFetch works", this.danebane);
    //     this.danebane.forEach((el, index) => {
    //         index = el.metadata.participants.indexOf(this.summoner.puuid);
    //         console.log("INDEX WYNOSI: ", index);
    //         const champTemp = el.info.participants[6].championName;
    //         console.log("CHAMP NAME: ", champTemp);

    //     });
    // }
    // // stworzenie tablicy z zapytaniami do api z id meczy pobranych z funkcji matchesListByPuuid
    // matchesIdsResponse() {
    //     this.matchesArray = [];
    //     this.matchesListIds.forEach(element => {
    //         const matchesUrls = `https://europe.api.riotgames.com/lol/match/v5/matches/${element}?api_key=${this.riotApiKey}`
    //         this.matchesArray.push(matchesUrls);
    //     });
    //     console.log("Fetch array works: ", this.matchesArray);
    // }

}

class Ui {

    // Shows information in table
    addInfoToTable() {
        const tbody = document.querySelector("#dataTable tbody");
        rpc.champions.forEach(el => {
            // const winRatio = el.wins / el.games;
            const tr = document.createElement("tr");
            tr.classList.add("bg-white", "border-b", "dark:bg-gray-900", "dark:border-gray-700");
            tr.innerHTML = `
                <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"> ${el.champion} </th>
                <td> ${el.games} </td>
                <td> ${el.wins} </td>
                <td> ${el.games - el.wins} </td>
                <td> ${Math.floor(el.wins / el.games * 100)}% </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

const rpc = new RiotApiConnect();
const ui = new Ui();
