let currSong = new Audio();
let songs;
let plays = document.querySelector(".songbuttons").querySelector("#plays");
let container = document.querySelector(".card-container");
let cards = document.querySelector(".cards");

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

function playSong(track, pause = false) {
  currSong.src = track;

  if (!pause) {
    currSong.play();
    plays.src = "./images/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(
    track.substring(track.lastIndexOf("/") + 1, track.length - 4)
  );
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function getSongs(folder) {
  let a = await fetch(`https://main--mediaplayerr.netlify.app/${folder}/`);
  let response = await a.text();
  const infojs = await fetch(`http://127.0.0.1:5500/${folder}/info.json`);
  const jsonf = await infojs.json();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");

  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href);
    }
  }

  let songUL = document.querySelector(".songs").getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    let songName = song.substring(song.lastIndexOf("/") + 1, song.length - 4);
    songUL.innerHTML += `<li>
          <img class="invert" src="./images/music.svg" alt="" />
          <div>
            <h4>${songName.replaceAll("%20", " ")}</h4>
            <h5>${jsonf.author}</h5>
          </div>
          <span class="playnow">
            <span>Play Now</span>
            <img class="invert" src="./images/play.svg" alt="" />
          </span>
        </li>`;
  }

  Array.from(
    document.querySelector(".songs").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      playSong(`${folder}/${e.querySelector("h4").innerHTML}.mp3`);
    });
  });
  return songs;
}

async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:5500/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("songs/") && !e.href.includes(".htaccess")) {
      let folder = e.href.split("/").slice(-1)[0];
      let a = await fetch(`/songs/${folder}/info.json`);
      let response = await a.json();

      container.innerHTML =
        container.innerHTML +
        ` <div data-folder=${folder} class="cards">
              <div class="play">
               <img src="./images/cardplay.svg"></>
              </div>
              <img
                src="songs/${folder}/song.jpeg"
                alt=""
              />
              <h4>${response.title}</h4>
              <p>${response.description}</p>
            </div>
`;
    }
  }
}

async function main() {
  await getSongs("songs/ncs/");
  playSong(songs[0], true);

  await displayAlbums();

  Array.from(document.getElementsByClassName("cards")).forEach((e) => {
    e.addEventListener("click", async (items) => {
      await getSongs(`songs/${items.currentTarget.dataset.folder}`);
    });
  });

  plays.addEventListener("click", () => {
    if (currSong.paused) {
      currSong.play();
      plays.src = "./images/pause.svg";
    } else {
      currSong.pause();
      plays.src = "./images/plays.svg";
    }
  });

  currSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currSong.currentTime
    )} / ${secondsToMinutesSeconds(currSong.duration)}
 `;

    document.querySelector(".circle").style.left =
      (currSong.currentTime / currSong.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currSong.currentTime = (currSong.duration * percent) / 100;
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = -2 + "%";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = -110 + "%";
  });

  prev.addEventListener("click", () => {
    let index = songs.indexOf(currSong.src);

    if (index === 0) {
      playSong(songs[songs.length - 1]);
    } else {
      playSong(songs[index - 1]);
    }
  });

  next.addEventListener("click", () => {
    let index = songs.indexOf(currSong.src);

    if (index + 1 === songs.length) {
      playSong(songs[0]);
    } else {
      playSong(songs[index + 1]);
    }
  });

  document
    .querySelector(".volume")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currSong.volume = parseInt(e.target.value) / 100;
    });

  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      document
        .querySelector(".volume")
        .getElementsByTagName("input")[0].value = 0;

      currSong.volume = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      document
        .querySelector(".volume")
        .getElementsByTagName("input")[0].value = 50;

      currSong.volume = 0.5;
    }
  });
}

main();
