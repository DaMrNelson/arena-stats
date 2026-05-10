export interface Champion {
  /** Patch version name */
  version: string
  /** NOT TRUSTWORTHY. SOMETIMES matches participant.championName. */
  id: string
  /** TRUSTWORTHY. Matches participant.championId.toFixed(0) */
  key: string
  /** Human readable name */
  name: string
  title: string
  blurb: string
  info: Info
  image: Image
  /** Roles */
  tags: [string] | [string, string];
  partype: string
  stats: Stats
}

export interface Info {
  attack: number
  defense: number
  magic: number
  difficulty: number
}

export interface Image {
  full: string
  sprite: string
  group: string
  x: number
  y: number
  w: number
  h: number
}

export interface Stats {
  hp: number
  hpperlevel: number
  mp: number
  mpperlevel: number
  movespeed: number
  armor: number
  armorperlevel: number
  spellblock: number
  spellblockperlevel: number
  attackrange: number
  hpregen: number
  hpregenperlevel: number
  mpregen: number
  mpregenperlevel: number
  crit: number
  critperlevel: number
  attackdamage: number
  attackdamageperlevel: number
  attackspeedperlevel: number
  attackspeed: number
}
