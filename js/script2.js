console.log('Lets Write js');

let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getsongs(folder) {
    currFolder = folder;

    // ✅ Fetch static JSON instead of scraping directory listing
    let response = await fetch(`/${folder}/songs.json`);
    let data = await response.json();
    songs = data.songs;

    // Show all the songs in the playlist
    let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUl.innerHTML = "";

    for (const song of songs) {
        let displayName = song.replaceAll("_", " ").replace(".mp3", "");
        songUl.innerHTML += `<li>
            <img class="invert" src="img/music.svg" alt="">
            <div class="info">
                <div>${displayName}</div>
                <div>~.Rd.~®</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg" alt="">
            </div>
        </li>`;
    }

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    console.log("TRACK =", track);
    console.log("SONGS ARRAY =", songs);
    // FIX: encode the track name so browser can fetch files with special chars in name
    track = track.split("\\").pop();
    currentSong.src = `/${currFolder}/${track}`;
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURIComponent(track)  .replaceAll("_", " ")
        .replace(".mp3", "")
        .replaceAll("-", " ");
    document.querySelector(".songtime").innerHTML = "00:00"
}

async function displayAlbums() {
    // ✅ Hardcode your album folder names
   const folders = ["Raps", "Motivational", "Broken", "Devotional songs", "Marthi side", "Romantic hits"];

    let cardContainer = document.querySelector(".cardContainer");

    for (const folder of folders) {
        try {
            let res = await fetch(`/songs/${folder}/info.json`);
            let info = await res.json();

            cardContainer.innerHTML += `
            <div data-folder="${folder}" class="card">
                <div class="play">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 20V4L19 12L5 20Z"
                            stroke="#141B34" fill="#000"
                            stroke-width="1.5" stroke-linejoin="round"/>
                    </svg>
                </div>
                <img src="/songs/${folder}/Cover.jpeg" alt="">
                <h2>${info.title}</h2>
                <p>${info.description}</p>
            </div>`;
        } catch (err) {
            console.error("Error loading album:", folder, err);
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async (item) => {
            let folderName = item.currentTarget.dataset.folder;
            songs = await getsongs(`songs/${folderName}`);
            playMusic(songs[0]);
        });
    });
}

async function main() {
    // get the list of all the songs
    await getsongs("songs/Raps")
    console.log("SONGS[0] =", songs[0]);
    playMusic(songs[0], true)

    // display all the albums on the page
    displayAlbums()

    // attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    // listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration) * percent / 100;
    })

    // add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // add an event listener to previous
    previous.addEventListener("click", () => {
        console.log("Previous clicked")
        // FIX: decode src to match against decoded songs array
        let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").slice(-1)[0]))
        console.log(songs, index)
        if ((index - 1 >= 0)) {
            playMusic(songs[index - 1])
        }
    })

    // add an event listener to next
    next.addEventListener("click", () => {
        console.log("next clicked")
        // FIX: decode src to match against decoded songs array
        let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").slice(-1)[0]))
        console.log(songs, index)
        console.log("Current SRC:", currentSong.src);
        console.log("Songs:", songs);
        if ((index + 1 < songs.length)) {
            playMusic(songs[index + 1])
        }
    })

    // add an event listener to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("setting volume to", e.target.value, " / 100")
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

    // add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        console.log(e.target)
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })
}

main()