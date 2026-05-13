const state = {
  data: null,
  docsById: new Map(),
  currentDoc: null,
  selectedMarkableId: null,
  activePanel: "overview",
  filters: {
    event: true,
    time: true,
    entity: false,
    coref: true,
    translation: true,
  },
};

const PHRASE_TRANSLATIONS = [
  ["according to", "根据"],
  ["as a result", "结果"],
  ["at least", "至少"],
  ["broke out", "爆发"],
  ["checked into", "入住"],
  ["due to", "由于"],
  ["found guilty", "被判有罪"],
  ["in a statement", "在一份声明中"],
  ["in connection with", "与...有关"],
  ["in front of", "在...前面"],
  ["in hospital", "在医院"],
  ["in prison", "在监狱"],
  ["injured reserve", "伤病名单"],
  ["killed in", "死于"],
  ["law enforcement", "执法部门"],
  ["on trial", "受审"],
  ["pleaded guilty", "认罪"],
  ["police said", "警方说"],
  ["prison sentence", "监禁刑期"],
  ["sentenced to", "被判处"],
  ["set fire", "放火"],
  ["shot dead", "枪杀"],
  ["taken to", "被带到"],
  ["told afp", "告诉法新社"],
  ["told reuters", "告诉路透社"],
  ["was arrested", "被逮捕"],
  ["was charged", "被指控"],
  ["was killed", "被杀"],
  ["were arrested", "被逮捕"],
  ["were charged", "被指控"],
  ["were killed", "被杀"],
];

const WORD_TRANSLATIONS = {
  abandoned: "放弃",
  accused: "被指控",
  acquired: "收购",
  admitted: "承认",
  affected: "受影响的",
  announced: "宣布",
  appealed: "上诉",
  arrested: "逮捕",
  attacked: "袭击",
  beat: "击败",
  became: "成为",
  began: "开始",
  blamed: "归咎于",
  bombed: "轰炸",
  burned: "燃烧",
  caused: "造成",
  charged: "指控",
  collapsed: "倒塌",
  confirmed: "确认",
  convicted: "定罪",
  crashed: "坠毁",
  damaged: "损坏",
  defended: "卫冕",
  denied: "否认",
  died: "死亡",
  escaped: "逃脱",
  exploded: "爆炸",
  faced: "面临",
  fell: "倒下",
  filed: "提交",
  fired: "解雇",
  fled: "逃离",
  found: "发现",
  hit: "袭击",
  injured: "受伤",
  killed: "杀死",
  launched: "发布",
  left: "离开",
  lost: "失去",
  made: "提出",
  nominated: "提名",
  opened: "打开",
  ordered: "命令",
  panicked: "恐慌",
  prevented: "阻止",
  released: "发布",
  reported: "报道",
  rescued: "救援",
  returned: "返回",
  robbed: "抢劫",
  said: "说",
  sentenced: "判刑",
  shook: "震动",
  shot: "射击",
  stole: "偷走",
  suffered: "遭受",
  told: "告诉",
  transported: "转运",
  tried: "审判",
  won: "获胜",

  action: "行动",
  after: "之后",
  against: "针对",
  around: "大约",
  authorities: "当局",
  bank: "银行",
  blast: "爆炸",
  building: "建筑",
  case: "案件",
  child: "儿童",
  city: "城市",
  company: "公司",
  court: "法院",
  crash: "事故",
  damage: "损害",
  death: "死亡",
  deaths: "死亡",
  deputy: "副手",
  earthquake: "地震",
  event: "事件",
  facility: "设施",
  fire: "火灾",
  gun: "枪",
  hospital: "医院",
  injuries: "伤情",
  injury: "受伤",
  judge: "法官",
  lawyer: "律师",
  murder: "谋杀",
  office: "办公室",
  people: "人们",
  police: "警方",
  prison: "监狱",
  quake: "地震",
  rehab: "康复中心",
  report: "报道",
  shooting: "枪击",
  suspect: "嫌疑人",
  trial: "审判",
  victim: "受害者",
  victims: "受害者",
  witness: "目击者",

  a: "一个",
  an: "一个",
  and: "和",
  are: "是",
  as: "作为",
  at: "在",
  be: "是",
  been: "已经",
  by: "由",
  for: "为",
  from: "从",
  had: "曾",
  has: "已经",
  have: "已经",
  he: "他",
  her: "她的",
  his: "他的",
  in: "在",
  into: "进入",
  is: "是",
  it: "它",
  its: "它的",
  of: "的",
  on: "在",
  she: "她",
  that: "那",
  the: "这",
  their: "他们的",
  they: "他们",
  this: "这",
  to: "到",
  was: "是",
  were: "是",
  when: "当",
  who: "谁",
  with: "和",
};

