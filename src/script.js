"use strict";

const AudioPlayer = require("./components/AudioPlayer.js");
const LyricsPlayer = require("./components/LyricsPlayer.js");
const UIManager = require("./components/UIManager.js");
const PlaylistManager = require("./components/PlaylistManager.js");
const FavoriteManager = require("./components/FavoriteManager.js");
const MusicSearcher = require("./components/MusicSearcher.js");
const SettingManager = require("./components/SettingManager.js");
const MusiclistManager = require("./components/MusiclistManager.js");
const CacheManager = require("./components/CacheManager.js");
const LoginManager = require("./components/LoginManager.js");

class App {
    constructor() {
        this.initializeComponents();
        this.loadSavedData();
        this.setupInitialUI();
    }

    initializeComponents() {
        try {
            // 创建音乐搜索器
            this.musicSearcher = new MusicSearcher();

            // 创建设置管理器
            this.settingManager = new SettingManager();

            // 创建播放器组件
            this.audioPlayer = new AudioPlayer(this.playlistManager);

            // 创建歌词播放器
            this.lyricsPlayer = new LyricsPlayer("暂无歌词，尽情欣赏音乐", this.audioPlayer.audio, this.settingManager);

            // 创建UI管理器
            this.uiManager = new UIManager(this.settingManager, this.audioPlayer, this.playlistManager, this.favoriteManager, this.musicSearcher);

            // 创建播放列表管理器
            this.playlistManager = new PlaylistManager(this.audioPlayer, this.lyricsPlayer, this.uiManager);

            // 创建收藏管理器
            this.favoriteManager = new FavoriteManager(this.playlistManager, this.uiManager);

            // 创建歌单管理器
            this.musiclistManager = new MusiclistManager(this.playlistManager);

            // 创建缓存管理器
            this.cacheManager = new CacheManager();

            // 创建登录管理器
            this.loginManager = new LoginManager();

            // 更新组件间的引用
            this.audioPlayer.playlistManager = this.playlistManager;
            this.uiManager.playlistManager = this.playlistManager;
            this.uiManager.audioPlayer = this.audioPlayer;
            this.uiManager.favoriteManager = this.favoriteManager;
            this.uiManager.musicSearcher = this.musicSearcher;
            this.uiManager.lyricsPlayer = this.lyricsPlayer;
            this.musicSearcher.uiManager = this.uiManager;
            this.musicSearcher.playlistManager = this.playlistManager;
            this.musicSearcher.favoriteManager = this.favoriteManager;
            this.playlistManager.settingManager = this.settingManager;
            this.playlistManager.uiManager = this.uiManager;
            this.playlistManager.musicSearcher = this.musicSearcher;
            this.playlistManager.musiclistManager = this.musiclistManager;
            this.musicSearcher.settingManager = this.settingManager;
            this.playlistManager.cacheManager = this.cacheManager;
            this.musiclistManager.uiManager = this.uiManager;
            this.musiclistManager.musicSearcher = this.musicSearcher;

            // 暴露全局引用
            window.app = this;
        } catch (error) {
            console.error("组件初始化失败:", error);
        }
    }

    loadSavedData() {
        try {
            // 加载保存的播放列表
            this.playlistManager.loadPlaylists();

            // 加载保存的收藏列表
            this.favoriteManager.loadFavorites();

            // 检查并应用保存的主题设置
            const savedTheme = localStorage.getItem("theme");
            if (savedTheme === "dark") {
                this.uiManager.toggleTheme();
            }
        } catch (error) {
            console.error("加载保存的数据失败:", error);
        }
    }

    setupInitialUI() {
        try {
            // 隐藏加载动画
            setTimeout(() => {
                document.querySelector(".loading").style.opacity = "0";
            }, 1000);
            setTimeout(() => {
                document.querySelector(".loading").style.display = "none";
            }, 2000);

            // 渲染播放列表
            this.uiManager.renderPlaylist();

            // 打开播放器界面
            document.querySelector("#function-list .player").click();

            // 设置默认播放
            if (this.playlistManager.playlist.length > 0) {
                // 使用保存的播放索引
                const index = this.playlistManager.playingNow || 0;
                // 不重置进度
                this.playlistManager.setPlayingNow(index, false);
                this.uiManager.renderPlaylist();
            }
        } catch (error) {
            console.error("初始UI设置失败:", error);
        }
    }
}

// 当DOM加载完成后初始化应用
document.addEventListener("DOMContentLoaded", () => {
    try {
        new App();
    } catch (error) {
        console.error("应用初始化失败:", error);
    }
});
