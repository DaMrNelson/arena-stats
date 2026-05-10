export const PLACEMENTS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export type Placement = typeof PLACEMENTS[number];
export const PLACEMENT_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8"];
export type PlacementKey = typeof PLACEMENT_KEYS[number];

export type MatchRecordBody = {
  match_id: string,
  match: Match,
  timeline: Timeline,
};

export type Match = {
  metadata: MatchMetadata,
  info: MatchInfo,
}

export type MatchMetadata = {
  dataVersion: string,
  matchId: string,
  participants: string[],
}

export type MatchInfo = {
  endOfGameResult: string,
  gameCreation: number,
  gameDuration: number,
  gameEndTimestamp: number,
  gameId: number,
  gameMode: string,
  gameName: string,
  gameStartTimestamp: number,
  gameType: string,
  gameVersion: string,
  mapId: number,
  participants: Participant[],
  platformId: string,
  queueId: number,
  teams: Team[],
  tournamentCode: string,
}

export type Participant = {
  /** If true, this participant doesn't match out filters and should be excluded from the match's stats. */
  _excluded?: boolean,
  /** If true, this participant is doing a stat run (no items before level 7). Applied during filter stage. */
  _isStatRun?: boolean,
  /** If true, this participant picked bravery. Applied during filter stage. */
  _isBravery?: boolean,
  /** If true, this participant picked crowd favorite. Applied during filter stage. */
  _isCrowdFav?: boolean,

  PlayerBehavior: {
    PlayerBehavior_IsHeroInCombat: number
  },
  PlayerScore0: number,
  PlayerScore1: number,
  PlayerScore10: number,
  PlayerScore11: number,
  PlayerScore2: number,
  PlayerScore3: number,
  PlayerScore4: number,
  PlayerScore5: number,
  PlayerScore6: number,
  PlayerScore7: number,
  PlayerScore8: number,
  PlayerScore9: number,
  allInPings: number,
  assistMePings: number,
  assists: number,
  baronKills: number,
  basicPings: number,
  challenges: ParticipantChallenges,
  champExperience: number,
  champLevel: number,
  /** Equivalent to championsByKey[participant.chmapionId]. Riot mismatched these name values. */
  championId: number,
  /** INCONSISTENT! Does not match Champion.id, and not the human readable version either. Use `championId.toFixed(0) === Champion.key` instead. */
  championName: string,
  championTransform: number,
  commandPings: number,
  consumablesPurchased: number,
  damageDealtToBuildings: number,
  damageDealtToEpicMonsters: number,
  damageDealtToObjectives: number,
  damageDealtToTurrets: number,
  damageSelfMitigated: number,
  dangerPings: number,
  deaths: number,
  detectorWardsPlaced: number,
  doubleKills: number,
  dragonKills: number,
  eligibleForProgression: boolean,
  enemyMissingPings: number,
  enemyVisionPings: number,
  firstBloodAssist: boolean,
  firstBloodKill: boolean,
  firstTowerAssist: boolean,
  firstTowerKill: boolean,
  gameEndedInEarlySurrender: boolean,
  gameEndedInSurrender: boolean,
  getBackPings: number,
  goldEarned: number,
  goldSpent: number,
  holdPings: number,
  individualPosition: string,
  inhibitorKills: number,
  inhibitorTakedowns: number,
  inhibitorsLost: number,
  item0: number,
  item1: number,
  item2: number,
  item3: number,
  item4: number,
  item5: number,
  item6: number,
  itemsPurchased: number,
  killingSprees: number,
  kills: number,
  lane: string,
  largestCriticalStrike: number,
  largestKillingSpree: number,
  largestMultiKill: number,
  longestTimeSpentLiving: number,
  magicDamageDealt: number,
  magicDamageDealtToChampions: number,
  magicDamageTaken: number,
  missions: ParticipantMissions,
  needVisionPings: number,
  neutralMinionsKilled: number,
  nexusKills: number,
  nexusLost: number,
  nexusTakedowns: number,
  objectivesStolen: number,
  objectivesStolenAssists: number,
  onMyWayPings: number,
  participantId: number,
  pentaKills: number,
  perks: ParticipantPerks,
  physicalDamageDealt: number,
  physicalDamageDealtToChampions: number,
  physicalDamageTaken: number,
  placement: number,
  playerAugment1: number,
  playerAugment2: number,
  playerAugment3: number,
  playerAugment4: number,
  playerAugment5: number,
  playerAugment6: number,
  playerSubteamId: number,
  profileIcon: number,
  pushPings: number,
  puuid: string,
  quadraKills: number,
  retreatPings: number,
  riotIdGameName: string,
  riotIdTagline: string,
  role: string,
  roleBoundItem: number,
  sightWardsBoughtInGame: number,
  spell1Casts: number,
  spell2Casts: number,
  spell3Casts: number,
  spell4Casts: number,
  subteamPlacement: number,
  summoner1Casts: number,
  summoner1Id: number,
  summoner2Casts: number,
  summoner2Id: number,
  summonerId: string,
  summonerLevel: number,
  summonerName: string,
  teamEarlySurrendered: boolean,
  teamId: number,
  teamPosition: string,
  timeCCingOthers: number,
  timePlayed: number,
  totalAllyJungleMinionsKilled: number,
  totalDamageDealt: number,
  totalDamageDealtToChampions: number,
  totalDamageShieldedOnTeammates: number,
  totalDamageTaken: number,
  totalEnemyJungleMinionsKilled: number,
  totalHeal: number,
  totalHealsOnTeammates: number,
  totalMinionsKilled: number,
  totalTimeCCDealt: number,
  totalTimeSpentDead: number,
  totalUnitsHealed: number,
  tripleKills: number,
  trueDamageDealt: number,
  trueDamageDealtToChampions: number,
  trueDamageTaken: number,
  turretKills: number,
  turretTakedowns: number,
  turretsLost: number,
  unrealKills: number,
  visionClearedPings: number,
  visionScore: number,
  visionWardsBoughtInGame: number,
  wardsKilled: number,
  wardsPlaced: number,
  win: boolean,
}