const TOPIC_OVERVIEW = {
  1: { title: "Lindsay Lohan 更换康复机构", category: "娱乐/法律边缘", crisis: false, crisisType: "非 crisis", summary: "围绕名人进入、离开、更换康复中心的报道流。", aspects: ["康复机构流转", "法律/缓刑压力", "事故与旧案背景", "公开回应/报道"] },
  3: { title: "囚犯持枪逃脱", category: "公共安全", crisis: true, crisisType: "逃脱/武装风险", summary: "囚犯持枪控制狱警后逃跑，后续报道追踪追捕和安全风险。", aspects: ["逃脱行为", "武器与胁迫", "追捕/搜寻", "法律身份与服刑背景", "官方通报"] },
  4: { title: "Esther Williams 去世", category: "人物讣闻", crisis: false, crisisType: "非 crisis", summary: "围绕影星/游泳明星 Esther Williams 去世的新闻报道。", aspects: ["死亡事件", "职业成就回顾", "影视/游泳经历", "悼念与评价"] },
  5: { title: "76ers 解雇/任命教练", category: "体育管理", crisis: false, crisisType: "非 crisis", summary: "球队教练更换、任命和相关评论。", aspects: ["解雇/离任", "任命/接任", "球队表现原因", "管理层表态"] },
  7: { title: "Klitschko 卫冕拳击冠军", category: "体育比赛", crisis: false, crisisType: "非 crisis", summary: "拳击比赛、击败对手、卫冕冠军头衔。", aspects: ["比赛结果", "击倒/终止比赛", "卫冕/头衔变化", "赛后回应"] },
  8: { title: "希腊骚乱中的银行爆炸/火灾", category: "社会危机", crisis: true, crisisType: "骚乱/爆炸/死亡", summary: "骚乱期间银行遭燃烧弹袭击并导致人员死亡。", aspects: ["骚乱升级", "袭击/纵火", "人员伤亡", "警方/政府应对", "社会抗议背景"] },
  12: { title: "印度海军阻止海盗袭击", category: "安全事件", crisis: true, crisisType: "海盗袭击", summary: "海盗袭击、海军拦截、逮捕嫌疑人。", aspects: ["海盗袭击企图", "海军拦截行动", "逮捕/扣押", "船只保护", "官方通报"] },
  13: { title: "阿拉斯加乳品厂纵火/火灾", category: "灾害/犯罪", crisis: true, crisisType: "纵火/建筑火灾", summary: "建筑火灾、纵火嫌疑、设施被毁。", aspects: ["火灾发生", "纵火/犯罪嫌疑", "建筑损毁", "调查进展", "社区/经营影响"] },
  14: { title: "Waitrose 超市火灾", category: "灾害", crisis: true, crisisType: "商业设施火灾", summary: "超市火灾、损毁、消防处置和后续恢复。", aspects: ["火灾发生", "消防处置", "设施损毁", "营业中断/恢复", "调查/原因"] },
  16: { title: "帮派成员谋杀副警长", category: "暴力犯罪", crisis: true, crisisType: "谋杀/帮派暴力", summary: "副警长被杀、帮派成员定罪及法律后续。", aspects: ["袭击/谋杀", "帮派背景", "逮捕/定罪", "司法审判", "警局/官方回应"] },
  18: { title: "密歇根办公室枪击", category: "暴力事件", crisis: true, crisisType: "枪击/伤亡", summary: "办公室枪击导致死伤，警方追捕并控制嫌疑人。", aspects: ["枪击发生", "人员伤亡", "嫌疑人行动", "警方追捕/控制", "职场背景"] },
  19: { title: "Brooklyn 警方枪击后骚乱", category: "社会危机", crisis: true, crisisType: "警方枪击/抗议骚乱", summary: "少年被警方射杀后引发抗议、冲突和骚乱。", aspects: ["警方枪击", "抗议/骚乱", "冲突升级", "社区反应", "官方调查/表态"] },
  20: { title: "Qeshm 岛地震", category: "自然灾害", crisis: true, crisisType: "地震", summary: "地震发生、震级、受灾地点、伤亡和破坏。", aspects: ["地震发生", "震感/余震", "人员伤亡", "建筑损毁", "救援/官方通报"] },
  22: { title: "Kraft 工厂枪击/谋杀", category: "暴力犯罪", crisis: true, crisisType: "工厂枪击/谋杀", summary: "工厂员工枪击同事、死亡、指控和调查。", aspects: ["枪击/杀害", "受害者伤亡", "嫌疑人身份", "起诉/谋杀指控", "职场背景"] },
  23: { title: "Mount Cook 登山事故", category: "事故", crisis: true, crisisType: "登山坠落/死亡", summary: "登山者坠落死亡、搜救和事故后续。", aspects: ["坠落/事故发生", "死亡确认", "搜救/遗体寻找", "天气/路线风险", "官方通报"] },
  24: { title: "巴黎珠宝抢劫", category: "犯罪", crisis: true, crisisType: "抢劫/财产犯罪", summary: "珠宝店抢劫、盗窃金额、嫌疑人和追捕。", aspects: ["抢劫实施", "被盗财物", "逃离/追捕", "警方调查", "商店/地点影响"] },
  30: { title: "海底通信电缆中断", category: "基础设施", crisis: true, crisisType: "通信中断", summary: "海底电缆故障导致网络和移动服务受影响。", aspects: ["电缆中断", "服务受影响", "修复/恢复", "运营商通报", "区域影响"] },
  32: { title: "Cumbria 双重谋杀", category: "暴力犯罪", crisis: true, crisisType: "家庭谋杀/审判", summary: "母亲和姐妹被杀，嫌疑人、审判日期和案件进展。", aspects: ["杀害事件", "嫌疑人控制/拘押", "精神健康背景", "审判安排", "警方/司法通报"] },
  33: { title: "Brooklyn 母亲遭枪击案审判", category: "暴力犯罪", crisis: true, crisisType: "枪击/审判", summary: "无辜母亲遭枪击身亡，庭审播放视频证据。", aspects: ["枪击/死亡", "证据展示", "审判过程", "被告指控", "受害者家庭影响"] },
  35: { title: "NFL 球员 DUI 逮捕", category: "法律/公共安全", crisis: true, crisisType: "酒驾/逮捕", summary: "球员因酒驾嫌疑被捕及相关法律后续。", aspects: ["酒驾/违法行为", "逮捕/指控", "球队纪律影响", "过往记录", "公开回应"] },
  37: { title: "印尼 Aceh 地震", category: "自然灾害", crisis: true, crisisType: "地震/伤亡", summary: "6.1 级地震造成死亡、受伤和建筑损坏。", aspects: ["地震发生", "人员伤亡", "建筑倒塌/损毁", "居民反应/恐慌", "救援/医疗转运"] },
  41: { title: "Sudan 轰炸难民营", category: "武装冲突", crisis: true, crisisType: "空袭/难民营", summary: "难民营遭空袭，国际组织谴责并报道影响。", aspects: ["空袭/轰炸", "难民营影响", "人员伤亡/风险", "国际组织回应", "冲突背景"] },
};

