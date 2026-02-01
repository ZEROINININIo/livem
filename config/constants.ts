
import { AppConfig } from '../types';

export const CONFIG_STORAGE_KEY = 'nova_labs_config_v10';
export const GUESTBOOK_STORAGE_KEY = 'nova_guestbook_data';
export const API_URL = 'https://cdn.zeroxv.cn/nova_api/api.php'; 

export const DEFAULT_CONFIG: AppConfig = {
  language: 'zh-CN',
  crtEnabled: true,
  isLightTheme: false,
  setupCompleted: false,
  bgmPlaying: true, 
  bgmVolume: 0.15,
  readerFont: 'custom-02',
  readingMode: 'standard',
  nickname: '' 
};

// BGM Configuration - Remote Source Strategy with Fallbacks
export const AUDIO_MAP = {
  main: [
    "https://lz.qaiu.top/parser?url=https://sbcnm.lanzoum.com/i5OIw3dk1rte",
    "https://cik07-cos.7moor-fs2.com/im/4d2c3f00-7d4c-11e5-af15-41bf63ae4ea0/fd991fcc1f737774/main.mp3"
  ],
  daily: [
    "https://lz.qaiu.top/parser?url=https://sbcnm.lanzoum.com/i5TeC3dk1q1a",
    "https://cik07-cos.7moor-fs2.com/im/4d2c3f00-7d4c-11e5-af15-41bf63ae4ea0/6f611d085fec7cfe/daily.mp3"
  ],
  x: [
    "https://lz.qaiu.top/parser?url=https://sbcnm.lanzoum.com/ii2Uj3frz2le"
  ],
  byaki: [
    "https://cik07-cos.7moor-fs2.com/im/4d2c3f00-7d4c-11e5-af15-41bf63ae4ea0/e49d774395d5381a/Byaki..mp3",
    "https://lz.qaiu.top/parser?url=https://sbcnm.lanzoum.com/iCU593dnamda"
  ],
  database: [
    "https://lz.qaiu.top/parser?url=https://sbcnm.lanzoum.com/i09IZ3effnne"
  ],
  terminal: [
    "https://lz.qaiu.top/parser?url=https://sbcnm.lanzoum.com/i09IZ3effnne"
  ],
  midnight: [
    "https://lz.qaiu.top/parser?url=https://sbcnm.lanzoum.com/i5y9D3ev5qni"
  ],
  flies: [
    "https://lz.qaiu.top/parser?url=https://sbcnm.lanzoum.com/iBmJH3g8frgb"
  ]
};

export const MAP_CONFIG = {
    speed: 5,
    interactionDist: 80,
    gridSize: 50,
    // Map Boundaries (The world is finite)
    bounds: {
        minX: -1500,
        maxX: 1500,
        minY: -1500,
        maxY: 1500
    }
};
