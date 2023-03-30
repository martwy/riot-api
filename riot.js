window.onload = function () {
  console.log("App started");
  rpc.init();
};

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

  init() {
    document
      .getElementById("saveButton")
      .addEventListener("click", (e) => this.getName(e));
  }

  getName(e) {
    this.name = document.getElementById("summonerName").value;
    this.riotApiKey = document.getElementById("riotApiKey").value;

    if (this.name === "") {
      console.log("Brak nazwy");
      return;
    }
    e.preventDefault();
    this.getData();
  }

  // data from riot api about player match history
  async getData() {
    const summonerByNameUrl = `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${this.name}?api_key=${this.riotApiKey}`;
    let response = await fetch(summonerByNameUrl);
    let data = await response.json();
    const summonerPuuid = data.puuid;
    const matchesByPuuidUrl = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${data.puuid}/ids?type=ranked&start=0&count=19&api_key=${this.riotApiKey}`;
    console.log("First fetch works", data);

    response = await fetch(matchesByPuuidUrl);
    data = await response.json();
    const matchUrl = `https://europe.api.riotgames.com/lol/match/v5/matches/${data[0]}?api_key=${this.riotApiKey}`;

    console.log("Matches list by id works", data);

    const matchesArray = [];
    data.forEach((element) => {
      const matchesUrls = `https://europe.api.riotgames.com/lol/match/v5/matches/${element}?api_key=${this.riotApiKey}`;
      matchesArray.push(matchesUrls);
    });
    console.log("Fetch array works: ", matchesArray);

    response = await Promise.all(matchesArray.map((url) => fetch(url)));
    data = await Promise.all(response.map((res) => res.json()));
    console.log("MultiFetch works", data);

    data.forEach((el, index) => {
      index = el.metadata.participants.indexOf(summonerPuuid);
      const champTemp = el.info.participants[index].championName;
      const found = this.champions.find((el) => el.champion === champTemp);
      const winFlag = el.info.participants[index].win;
      if (typeof found !== "undefined") {
        found.games++;
        if (winFlag) found.wins++;
      } else {
        this.champions.push(new Champion(champTemp, 1, winFlag ? 1 : 0));
      }
    });

    console.log(this.champions);
    ui.addInfoToTable();
  }
}

class Ui {
  // Shows information in table
  addInfoToTable() {
    const tbody = document.querySelector("#dataTable tbody");
    rpc.champions.forEach((el) => {
      // const winRatio = el.wins / el.games;
      const tr = document.createElement("tr");
      tr.classList.add(
        "bg-white",
        "border-b",
        "dark:bg-gray-900",
        "dark:border-gray-700"
      );
      tr.innerHTML = `
                <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"> ${
                  el.champion
                } </th>
                <td> ${el.games} </td>
                <td> ${el.wins} </td>
                <td> ${el.games - el.wins} </td>
                <td> ${Math.floor((el.wins / el.games) * 100)}% </td>
            `;
      tbody.appendChild(tr);
    });
  }
}

const rpc = new RiotApiConnect();
const ui = new Ui();