const ASPECT_KEYWORDS = {
  "逃脱行为": ["escape", "escaped", "fled", "ran", "running", "lam", "away"],
  "武器与胁迫": ["gun", "armed", "handcuff", "threat", "forced", "pulled"],
  "追捕/搜寻": ["search", "searched", "hunt", "pursuit", "chase", "caught", "captured", "arrested"],
  "法律身份与服刑背景": ["convicted", "serving", "sentence", "prison", "inmate", "molester"],
  "官方通报": ["said", "told", "reported", "announced", "confirmed", "according", "statement"],
  "骚乱升级": ["riot", "riots", "rioting", "clash", "clashes", "battles", "fought", "protest", "protesters"],
  "袭击/纵火": ["attack", "attacked", "bomb", "bombed", "firebomb", "threw", "set", "arson", "burned", "torched"],
  "人员伤亡": ["killed", "killing", "dead", "death", "died", "injured", "injuries", "hurt", "wounded", "casualties"],
  "警方/政府应对": ["police", "arrested", "investigated", "charged", "condemned", "responded", "said"],
  "社会抗议背景": ["protest", "strike", "austerity", "anger", "demonstration", "march", "unrest"],
  "海盗袭击企图": ["pirate", "pirates", "attack", "attacked", "hijack", "attempt"],
  "海军拦截行动": ["navy", "naval", "foiled", "prevented", "thwarted", "intercepted", "rescued"],
  "逮捕/扣押": ["arrested", "detained", "captured", "held", "nabbed", "seized", "charged"],
  "船只保护": ["ship", "vessel", "merchant", "escort", "protected", "saved"],
  "火灾发生": ["fire", "burned", "burns", "blaze", "ignited", "erupted"],
  "纵火/犯罪嫌疑": ["arson", "suspected", "charged", "accused", "set", "criminal", "investigated"],
  "建筑损毁": ["destroyed", "damaged", "collapsed", "burned", "gutted", "ruined"],
  "调查进展": ["investigated", "investigation", "suspected", "confirmed", "found", "ruled"],
  "社区/经营影响": ["closed", "reopened", "affected", "lost", "business", "community", "operating"],
  "消防处置": ["firefighters", "firefighters", "extinguished", "tackled", "contained", "responded"],
  "设施损毁": ["destroyed", "damaged", "collapsed", "burned", "facility", "building"],
  "营业中断/恢复": ["closed", "reopened", "restored", "resumed", "interrupted", "disrupted"],
  "调查/原因": ["investigated", "cause", "caused", "sparked", "triggered", "suspected"],
  "袭击/谋杀": ["killed", "murdered", "shot", "assassinated", "attack", "murder"],
  "帮派背景": ["gang", "gangmember", "gangs", "member"],
  "逮捕/定罪": ["arrested", "convicted", "found", "guilty", "charged", "sentenced"],
  "司法审判": ["trial", "tried", "court", "judge", "pleaded", "sentenced", "convicted"],
  "警局/官方回应": ["police", "sheriff", "deputy", "officer", "said", "announced"],
  "枪击发生": ["shooting", "shot", "shoot", "gunfire", "opened"],
  "嫌疑人行动": ["suspect", "suspected", "fled", "caught", "arrested", "worked", "entered"],
  "警方追捕/控制": ["police", "caught", "arrested", "captured", "search", "pursuit"],
  "职场背景": ["worked", "worker", "employee", "office", "factory", "workplace"],
  "警方枪击": ["police", "shot", "shooting", "killed"],
  "抗议/骚乱": ["protest", "riots", "riot", "clash", "battled", "demonstrators"],
  "冲突升级": ["clash", "battled", "fought", "threw", "attacked", "escalated"],
  "社区反应": ["anger", "mourned", "protested", "reacted", "community", "gathered"],
  "官方调查/表态": ["investigated", "said", "announced", "confirmed", "told", "statement"],
  "地震发生": ["quake", "earthquake", "hit", "struck", "shook", "triggered"],
  "震感/余震": ["shook", "felt", "aftershock", "tremor", "triggered"],
  "救援/官方通报": ["rescued", "evacuated", "transported", "treated", "said", "reported"],
  "枪击/杀害": ["shooting", "shot", "killed", "murder", "attack"],
  "受害者伤亡": ["victim", "victims", "killed", "dead", "death", "injured", "wounded"],
  "嫌疑人身份": ["suspect", "accused", "worker", "employee", "shooter", "charged"],
  "起诉/谋杀指控": ["charged", "accused", "murder", "trial", "convicted", "guilty"],
  "坠落/事故发生": ["fall", "fell", "fallen", "accident", "climbing", "plunged"],
  "死亡确认": ["dead", "died", "death", "killed", "confirmed"],
  "搜救/遗体寻找": ["search", "rescue", "recovered", "found", "retrieved"],
  "天气/路线风险": ["weather", "conditions", "route", "mountain", "climb"],
  "抢劫实施": ["robbed", "robbery", "heist", "stole", "steal", "raid"],
  "被盗财物": ["jewelry", "jewellery", "stolen", "stole", "worth", "million"],
  "逃离/追捕": ["fled", "escaped", "ran", "chased", "search", "hunt"],
  "警方调查": ["police", "investigated", "arrested", "searched", "said"],
  "商店/地点影响": ["store", "shop", "jewelry", "hit", "closed", "damaged"],
  "电缆中断": ["cable", "cut", "cuts", "disrupted", "blocked", "interruption"],
  "服务受影响": ["affected", "blocked", "disrupted", "slowed", "services", "outage"],
  "修复/恢复": ["restored", "repaired", "fixed", "resumed", "restoration"],
  "运营商通报": ["said", "announced", "reported", "confirmed", "operator"],
  "区域影响": ["affected", "areas", "region", "countries", "customers"],
  "杀害事件": ["killed", "murder", "dead", "death", "stabbed", "slain"],
  "嫌疑人控制/拘押": ["held", "arrested", "detained", "locked", "custody", "suspected"],
  "精神健康背景": ["mental", "hospital", "psychiatric", "begged", "health"],
  "审判安排": ["trial", "court", "hearing", "date", "charged"],
  "警方/司法通报": ["police", "court", "prosecutor", "said", "judge"],
  "枪击/死亡": ["shooting", "shot", "dead", "death", "killed"],
  "证据展示": ["video", "footage", "shown", "played", "evidence"],
  "审判过程": ["trial", "court", "jury", "testified", "played"],
  "被告指控": ["charged", "accused", "defendant", "trial", "murder"],
  "受害者家庭影响": ["victim", "mother", "child", "daughter", "family", "mourning"],
  "酒驾/违法行为": ["dui", "drunk", "driving", "arrest", "suspicion"],
  "逮捕/指控": ["arrested", "charged", "faces", "accused", "booked"],
  "球队纪律影响": ["suspended", "team", "chargers", "discipline", "fined"],
  "过往记录": ["history", "prior", "previous", "record", "latest"],
  "公开回应": ["said", "told", "reported", "statement", "commented"],
  "建筑倒塌/损毁": ["collapsed", "damaged", "destroyed", "cracked", "houses"],
  "居民反应/恐慌": ["panic", "panicked", "ran", "fled", "evacuated"],
  "救援/医疗转运": ["rescued", "transported", "treated", "received", "hospital"],
  "空袭/轰炸": ["bombed", "bombing", "air", "attack", "strike", "hit"],
  "难民营影响": ["camp", "refugee", "displaced", "affected", "shelter"],
  "人员伤亡/风险": ["killed", "dead", "injured", "wounded", "risk", "casualties"],
  "国际组织回应": ["condemned", "unhcr", "un", "said", "called"],
  "冲突背景": ["war", "conflict", "fighting", "rebels", "sudan"],
};

const CRISIS_ASPECTS = [
  {
    id: 1,
    name: "事件态势与危险演化",
    meaning: "灾害本身发生了什么、如何变化",
    examples: "地震震级、火势蔓延、洪水水位、余震、爆炸、次生灾害、新威胁、天气变化",
    keywords: [
      "quake", "earthquake", "tremor", "aftershock", "hit", "struck", "shook",
      "fire", "blaze", "burned", "spread", "exploded", "explosion", "blast",
      "shooting", "shot", "attack", "attacked", "bombed", "bombing", "strike",
      "riot", "riots", "clash", "fought", "flood", "storm", "weather", "triggered",
    ],
  },
  {
    id: 2,
    name: "人员影响与脆弱群体",
    meaning: "人受到什么影响",
    examples: "伤亡、失踪、被困、疏散、流离失所、老人儿童病人、受灾群众状态",
    keywords: [
      "killed", "killing", "dead", "death", "died", "injured", "injuries", "hurt",
      "wounded", "casualties", "victim", "victims", "trapped", "missing", "evacuated",
      "displaced", "refugee", "people", "residents", "children", "patients", "suffered",
    ],
  },
  {
    id: 3,
    name: "基础设施与生命线影响",
    meaning: "物理环境和关键服务受损情况",
    examples: "房屋、道路、桥梁、电力、通信、供水、医院、学校、交通、车辆损毁",
    keywords: [
      "collapsed", "damaged", "destroyed", "cracked", "building", "buildings", "house",
      "houses", "road", "roads", "bridge", "power", "electricity", "communication",
      "cable", "service", "services", "hospital", "school", "traffic", "vehicle",
      "closed", "blocked", "disrupted", "interrupted", "cut",
    ],
  },
  {
    id: 4,
    name: "需求与求助",
    meaning: "灾区缺什么、谁在求助",
    examples: "搜救、医疗、食物、水、住所、药品、血液、交通、信息查询、紧急物资",
    keywords: [
      "need", "needed", "needs", "appealed", "appeal", "requested", "request", "asked",
      "search", "rescue", "medical", "medicine", "food", "water", "shelter", "blood",
      "aid", "help", "supplies", "emergency", "transport", "information",
    ],
  },
  {
    id: 5,
    name: "响应、资源与恢复行动",
    meaning: "谁在做什么救援或恢复",
    examples: "政府救援、NGO、志愿者、捐赠、避难所开放、物资发放、清理、服务恢复",
    keywords: [
      "rescued", "rescue", "responded", "sent", "deployed", "treated", "transported",
      "evacuated", "opened", "donated", "donation", "distributed", "cleared", "cleaned",
      "restored", "repaired", "reopened", "resumed", "government", "police", "firefighters",
      "volunteers", "ngo", "unhcr", "shelter",
    ],
  },
  {
    id: 6,
    name: "风险沟通与公众指引",
    meaning: "给公众的警告、建议、行动指令",
    examples: "撤离令、避险提示、封路通知、天气警报、公共卫生建议、官方安全指南",
    keywords: [
      "warned", "warning", "ordered", "order", "urged", "advised", "alert", "evacuate",
      "evacuation", "avoid", "stay", "closed", "closure", "notice", "guidance", "safe",
      "safety", "health", "officials", "authorities",
    ],
  },
  {
    id: 7,
    name: "信息来源、证据与可信度",
    meaning: "这条信息来自哪里、是否可信",
    examples: "官方通报、媒体报道、目击者、转述、图片视频证据、位置线索、谣言、未证实消息",
    keywords: [
      "said", "told", "reported", "according", "announced", "confirmed", "claimed",
      "statement", "witness", "witnesses", "official", "officials", "police", "media",
      "video", "footage", "photo", "evidence", "source", "rumor", "unconfirmed",
    ],
  },
];