export type ParticipantChallenges = {
  "12AssistStreakCount": number,
  HealFromMapSources: number,
  InfernalScalePickup: number,
  SWARM_DefeatAatrox: number,
  SWARM_DefeatBriar: number,
  SWARM_DefeatMiniBosses: number,
  SWARM_EvolveWeapon: number,
  SWARM_Have3Passives: number,
  SWARM_KillEnemy: number,
  SWARM_PickupGold: number,
  SWARM_ReachLevel50: number,
  SWARM_Survive15Min: number,
  SWARM_WinWith5EvolvedWeapons: number,
  abilityUses: number,
  acesBefore15Minutes: number,
  alliedJungleMonsterKills: number,
  baronTakedowns: number,
  blastConeOppositeOpponentCount: number,
  bountyGold: number,
  buffsStolen: number,
  completeSupportQuestInTime: number,
  controlWardsPlaced: number,
  damagePerMinute: number,
  damageTakenOnTeamPercentage: number,
  dancedWithRiftHerald: number,
  deathsByEnemyChamps: number,
  dodgeSkillShotsSmallWindow: number,
  doubleAces: number,
  dragonTakedowns: number,
  effectiveHealAndShielding: number,
  elderDragonKillsWithOpposingSoul: number,
  elderDragonMultikills: number,
  enemyChampionImmobilizations: number,
  enemyJungleMonsterKills: number,
  epicMonsterKillsNearEnemyJungler: number,
  epicMonsterKillsWithin30SecondsOfSpawn: number,
  epicMonsterSteals: number,
  epicMonsterStolenWithoutSmite: number,
  firstTurretKilled: number,
  fistBumpParticipation: number,
  flawlessAces: number,
  fullTeamTakedown: number,
  gameLength: number,
  getTakedownsInAllLanesEarlyJungleAsLaner: number,
  goldPerMinute: number,
  hadOpenNexus: number,
  immobilizeAndKillWithAlly: number,
  initialBuffCount: number,
  initialCrabCount: number,
  jungleCsBefore10Minutes: number,
  junglerTakedownsNearDamagedEpicMonster: number,
  kTurretsDestroyedBeforePlatesFall: number,
  kda: number,
  killAfterHiddenWithAlly: number,
  killParticipation: number,
  killedChampTookFullTeamDamageSurvived: number,
  killingSprees: number,
  killsNearEnemyTurret: number,
  killsOnOtherLanesEarlyJungleAsLaner: number,
  killsOnRecentlyHealedByAramPack: number,
  killsUnderOwnTurret: number,
  killsWithHelpFromEpicMonster: number,
  knockEnemyIntoTeamAndKill: number,
  landSkillShotsEarlyGame: number,
  laneMinionsFirst10Minutes: number,
  legendaryCount: number,
  legendaryItemUsed: number[],
  lostAnInhibitor: number,
  maxKillDeficit: number,
  mejaisFullStackInTime: number,
  moreEnemyJungleThanOpponent: number,
  multiKillOneSpell: number,
  multiTurretRiftHeraldCount: number,
  multikills: number,
  multikillsAfterAggressiveFlash: number,
  outerTurretExecutesBefore10Minutes: number,
  outnumberedKills: number,
  outnumberedNexusKill: number,
  perfectDragonSoulsTaken: number,
  perfectGame: number,
  pickKillWithAlly: number,
  poroExplosions: number,
  quickCleanse: number,
  quickFirstTurret: number,
  quickSoloKills: number,
  riftHeraldTakedowns: number,
  saveAllyFromDeath: number,
  scuttleCrabKills: number,
  shortestTimeToAceFromFirstTakedown?: number,
  skillshotsDodged: number,
  skillshotsHit: number,
  snowballsHit: number,
  soloBaronKills: number,
  soloKills: number,
  stealthWardsPlaced: number,
  survivedSingleDigitHpCount: number,
  survivedThreeImmobilizesInFight: number,
  takedownOnFirstTurret: number,
  takedowns: number,
  takedownsAfterGainingLevelAdvantage: number,
  takedownsBeforeJungleMinionSpawn: number,
  takedownsFirstXMinutes: number,
  takedownsInAlcove: number,
  takedownsInEnemyFountain: number,
  teamBaronKills: number,
  teamDamagePercentage: number,
  teamElderDragonKills: number,
  teamRiftHeraldKills: number,
  tookLargeDamageSurvived: number,
  turretPlatesTaken: number,
  turretTakedowns: number,
  turretsTakenWithRiftHerald: number,
  twentyMinionsIn3SecondsCount: number,
  twoWardsOneSweeperCount: number,
  unseenRecalls: number,
  visionScorePerMinute: number,
  voidMonsterKill: number,
  wardTakedowns: number,
  wardTakedownsBefore20M: number,
  wardsGuarded: number,
  fastestLegendary?: number,
  highestChampionDamage?: number,
  highestCrowdControlScore?: number,
}

