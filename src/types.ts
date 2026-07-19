export type AppId = 
  | 'terminal' 
  | 'notepad' 
  | 'computer' 
  | 'browser' 
  | 'trash' 
  | 'files'
  | 'calculator'
  | 'calendar'
  | 'clock'
  | 'weather'
  | 'music'
  | 'settings'
  | 'paint'
  | 'snake'
  | 'tictactoe'
  | 'cpu'
  | 'passwords'
  | 'network'
  | 'camera'
  | 'maps'
  | 'store'
  | 'cyber_paint'
  | 'space_invaders'
  | 'crypto_tracker'
  | 'ai_gen'
  | 'terminal_pro'
  | 'drum_kit'
  | 'video_player'
  | 'voice_recorder'
  | 'cube_3d'
  | 'stock_market'
  | 'markdown_editor'
  | 'system_info'
  | 'piano'
  | 'compass'
  | 'chat'
  | 'synth'
  | 'chess'
  | 'dj_mixer'
  | 'code_editor'
  | 'solitaire'
  | 'theme_store'
  | 'memory_game'
  | 'hacker_typer'
  | 'metronome'
  | 'breathing'
  | 'pong'
  | 'drum_sequencer'
  | 'zen_physics'
  | 'news_flow'
  | 'u_labs'
  | 'scope'
  | 'sky_explorer'
  | 'fractal_art'
  | 'audio_visualizer'
  | 'stego_crypto'
  | 'cellular_automata'
  | 'pixel_studio'
  | 'js_sandbox'
  | 'periodic_table'
  | 'mind_map'
  | 'typing_race'
  | 'rpg_quest';

export interface AppFolder {
  id: string;
  title: string;
  appIds: AppId[];
}

export interface DesktopWidget {
  id: string;
  type: 'clock' | 'weather' | 'calendar' | 'stocks' | 'battery' | 'music';
  x: number;
  y: number;
  w: number;
  h: number;
  variant?: 'glass' | 'solid' | 'neon';
  config?: any;
}

export type DesktopItem = 
  | { type: 'app', id: AppId, title?: string }
  | { type: 'folder', id: string, title?: string };