const TIME_SOURCE_RANK = {
  TLINK: 0,
  INFERRED_COREF_TIME: 1,
  UNKNOWN_TIME: 2,
};

const el = {
  searchInput: document.querySelector("#searchInput"),
  topicList: document.querySelector("#topicList"),
  docKicker: document.querySelector("#docKicker"),
  docTitle: document.querySelector("#docTitle"),
  articleText: document.querySelector("#articleText"),
  detailBox: document.querySelector("#detailBox"),
  selectionBadge: document.querySelector("#selectionBadge"),
  sentenceCount: document.querySelector("#sentenceCount"),
  plotLinks: document.querySelector("#plotLinks"),
  tlinks: document.querySelector("#tlinks"),
  corefLinks: document.querySelector("#corefLinks"),
  plotCount: document.querySelector("#plotCount"),
  tlinkCount: document.querySelector("#tlinkCount"),
  corefCount: document.querySelector("#corefCount"),
  statsGrid: document.querySelector("#statsGrid"),
  markableList: document.querySelector("#markableList"),
  relationTypeList: document.querySelector("#relationTypeList"),
  markableCount: document.querySelector("#markableCount"),
  topicOverview: document.querySelector("#topicOverview"),
  topicSummaryCount: document.querySelector("#topicSummaryCount"),
  timelineOverview: document.querySelector("#timelineOverview"),
  timelineSummaryCount: document.querySelector("#timelineSummaryCount"),
};