export type ParticipantMissions = {
  playerScore0: number
  playerScore1: number
  playerScore2: number
  playerScore3: number
  playerScore4: number
  playerScore5: number
  playerScore6: number
  playerScore7: number
  playerScore8: number
  playerScore9: number
  playerScore10: number
  playerScore11: number
}

export type ParticipantPerks = {
  statPerks: ParticipantStatPerks
  styles: ParticipantPerkStyle[]
}

export type ParticipantStatPerks = {
  defense: number
  flex: number
  offense: number
}

export type ParticipantPerkStyle = {
  description: string
  selections: ParticipantPerkSelection[]
  style: number
}

export type ParticipantPerkSelection = {
  perk: number
  var1: number
  var2: number
  var3: number
}

export type Team = {
  bans: Ban[]
  objectives: Objective
  teamId: number
  win: boolean
}

export type Ban = {
  championId: number
  pickTurn: number
}

export type Objective = {
  atakhan: ObjectiveState
  baron: ObjectiveState
  champion: ObjectiveState
  dragon: ObjectiveState
  horde: ObjectiveState
  inhibitor: ObjectiveState
  riftHerald: ObjectiveState
  tower: ObjectiveState
}

export type ObjectiveState = {
  first: boolean
  kills: number
}



// TIMELINE



