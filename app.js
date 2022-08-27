const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'MUSIC_PLAYER';

const sidebarLink = $$('.sidebar-link');
sidebarLink.forEach( item => {
    item.onclick = () => {
        $('.sidebar-link.active').classList.remove('active')
        item.classList.add('active');
    }
})

//background volumn
const volumnProgress = $('.volumn-progress');
const volumnSlider = $('.volumn-slider');
const volumn = $('.volumn');


volumnSlider.oninput = () => {
    const maxVal = volumnSlider.getAttribute('max');
    const val = volumnSlider.value / maxVal;
    volumnProgress.style.width = val * 100 + '%';

    audio.volume = val;
    console.log('val:' + val);
    console.log('audio.volume:' + audio.volume);
}


//audio
const audio = $('#audio');
const listSongs = $('.list-song');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const cdThumb = $('.cd-thumb');
const heading = $('header h2');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const durationTimer = $('.duration');
const remainingTimer = $('.remaining');
const rangeBar = $('#progress');
let timer;
const progressBg = $('.progressBg');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const heartBtn = $('.heart');
const sort = $('.sort');
const search = $('.navbar-search input');
const navSearch = $('.navbar-search');
const boxSearch = $('.box-search');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

    //list songs
    songs: [
        {
            id: 1,
            name: 'Unstoppable',
            singer: 'Sia',
            path: './music/Unstoppable-Sia-4312901.mp3',
            image: './img/unstoppable.jpg',
            playing: 53758335,
            time: '3:37'
        },
        {
            id: 2,
            name: 'Dancing With Your Ghost',
            singer: 'SashaSloan',
            path: './music/DancingWithYourGhost-SashaSloan-6153043.mp3',
            image: './img/dancing.jpg',
            playing: 47238593,
            time: '3:18'
        },
        {
            id: 3,
            name: 'Savage Love',
            singer: 'JasonDerulo',
            path: './music/SavageLove-JasonDerulo-6288663.mp3',
            image: './img/Savage_love.jpg',
            playing: 33874298,
            time: '2:49'
        },
        {
            id: 4,
            name: 'Seorita',
            singer: 'ShawnMendes',
            path: './music/Seorita-ShawnMendesCamilaCabello-6007813.mp3',
            image: './img/Senorita.jpg',
            playing: 32875839,
            time: '3:11'
        },
        {
            id: 5,
           name: 'On My Way',
           singer: 'AlanWalker',
           path: './music/OnMyWay-AlanWalkerSabrinaCarpenterFarruko-5919403.mp3',
           image: './img/on-my-way.jpg',
           playing: 29475835,
            time: '3:13'
       },
       
       {
           id: 6,
           name: 'Way Back',
           singer: 'Vicetone',
           path: './music/WayBack-VicetoneCoziZuehlsdorff-5411153.mp3',
           image: './img/way-back.jpg',
           playing: 24758493,
            time: '3:28'
       }
        ],

    setConfig: function(key, value){
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },

    render: function(){
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song-item ${index === this.currentIndex ? 'active' : ''}" data-index=${index}>
                <div class="song-id">${index+1}</div>
                <div class="song-beats ${(index === this.currentIndex && app.isPlaying == true)? 'active' : ''}">
                    <div class='con'>
                        <span class='item'></span>
                        <span class='item'></span>
                        <span class='item'></span>
                        <span class='item'></span>
                        <span class='item'></span>
                    </div>
                </div>
                <div class="song-title">
                    <img src="${song.image}" alt="">
                    <p>${song.name}</p>
                </div>
                <div class="song-playing">${song.playing.toLocaleString('fi-FI')}</div>
                <div class="song-time">${song.time}</div>
                <div class="song-singer">${song.singer}</div>
            </div>
            `
        })
        listSongs.innerHTML = htmls.join('');
    },  
    handleEvent: function(){

        //cd quay/dừng
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ],{
            duration: 10000,
            iterations: Infinity 
        })
        cdThumbAnimate.pause();

        //heart
        heartBtn.onclick = function(){
            heartBtn.classList.toggle('active');
            if ($('.heart.active')){
                this.innerHTML = `<i class="fas fa-heart"></i>`
            }
            else{
                this.innerHTML = `<i class="far fa-heart"></i>`
            }
        }

        
        //click play
        playBtn.onclick = function() {
            if (app.isPlaying){
                audio.pause();
            }
            else{
                audio.play();
            }
        }
        //khi được play
        audio.onplay = function(){
            app.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
            app.render();

            timer = setInterval(app.displayTimer, 500);
        }
        //khi pause 
        audio.onpause = function(){
            app.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
            app.render();
            
            clearInterval(timer);
        }

        //next song
        nextBtn.onclick = function(){
            if (app.isRandom){
                app.randomSong();
            }
            else{
                app.nextSong();
            }
            audio.play();
            app.render();
            app.scrollToACtiveSong();

        }

        //prev song
        prevBtn.onclick = function(){
            app.prevSong();
            audio.play();
            app.render();
            app.scrollToACtiveSong();
        }

        //click change time
        rangeBar.oninput = function(e){
            audio.currentTime = e.target.value;
            progressBg.style.width = audio.currentTime / audio.duration * 100 + "%";

        }
        
        //audio ended
        audio.onended = function(){
            if (app.isRepeat){
                audio.play();
            }
            else{
                nextBtn.onclick();
            }
        }

        //click list songs
        listSongs.onclick = function(e){
            const songNode = e.target.closest('.song-item:not(.active)');
            if (songNode){
                app.currentIndex = Number(songNode.dataset.index);
                app.loadCurrentSong();
                app.render();
                audio.play();
            }
        }

        //random
        randomBtn.onclick = function(){
            app.isRandom = !app.isRandom;
            randomBtn.classList.toggle('active', app.isRandom);
            app.setConfig('isRandom', app.isRandom);
        }

        //repeat
        repeatBtn.onclick = function(){
            app.isRepeat = !app.isRepeat;
            repeatBtn.classList.toggle('active', app.isRepeat);
            app.setConfig('isRepeat', app.isRepeat)
        }

        //sort
        sort.onchange = function(){
            audio.onpause();
            let type = sort.value;
            app.songs = app.songs.sort(function(a,b){
                if (type === '1'){
                    return b.playing - a.playing;
                }
                else if(type === '2'){
                    return a.name.localeCompare(b.name);
                }
            })
            app.loadCurrentSong();
            app.render();
            
        }

        search.onkeyup = function(e){
            let searchValue = search.value.trim();
            
            if (searchValue){
                let dataFilter = app.songs.filter( value => {
                    return value.name.toUpperCase().includes(searchValue.toUpperCase());
                });

                dataFilter = dataFilter.map(data => {
                    return data = `<li>${data.name}</li>`;
                })
                navSearch.classList.add('active');
                app.showBlockSearch(dataFilter);

                let itemList = boxSearch.querySelectorAll('li');
                
                itemList.forEach(item =>{
                    item.onclick = function() {
                        let valueItem = item.textContent;
                        
                        app.songs.forEach((value, index) => {
                            if (value.name == valueItem){
                                app.currentIndex = index;
                                app.loadCurrentSong();
                                app.render();
                                audio.play();
                            }
                        })

                        navSearch.classList.remove('active');
                        search.value ='';
                    }
                })
            }
            else{
                navSearch.classList.remove('active');
            }
        }

        
    },
    showBlockSearch: function(list){
        let listData;
        if (!list.length){
            listData = `<li>${search.value.trim()}</li>`;
        }
        else{
            listData = list.join('');
        }
        boxSearch.innerHTML = listData;
    },

    loadConfig: function(){
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    scrollToACtiveSong: function(){
        setTimeout(() => {
            $('.song-item.active').scrollIntoView({
                behavior: 'smooth',
                block: 'rearest'
            })
        },200)
    },

    defineProperties: function(){
        Object.defineProperty(this, 'currentSong', {
            get: function(){
                return this.songs[this.currentIndex];
            }
        })
    },

    loadCurrentSong: function(){
        audio.volume = 0.5;
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
        app.displayTimer();
    },

    nextSong: function(){
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length){
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    prevSong: function(){
        this.currentIndex--;
        if (this.currentIndex <0){
            this.currentIndex = this.songs.length-1;
        }
        this.loadCurrentSong();
    },

    randomSong: function(){
        let newIndex;
        do{
            newIndex = Math.floor(Math.random() * this.songs.length)
        }
        while (newIndex === this.currentIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    displayTimer: function(){
        const {duration, currentTime} = audio;
        rangeBar.max = duration;
        rangeBar.value = currentTime;
        remainingTimer.textContent = app.formatTimer(currentTime);
        if (!duration){
            durationTimer.textContent = '00:00';
        }
        else{
            durationTimer.textContent = app.formatTimer(duration);
        }
        progressBg.style.width = currentTime / duration * 100 + "%";

    },

    formatTimer: function(number) {
        const minutes = Math.floor(number/60);
        const seconds = Math.floor(number - minutes*60);
        return `${minutes < 10 ? '0'+minutes : minutes}:${seconds < 10 ? '0'+seconds : seconds}`;
    },

    
    start: function(){
        //gán cấu hình từ config vào ứng dụng
        this.loadConfig();
        
        //định nghĩa các thuộc tính cho object
        this.defineProperties();//set currentSong

        //lắng nghe / xử lí sự kiện
        this.handleEvent();
        
        //tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong();

        //render playlist
        this.render();

        //hiển thị trạng thái ban đầu của button repeat và random
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    }

}

app.start();