const panelEls = {
  topics: document.querySelector("#topicsPanel"),
  timelines: document.querySelector("#timelinesPanel"),
  overview: document.querySelector("#overviewPanel"),
  relations: document.querySelector("#relationsPanel"),
  raw: document.querySelector("#rawPanel"),
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function markableMap(doc) {
  return new Map(doc.markables.map((m) => [m.id, m]));
}

function textForMarkable(markable) {
  if (!markable) return "未知标注";
  return markable.text || markable.attrs.TAG_DESCRIPTOR || `${markable.tag} #${markable.id}`;
}

function relationLabel(rel) {
  const type = rel.type ? ` ${rel.type}` : "";
  return `${rel.tag}${type}`;
}

function markableHasTlink(doc, markableId) {
  return doc.relations.some((r) => r.tag === "TLINK" && (r.sources.includes(markableId) || r.targets.includes(markableId)));
}

function eventTlinkStats(doc) {
  const events = doc.markables.filter((m) => m.category === "event");
  const withTlink = events.filter((m) => markableHasTlink(doc, m.id)).length;
  return {
    events: events.length,
    withTlink,
    withoutTlink: events.length - withTlink,
  };
}

function translateSentence(text) {
  let translated = String(text || "").toLowerCase();
  const phraseItems = [...PHRASE_TRANSLATIONS].sort((a, b) => b[0].length - a[0].length);
  for (const [source, target] of phraseItems) {
    translated = translated.replace(new RegExp(`\\b${source.replaceAll(" ", "\\s+")}\\b`, "gi"), target);
  }
  translated = translated.replace(/\b[a-z][a-z'-]*\b/gi, (word) => {
    const key = word.toLowerCase().replace(/^'+|'+$/g, "");
    return WORD_TRANSLATIONS[key] || word;
  });
  return translated
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\s+(['’]s)\b/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function getVisibleMarkablesForToken(doc, tokenId) {
  return doc.markables.filter((m) => {
    if (!m.tokens.includes(tokenId)) return false;
    if (m.category === "event" && !state.filters.event) return false;
    if (m.category === "time" && !state.filters.time) return false;
    if (m.category === "entity" && !state.filters.entity) return false;
    if (m.category === "other" && !state.filters.entity) return false;
    return true;
  });
}

function eventKey(doc, markableId) {
  return `${doc.id}#${markableId}`;
}

function firstNumber(values) {
  const value = Array.isArray(values) ? values[0] : values;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 999999;
}

function markableSortPosition(markable) {
  return firstNumber(markable.tokens?.length ? markable.tokens : markable.sentences);
}

function sentenceText(doc, sentenceId) {
  return doc.sentences.find((s) => s.id === String(sentenceId))?.text || "";
}

function timelineLabel(event) {
  if (!event) return "未知事件";
  return `${event.doc.docName}-S${event.sentenceId || "?"}-${event.text}`;
}

function corefClusterId(event) {
  return event?.markable?.crossDocNote || "";
}

function buildTopicContext(topicId) {
  const docs = state.data.docs.filter((doc) => String(doc.topic) === String(topicId));
  const events = new Map();
  const timesByDoc = new Map();
  const eventsByCoref = new Map();

  for (const doc of docs) {
    const markables = markableMap(doc);
    const times = doc.markables.filter((m) => m.category === "time" && m.tokens.length);
    timesByDoc.set(doc.id, times);
    for (const markable of doc.markables) {
      if (markable.category !== "event" || !markable.tokens.length) continue;
      const key = eventKey(doc, markable.id);
      const item = {
        key,
        doc,
        markable,
        text: textForMarkable(markable),
        lower: `${textForMarkable(markable)} ${markable.tag} ${Object.values(markable.attrs || {}).join(" ")}`.toLowerCase(),
        sentenceId: markable.sentences?.[0] || "",
        position: markableSortPosition(markable),
      };
      events.set(key, item);
      if (markable.crossDocNote) {
        const bucket = eventsByCoref.get(markable.crossDocNote) || [];
        bucket.push(key);
        eventsByCoref.set(markable.crossDocNote, bucket);
      }
    }
    doc._viewerMarkableMap = markables;
  }

  const anchors = inferTimeAnchors({ docs, events, timesByDoc, eventsByCoref });
  return { docs, events, timesByDoc, eventsByCoref, anchors };
}

function tlinkAnchor(doc, rel) {
  const map = markableMap(doc);
  const relIds = [...rel.sources, ...rel.targets];
  const time = relIds.map((id) => map.get(id)).find((m) => m && m.category === "time" && textForMarkable(m));
  if (!time) return null;
  return {
    value: textForMarkable(time),
    timeSource: "TLINK",
    timeRelation: rel.type || "REL",
    timeMarkableId: time.id,
    confidence: "gold",
    sortSentence: firstNumber(time.sentences),
    sortToken: markableSortPosition(time),
  };
}

function inferTimeAnchors(ctx) {
  const anchors = new Map();

  for (const doc of ctx.docs) {
    for (const rel of doc.relations.filter((r) => r.tag === "TLINK" && r.type)) {
      const anchor = tlinkAnchor(doc, rel);
      if (!anchor) continue;
      for (const markableId of [...rel.sources, ...rel.targets]) {
        const key = eventKey(doc, markableId);
        if (ctx.events.has(key) && !anchors.has(key)) anchors.set(key, anchor);
      }
    }
  }

  for (const [note, keys] of ctx.eventsByCoref.entries()) {
    const donorKey = keys.find((key) => anchors.has(key));
    if (!donorKey) continue;
    const donor = anchors.get(donorKey);
    for (const key of keys) {
      if (!anchors.has(key)) {
        anchors.set(key, {
          ...donor,
          timeSource: "INFERRED_COREF_TIME",
          confidence: "weak",
          inheritedFrom: donorKey,
          corefNote: note,
        });
      }
    }
  }

  return anchors;
}

function matchesAspect(event, aspect) {
  const keywords = aspect?.keywords || [];
  return keywords.some((keyword) => event.lower.includes(keyword.toLowerCase()));
}

function plotLinksForTopic(ctx) {
  const links = [];
  for (const doc of ctx.docs) {
    for (const rel of doc.relations.filter((r) => r.tag === "PLOT_LINK" && r.type)) {
      for (const sourceId of rel.sources) {
        for (const targetId of rel.targets) {
          const sourceKey = eventKey(doc, sourceId);
          const targetKey = eventKey(doc, targetId);
          if (ctx.events.has(sourceKey) && ctx.events.has(targetKey)) {
            links.push({ doc, rel, sourceKey, targetKey });
          }
        }
      }
    }
  }
  return links;
}

function explicitCausal(rel) {
  return rel.attrs?.CAUSES === "TRUE" || rel.attrs?.CAUSED_BY === "TRUE";
}

function predecessorLinksForSeed(link, seedKeys) {
  const predecessors = [];
  if (link.rel.type === "PRECONDITION" && seedKeys.has(link.targetKey)) {
    predecessors.push({ causeKey: link.sourceKey, seedKey: link.targetKey, role: "前因", source: "PLOT_LINK_PRECONDITION" });
  }
  if (link.rel.type === "FALLING_ACTION" && seedKeys.has(link.sourceKey)) {
    predecessors.push({ causeKey: link.targetKey, seedKey: link.sourceKey, role: "前因", source: "PLOT_LINK_FALLING_ACTION" });
  }
  if (link.rel.attrs?.CAUSES === "TRUE" && seedKeys.has(link.targetKey)) {
    predecessors.push({ causeKey: link.sourceKey, seedKey: link.targetKey, role: "显式前因", source: "PLOT_LINK_CAUSES" });
  }
  if (link.rel.attrs?.CAUSED_BY === "TRUE" && seedKeys.has(link.sourceKey)) {
    predecessors.push({ causeKey: link.targetKey, seedKey: link.sourceKey, role: "显式前因", source: "PLOT_LINK_CAUSED_BY" });
  }
  return predecessors;
}

function representativeEvent(events, anchors) {
  return [...events].sort((a, b) => {
    const aAnchor = anchors.get(a.key);
    const bAnchor = anchors.get(b.key);
    const aTlink = aAnchor?.timeSource === "TLINK" ? 0 : 1;
    const bTlink = bAnchor?.timeSource === "TLINK" ? 0 : 1;
    if (aTlink !== bTlink) return aTlink - bTlink;
    const aTime = aAnchor?.value ? 0 : 1;
    const bTime = bAnchor?.value ? 0 : 1;
    if (aTime !== bTime) return aTime - bTime;
    const doc = a.doc.id.localeCompare(b.doc.id, undefined, { numeric: true });
    if (doc) return doc;
    const sentence = firstNumber(a.markable.sentences) - firstNumber(b.markable.sentences);
    if (sentence) return sentence;
    return a.position - b.position;
  })[0];
}

function mergedTimeAnchor(events, anchors, representative) {
  const candidates = [...events]
    .map((event) => ({ event, anchor: anchors.get(event.key) }))
    .filter((item) => item.anchor?.value);

  if (!candidates.length) {
    return {
      value: "未知时间",
      timeSource: "UNKNOWN_TIME",
      timeRelation: "",
      confidence: "none",
      sortSentence: firstNumber(representative?.markable?.sentences),
      sortToken: representative?.position || 999999,
      candidates: [],
      conflict: false,
    };
  }

  const values = [...new Set(candidates.map((item) => item.anchor.value))];
  const representativeCandidate = candidates.find((item) => item.event.key === representative.key) || candidates[0];
  const anchor = representativeCandidate.anchor;
  const hasConflict = values.length > 1;
  return {
    ...anchor,
    value: hasConflict ? values.join(" / ") : anchor.value,
    timeSource: anchor.timeSource,
    confidence: hasConflict ? "conflict" : anchor.confidence,
    sortSentence: anchor.sortSentence ?? firstNumber(representative?.markable?.sentences),
    sortToken: anchor.sortToken ?? representative?.position ?? 999999,
    candidates: values,
    conflict: hasConflict,
  };
}

function mergeTimelineEntries(entries, ctx) {
  const groups = new Map();

  for (const entry of entries.values()) {
    const event = ctx.events.get(entry.key);
    if (!event) continue;
    const clusterId = corefClusterId(event);
    const groupKey = clusterId ? `coref:${clusterId}` : `single:${entry.key}`;
    const group = groups.get(groupKey) || {
      key: groupKey,
      corefClusterId: clusterId || null,
      entries: [],
      relations: [],
      role: "前因",
      causalSource: "PLOT_LINK",
      seedKeys: new Set(),
    };
    group.entries.push(entry);
    group.relations.push(...entry.relations);
    if (entry.role === "aspect") {
      group.role = "aspect";
      group.causalSource = "ASPECT_SEED";
      group.seedKeys.add(entry.key);
    }
    groups.set(groupKey, group);
  }

  return [...groups.values()].map((group) => {
    const events = group.entries.map((entry) => ctx.events.get(entry.key)).filter(Boolean);
    const representative = representativeEvent(events, ctx.anchors);
    const anchor = mergedTimeAnchor(events, ctx.anchors, representative);
    const variants = [...new Set(events.map((event) => event.text).filter(Boolean))];
    return {
      ...group,
      event: representative,
      anchor,
      displayLabel: timelineLabel(representative),
      mentionCount: events.length,
      variants,
      mentions: events.map((event) => ({
        key: event.key,
        label: timelineLabel(event),
        docName: event.doc.docName,
        sentenceId: event.sentenceId,
        text: event.text,
        hasTlink: ctx.anchors.get(event.key)?.timeSource === "TLINK",
      })),
      timeConflict: anchor.conflict,
    };
  }).filter((item) => item.event);
}

function buildAspectTimeline(topicId, aspect) {
  const ctx = buildTopicContext(topicId);
  const links = plotLinksForTopic(ctx);
  const seedKeys = new Set([...ctx.events.values()].filter((event) => matchesAspect(event, aspect)).map((event) => event.key));
  const included = new Map();

  for (const key of seedKeys) {
    included.set(key, { key, role: "aspect", causalSource: "ASPECT_SEED", relations: [] });
  }

  for (const link of links) {
    for (const predecessor of predecessorLinksForSeed(link, seedKeys)) {
      if (predecessor.causeKey === predecessor.seedKey) continue;
      const causeEvent = ctx.events.get(predecessor.causeKey);
      const seedEvent = ctx.events.get(predecessor.seedKey);
      if (corefClusterId(causeEvent) && corefClusterId(causeEvent) === corefClusterId(seedEvent)) continue;
      const entry = included.get(predecessor.causeKey) || {
        key: predecessor.causeKey,
        role: predecessor.role,
        causalSource: predecessor.source,
        relations: [],
      };
      entry.relations.push({
        type: link.rel.type,
        sourceKey: link.sourceKey,
        targetKey: link.targetKey,
        seedKey: predecessor.seedKey,
        causes: link.rel.attrs?.CAUSES || "",
        causedBy: link.rel.attrs?.CAUSED_BY || "",
        origin: link.rel.attrs?.origin || "",
        strength: explicitCausal(link.rel) ? "explicit" : "plot_link",
      });
      included.set(predecessor.causeKey, entry);
    }
  }

  const items = mergeTimelineEntries(included, ctx);

  items.sort((a, b) => {
    const rank = (TIME_SOURCE_RANK[a.anchor.timeSource] ?? 9) - (TIME_SOURCE_RANK[b.anchor.timeSource] ?? 9);
    if (rank) return rank;
    const sentence = a.anchor.sortSentence - b.anchor.sortSentence;
    if (sentence) return sentence;
    const doc = a.event.doc.id.localeCompare(b.event.doc.id, undefined, { numeric: true });
    if (doc) return doc;
    return a.event.position - b.event.position;
  });

  return {
    topicId,
    aspect,
    aspectId: aspect.id,
    aspectName: aspect.name,
    seedCount: seedKeys.size,
    causalCount: items.filter((item) => item.causalSource !== "ASPECT_SEED").length,
    mergedCount: items.filter((item) => item.mentionCount > 1).length,
    conflictCount: items.filter((item) => item.timeConflict).length,
    items,
  };
}

function renderTopics() {
  const query = el.searchInput.value.trim().toLowerCase();
  el.topicList.innerHTML = "";

  for (const topic of state.data.topics) {
    const docs = topic.docs.filter((doc) => {
      const haystack = `${topic.id} ${doc.id} ${doc.docName} ${doc.title}`.toLowerCase();
      return !query || haystack.includes(query);
    });
    if (!docs.length) continue;

    const card = document.createElement("section");
    card.className = "topic-card";
    const header = document.createElement("button");
    header.className = "topic-header";
    header.type = "button";
    header.innerHTML = `<strong>主题 ${escapeHtml(topic.id)}</strong><span>${docs.length} 篇文档</span>`;
    const list = document.createElement("div");
    list.className = "doc-list";
    for (const doc of docs) {
      const button = document.createElement("button");
      button.className = `doc-button${state.currentDoc?.id === doc.id ? " active" : ""}`;
      button.type = "button";
      button.innerHTML = `
        <strong>${escapeHtml(doc.docName)}</strong>
        <span>${escapeHtml(doc.title || "无标题")}</span>
      `;
      button.addEventListener("click", () => selectDoc(doc.id));
      list.append(button);
    }
    header.addEventListener("click", () => list.classList.toggle("hidden"));
    card.append(header, list);
    el.topicList.append(card);
  }
}

function selectDoc(docId) {
  state.currentDoc = state.docsById.get(docId);
  state.selectedMarkableId = null;
  renderAll();
}

function renderAll() {
  renderTopics();
  renderTopicOverview();
  if (state.activePanel === "timelines") renderCrisisTimelines();
  renderHeader();
  renderArticle();
  renderDetail();
  renderRelations();
  renderRaw();
}

function renderTopicOverview() {
  if (!state.data || !el.topicOverview) return;
  const crisisCount = state.data.topics.filter((topic) => TOPIC_OVERVIEW[topic.id]?.crisis).length;
  el.topicSummaryCount.textContent = `${crisisCount} / ${state.data.topics.length} 个 crisis 相关主题 · 统一 ${CRISIS_ASPECTS.length} 个 aspect`;
  el.topicOverview.innerHTML = state.data.topics.map((topic) => {
    const meta = TOPIC_OVERVIEW[topic.id] || {
      title: `主题 ${topic.id}`,
      category: "未分类",
      crisis: false,
      crisisType: "未标注",
      summary: topic.docs[0]?.title || "暂无摘要",
    };
    const firstDoc = topic.docs[0]?.id || "";
    const stats = topic.stats || {};
    const aspectPills = meta.crisis
      ? CRISIS_ASPECTS.map((aspect) => `<span class="aspect-chip aspect-${aspect.id}" title="${escapeHtml(aspect.examples)}">${escapeHtml(aspect.id)}. ${escapeHtml(aspect.name)}</span>`).join("")
      : `<span>非 crisis 主题暂不构建统一 crisis aspect timeline</span>`;
    return `
      <article class="topic-summary-card ${meta.crisis ? "crisis-topic" : "non-crisis-topic"}">
        <div class="topic-summary-head">
          <div>
            <span class="topic-id">主题 ${escapeHtml(topic.id)}</span>
            <h4>${escapeHtml(meta.title)}</h4>
          </div>
          <span class="crisis-badge ${meta.crisis ? "is-crisis" : "not-crisis"}">${escapeHtml(meta.crisis ? "CRISIS" : "非 crisis")}</span>
        </div>
        <p>${escapeHtml(meta.summary)}</p>
        <div class="pill-row">
          <span class="pill">${escapeHtml(meta.category)}</span>
          <span class="pill ${meta.crisis ? "crisis-kind" : ""}">${escapeHtml(meta.crisisType)}</span>
        </div>
        <div class="aspect-block">
          <h5>${meta.crisis ? "统一 Crisis Aspect" : "Aspect 状态"}</h5>
          <div class="aspect-list">
            ${aspectPills}
          </div>
        </div>
        <div class="topic-stat-row">
          <span><strong>${escapeHtml(topic.docs.length)}</strong> 文档</span>
          <span><strong>${escapeHtml(stats.events ?? 0)}</strong> 事件</span>
          <span><strong>${escapeHtml(stats.tlinks ?? 0)}</strong> TLINK</span>
          <span><strong>${escapeHtml(stats.plotLinks ?? 0)}</strong> PLOT_LINK</span>
        </div>
        ${firstDoc ? `<button type="button" class="open-topic-button" data-topic-doc="${escapeHtml(firstDoc)}">查看第一篇文档</button>` : ""}
      </article>
    `;
  }).join("");

  el.topicOverview.querySelectorAll("[data-topic-doc]").forEach((button) => {
    button.addEventListener("click", () => {
      selectDoc(button.dataset.topicDoc);
      showPanel("overview");
    });
  });
}

function timeSourceLabel(source) {
  const labels = {
    TLINK: "TLINK",
    INFERRED_COREF_TIME: "共指继承",
    UNKNOWN_TIME: "未知时间",
  };
  return labels[source] || source;
}

function relationSummary(item) {
  if (!item.relations.length) return item.causalSource;
  return item.relations.map((rel) => {
    const strong = rel.causes === "TRUE" || rel.causedBy === "TRUE" ? "显式因果" : rel.type;
    return `${strong}${rel.origin ? `/${rel.origin}` : ""}`;
  }).join(", ");
}

function renderCrisisTimelines() {
  if (!state.data || !el.timelineOverview) return;
  const crisisTopics = state.data.topics.filter((topic) => TOPIC_OVERVIEW[topic.id]?.crisis);
  const totalAspects = crisisTopics.length * CRISIS_ASPECTS.length;
  el.timelineSummaryCount.textContent = `${crisisTopics.length} 个 crisis 主题 / ${totalAspects} 条统一 aspect timeline`;

  el.timelineOverview.innerHTML = crisisTopics.map((topic) => {
    const meta = TOPIC_OVERVIEW[topic.id];
    const timelines = CRISIS_ASPECTS.map((aspect) => buildAspectTimeline(topic.id, aspect));
    return `
      <section class="timeline-topic">
        <div class="timeline-topic-head">
          <div>
            <span class="topic-id">主题 ${escapeHtml(topic.id)} · ${escapeHtml(meta.crisisType)}</span>
            <h4>${escapeHtml(meta.title)}</h4>
          </div>
          <span class="crisis-badge is-crisis">CRISIS</span>
        </div>
        <div class="aspect-timeline-grid">
          ${timelines.map((timeline) => renderAspectTimeline(timeline)).join("")}
        </div>
      </section>
    `;
  }).join("");

  el.timelineOverview.querySelectorAll("[data-timeline-jump]").forEach((button) => {
    button.addEventListener("click", () => {
      const [docId, markableId] = button.dataset.timelineJump.split("#");
      state.currentDoc = state.docsById.get(docId);
      state.selectedMarkableId = markableId;
      showPanel("overview");
      renderAll();
      const mark = document.querySelector(`[data-markable="${CSS.escape(markableId)}"]`);
      if (mark) mark.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  });
}

function renderAspectTimeline(timeline) {
  const visibleItems = timeline.items;
  const empty = !visibleItems.length;
  return `
    <article class="aspect-timeline-card aspect-${escapeHtml(timeline.aspectId)}">
      <div class="aspect-timeline-head">
        <h5>${escapeHtml(timeline.aspectId)}. ${escapeHtml(timeline.aspectName)}</h5>
        <span>${escapeHtml(timeline.seedCount)} seed / ${escapeHtml(timeline.causalCount)} 前因 / ${escapeHtml(timeline.mergedCount)} 合并</span>
      </div>
      <p class="aspect-meaning">${escapeHtml(timeline.aspect.meaning)}</p>
      ${empty ? `<p class="empty-state">这个 aspect 没有匹配到可显示的事件。</p>` : `
        <div class="timeline-list">
          ${visibleItems.map((item) => renderTimelineItem(item)).join("")}
        </div>
      `}
    </article>
  `;
}

function renderTimelineItem(item) {
  const event = item.event;
  const sentence = sentenceText(event.doc, event.sentenceId);
  const sourceClass = item.anchor.timeSource.toLowerCase().replaceAll("_", "-");
  const roleClass = item.role === "aspect" ? "seed" : "context";
  const jumpKey = event.key;
  const variantText = item.variants.length > 1 ? `变体：${item.variants.join(" / ")}` : "";
  const mentionText = item.mentionCount > 1 ? `共指合并 ${item.mentionCount} mentions` : "单一 mention";
  return `
    <div class="timeline-item ${roleClass}">
      <div class="timeline-dot"></div>
      <div class="timeline-item-main">
        <div class="timeline-item-title">
          <button type="button" data-timeline-jump="${escapeHtml(jumpKey)}">${escapeHtml(item.displayLabel)}</button>
          <span class="timeline-role">${escapeHtml(item.role)}</span>
        </div>
        <div class="timeline-meta">
          <span class="time-chip ${sourceClass}">${escapeHtml(timeSourceLabel(item.anchor.timeSource))}</span>
          <span>${escapeHtml(item.anchor.value)}</span>
          ${item.timeConflict ? `<span class="time-conflict">时间冲突</span>` : ""}
          ${item.anchor.timeRelation ? `<span>${escapeHtml(item.anchor.timeRelation)}</span>` : ""}
          ${item.corefClusterId ? `<span>共指簇 ${escapeHtml(item.corefClusterId)}</span>` : ""}
          <span>${escapeHtml(mentionText)}</span>
        </div>
        <p>${escapeHtml(sentence || event.doc.title || "")}</p>
        ${variantText ? `<div class="timeline-variants">${escapeHtml(variantText)}</div>` : ""}
        <div class="timeline-causal">${escapeHtml(relationSummary(item))}</div>
      </div>
    </div>
  `;
}

function renderHeader() {
  const doc = state.currentDoc;
  if (!doc) return;
  el.docKicker.textContent = `主题 ${doc.topic} / ${doc.docName} / ${doc.path}`;
  el.docTitle.textContent = doc.title || doc.docName;
  el.sentenceCount.textContent = `${doc.stats.sentences} 句`;
}

function renderArticle() {
  const doc = state.currentDoc;
  if (!doc) return;

  const tokenById = new Map(doc.tokens.map((t) => [t.id, t]));
  const rows = doc.sentences.map((sentence) => {
    const tokenHtml = sentence.tokens.map((tid) => {
      const token = tokenById.get(tid);
      if (!token) return "";
      const marks = getVisibleMarkablesForToken(doc, tid);
      if (!marks.length) return escapeHtml(token.text);
      const preferred = marks.find((m) => m.category === "event") || marks.find((m) => m.category === "time") || marks[0];
      const classes = ["token-mark", preferred.category];
      if (preferred.category === "event") {
        classes.push(markableHasTlink(doc, preferred.id) ? "has-tlink" : "no-tlink");
      }
      if (state.filters.coref && marks.some((m) => m.crossDocNote)) classes.push("coref");
      if (marks.some((m) => m.id === state.selectedMarkableId)) classes.push("selected");
      const title = marks.map((m) => `${m.id} ${m.tag} ${textForMarkable(m)}`).join("\n");
      return `<button class="${classes.join(" ")}" data-markable="${escapeHtml(preferred.id)}" title="${escapeHtml(title)}">${escapeHtml(token.text)}</button>`;
    }).join(" ");
    const translation = state.filters.translation
      ? `<p class="translation">译文：${escapeHtml(translateSentence(sentence.text))}</p>`
      : "";
    return `
      <div class="sentence-block">
        <p class="sentence" data-sid="${escapeHtml(sentence.id)}">${tokenHtml}</p>
        ${translation}
      </div>
    `;
  });

  el.articleText.innerHTML = rows.join("");
  el.articleText.querySelectorAll("[data-markable]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedMarkableId = button.dataset.markable;
      renderAll();
      button.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  });
}

function renderDetail() {
  const doc = state.currentDoc;
  if (!doc) return;
  const map = markableMap(doc);
  const selected = state.selectedMarkableId ? map.get(state.selectedMarkableId) : null;
  if (!selected) {
    el.selectionBadge.textContent = "未选择";
    el.detailBox.innerHTML = `
      <p class="empty-state">点击正文里带颜色的词，就能看到它对应的 XML 标注、时间关系、故事线关系和跨文档共指编号。</p>
      <div class="pill-row">
        <span class="pill event">蓝色：事件</span>
        <span class="pill time">绿色：时间</span>
        <span class="pill coref">红框：跨文档共指</span>
      </div>
    `;
    return;
  }

  el.selectionBadge.textContent = `m_id=${selected.id}`;
  const related = doc.relations.filter((r) => r.sources.includes(selected.id) || r.targets.includes(selected.id));
  const attrs = Object.entries(selected.attrs || {})
    .filter(([, value]) => value !== "")
    .map(([key, value]) => `<div class="attr"><strong>${escapeHtml(key)}</strong><span>${escapeHtml(value)}</span></div>`)
    .join("");
  const relatedHtml = related.length
    ? related.map((rel) => relationLine(rel, map)).join("")
    : `<p class="empty-state">这个标注没有直接连到关系。比如有些事件被圈出来了，但没有 TLINK 时间关系。</p>`;

  el.detailBox.innerHTML = `
    <h4 class="detail-title">${escapeHtml(textForMarkable(selected))}</h4>
    <div class="pill-row">
      <span class="pill ${selected.category}">${escapeHtml(selected.tag)}</span>
      <span class="pill">m_id=${escapeHtml(selected.id)}</span>
      ${selected.crossDocNote ? `<span class="pill coref">共指 ${escapeHtml(selected.crossDocNote)}</span>` : ""}
      ${selected.category === "event" ? `<span class="pill ${markableHasTlink(doc, selected.id) ? "tlink-yes" : "tlink-no"}">${markableHasTlink(doc, selected.id) ? "有 TLINK" : "无 TLINK"}</span>` : ""}
      ${selected.sentences?.length ? `<span class="pill">句子 ${escapeHtml(selected.sentences.join(", "))}</span>` : ""}
    </div>
    <div class="attrs">
      <div class="attr"><strong>token_anchor</strong><span>${escapeHtml(selected.tokens.join(", ") || "无")}</span></div>
      ${attrs}
    </div>
    <div class="section-heading"><h3>相关关系</h3><span>${related.length}</span></div>
    <div class="relation-list">${relatedHtml}</div>
  `;
}

function relationLine(rel, map) {
  const source = rel.sources.map((id) => linkMarkable(id, map)).join(", ");
  const target = rel.targets.map((id) => linkMarkable(id, map)).join(", ");
  const pillClass = rel.tag === "PLOT_LINK" ? "plot" : rel.tag === "TLINK" ? "time" : "coref";
  return `
    <div class="relation-item">
      <div class="pill-row">
        <span class="pill ${pillClass}">${escapeHtml(relationLabel(rel))}</span>
        ${rel.attrs.origin ? `<span class="pill">${escapeHtml(rel.attrs.origin)}</span>` : ""}
        ${rel.attrs.validated ? `<span class="pill">validated=${escapeHtml(rel.attrs.validated)}</span>` : ""}
      </div>
      <div class="relation-main">
        <div>${source || "无 source"} <span class="relation-arrow">→</span> ${target || "无 target"}</div>
      </div>
    </div>
  `;
}

function linkMarkable(id, map) {
  const markable = map.get(id);
  const label = markable ? `${id} ${textForMarkable(markable)}` : id;
  return `<button type="button" data-jump="${escapeHtml(id)}">${escapeHtml(label)}</button>`;
}

function renderRelations() {
  const doc = state.currentDoc;
  if (!doc) return;
  const map = markableMap(doc);
  const plots = doc.relations.filter((r) => r.tag === "PLOT_LINK");
  const tlinks = doc.relations.filter((r) => r.tag === "TLINK");

  el.plotCount.textContent = plots.length;
  el.tlinkCount.textContent = tlinks.length;
  el.corefCount.textContent = doc.crossDoc.length;
  el.plotLinks.innerHTML = plots.length ? plots.map((r) => relationLine(r, map)).join("") : `<p class="empty-state">这篇文档没有 PLOT_LINK。</p>`;
  el.tlinks.innerHTML = tlinks.length ? tlinks.map((r) => relationLine(r, map)).join("") : `<p class="empty-state">这篇文档没有 TLINK。</p>`;
  el.corefLinks.innerHTML = doc.crossDoc.length ? doc.crossDoc.map((cluster) => {
    const sources = cluster.sources.map((id) => linkMarkable(id, map)).join(", ") || "无本地 source";
    return `
      <div class="relation-item">
        <div class="pill-row"><span class="pill coref">${escapeHtml(cluster.note)}</span></div>
        <div class="relation-main"><div>${sources}</div></div>
      </div>
    `;
  }).join("") : `<p class="empty-state">没有找到对应的 ECB+ 跨文档共指。</p>`;

  document.querySelectorAll("[data-jump]").forEach((button) => {
    button.addEventListener("click", () => jumpToMarkable(button.dataset.jump));
  });
}

function jumpToMarkable(id) {
  state.selectedMarkableId = id;
  state.activePanel = "overview";
  showPanel("overview");
  renderAll();
  const button = document.querySelector(`[data-markable="${CSS.escape(id)}"]`);
  if (button) button.scrollIntoView({ block: "center", behavior: "smooth" });
}

function renderRaw() {
  const doc = state.currentDoc;
  if (!doc) return;
  const stats = [
    ["tokens", "Token"],
    ["sentences", "句子"],
    ["markables", "标注"],
    ["events", "事件"],
    ["times", "时间"],
    ["tlinks", "TLINK"],
    ["plotLinks", "PLOT_LINK"],
    ["crossDocClusters", "共指簇"],
    ["eventsWithoutTLINK", "无 TLINK 事件"],
  ];
  const tlinkStats = eventTlinkStats(doc);
  el.statsGrid.innerHTML = stats.map(([key, label]) => `
    <div class="stat-card"><strong>${escapeHtml(doc.stats[key] ?? 0)}</strong><span>${escapeHtml(label)}</span></div>
  `).join("") + `
    <div class="stat-card"><strong>${escapeHtml(tlinkStats.withTlink)}</strong><span>有 TLINK 事件</span></div>
    <div class="stat-card"><strong>${escapeHtml(tlinkStats.withoutTlink)}</strong><span>无 TLINK 事件</span></div>
  `;

  el.markableCount.textContent = doc.markables.length;
  el.markableList.innerHTML = doc.markables.map((m) => `
    <div class="compact-item">
      <strong>${escapeHtml(m.id)} · ${escapeHtml(m.tag)}</strong>
      ${m.category === "event" ? `<span class="mini-status ${markableHasTlink(doc, m.id) ? "yes" : "no"}">${markableHasTlink(doc, m.id) ? "有 TLINK" : "无 TLINK"}</span>` : ""}
      <button type="button" data-jump="${escapeHtml(m.id)}">${escapeHtml(textForMarkable(m))}</button>
    </div>
  `).join("");
  const relationTypes = Object.entries(doc.relationTypeCounts).sort((a, b) => b[1] - a[1]);
  el.relationTypeList.innerHTML = relationTypes.map(([name, count]) => `
    <div class="compact-item"><strong>${escapeHtml(count)}</strong>${escapeHtml(name)}</div>
  `).join("");

  document.querySelectorAll("[data-jump]").forEach((button) => {
    button.addEventListener("click", () => jumpToMarkable(button.dataset.jump));
  });
}

function showPanel(panel) {
  state.activePanel = panel;
  Object.entries(panelEls).forEach(([name, node]) => {
    node.classList.toggle("hidden", name !== panel);
  });
  document.querySelectorAll("[data-panel]").forEach((button) => {
    button.classList.toggle("active", button.dataset.panel === panel);
  });
  if (panel === "timelines") renderCrisisTimelines();
}

function wireEvents() {
  el.searchInput.addEventListener("input", renderTopics);
  document.querySelectorAll("[data-panel]").forEach((button) => {
    button.addEventListener("click", () => showPanel(button.dataset.panel));
  });
  document.querySelector("#toggleEvents").addEventListener("change", (event) => {
    state.filters.event = event.target.checked;
    renderArticle();
  });
  document.querySelector("#toggleTimes").addEventListener("change", (event) => {
    state.filters.time = event.target.checked;
    renderArticle();
  });
  document.querySelector("#toggleEntities").addEventListener("change", (event) => {
    state.filters.entity = event.target.checked;
    renderArticle();
  });
  document.querySelector("#toggleCoref").addEventListener("change", (event) => {
    state.filters.coref = event.target.checked;
    renderArticle();
  });
  document.querySelector("#toggleTranslation").addEventListener("change", (event) => {
    state.filters.translation = event.target.checked;
    renderArticle();
  });
}

async function init() {
  wireEvents();
  if (window.V15_DATA) {
    state.data = window.V15_DATA;
  } else {
    const response = await fetch("data/v15_index.json");
    state.data = await response.json();
  }
  for (const doc of state.data.docs) {
    state.docsById.set(doc.id, doc);
  }
  const firstDoc = state.data.docs.find((doc) => doc.id === "1/1_1ecbplus.xml") || state.data.docs[0];
  state.currentDoc = firstDoc;
  showPanel("overview");
  renderAll();
}

init().catch((error) => {
  console.error(error);
  el.docTitle.textContent = "数据加载失败";
  el.detailBox.innerHTML = `<p class="empty-state">请确认已经运行 build_data.py，并通过本地 HTTP 服务打开这个页面。</p>`;
});