export interface Timeline {
  metadata: TimelineMetadata
  info: TimelineInfo
}

export interface TimelineMetadata {
  dataVersion: string
  matchId: string
  participants: string[]
}

export interface TimelineInfo {
  endOfGameResult: string
  frameInterval: number
  frames: Frame[]
  gameId: number
  participants: Participant[]
}

export interface Frame {
  events: FrameEvent[]
  participantFrames: ParticipantFrames
  timestamp: number
}

/*export type FrameEvent = {
  realTimestamp?: number
  timestamp: number
  type: string
  levelUpType?: string
  participantId?: number
  skillSlot?: number
  level?: number
  itemId?: number
  creatorId?: number
  wardType?: string
  afterId?: number
  beforeId?: number
  goldGain?: number
  assistingParticipantIds?: number[]
  bounty?: number
  killStreakLength?: number
  killerId?: number
  position?: Position
  shutdownBounty?: number
  victimDamageDealt?: VictimDamageDealt[]
  victimDamageReceived?: VictimDamageReceived[]
  victimId?: number
  victimTeamfightDamageDealt?: VictimTeamfightDamageDealt[]
  victimTeamfightDamageReceived?: VictimTeamfightDamageReceived[]
  killType?: string
  multiKillLength?: number
  transformType?: string
  gameId?: number
  winningTeam?: number
} &*/
export type FrameEvent = {
  type: "LEVEL_UP",
  participantId: number,
  level: number,
  timestamp: number,
} | {
  type: "ITEM_PURCHASED",
  participantId: number,
  itemId: number,
  timestamp: number,
} | {
  type: "ITEM_DESTROYED",
  participantId: number,
  itemId: number,
  timestamp: number,
};

export interface Position {
  x: number
  y: number
}

export interface VictimDamageDealt {
  basic: boolean
  magicDamage: number
  name: string
  participantId: number
  physicalDamage: number
  spellName: string
  spellSlot: number
  trueDamage: number
  type: string
}

export interface VictimDamageReceived {
  basic: boolean
  magicDamage: number
  name: string
  participantId: number
  physicalDamage: number
  spellName: string
  spellSlot: number
  trueDamage: number
  type: string
}

export interface VictimTeamfightDamageDealt {
  basic: boolean
  magicDamage: number
  name: string
  participantId: number
  physicalDamage: number
  spellName: string
  spellSlot: number
  trueDamage: number
  type: string
}

export interface VictimTeamfightDamageReceived {
  basic: boolean
  magicDamage: number
  name: string
  participantId: number
  physicalDamage: number
  spellName: string
  spellSlot: number
  trueDamage: number
  type: string
}

export type ParticipantFrames = Record<string, ParticipantFrame>;

export interface ParticipantFrame {
  championStats: ChampionStats
  currentGold: number
  damageStats: DamageStats
  goldPerSecond: number
  jungleMinionsKilled: number
  level: number
  minionsKilled: number
  participantId: number
  position: ParticipantFramePosition
  timeEnemySpentControlled: number
  totalGold: number
  xp: number
}

export interface ChampionStats {
  abilityHaste: number
  abilityPower: number
  armor: number
  armorPen: number
  armorPenPercent: number
  attackDamage: number
  attackSpeed: number
  bonusArmorPenPercent: number
  bonusMagicPenPercent: number
  ccReduction: number
  cooldownReduction: number
  health: number
  healthMax: number
  healthRegen: number
  lifesteal: number
  magicPen: number
  magicPenPercent: number
  magicResist: number
  movementSpeed: number
  omnivamp: number
  physicalVamp: number
  power: number
  powerMax: number
  powerRegen: number
  spellVamp: number
}

export interface DamageStats {
  magicDamageDone: number
  magicDamageDoneToChampions: number
  magicDamageTaken: number
  physicalDamageDone: number
  physicalDamageDoneToChampions: number
  physicalDamageTaken: number
  totalDamageDone: number
  totalDamageDoneToChampions: number
  totalDamageTaken: number
  trueDamageDone: number
  trueDamageDoneToChampions: number
  trueDamageTaken: number
}

export interface ParticipantFramePosition {
  x: number
  y: number
}
