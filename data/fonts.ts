
import { AsciiFont } from '../types';

const NORMAL_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// Helpers
const createMap = (source: string, target: string): Record<string, string> => {
  const map: Record<string, string> = {};
  const sourceArr = Array.from(source);
  const targetArr = Array.from(target);
  
  for (let i = 0; i < sourceArr.length; i++) {
    if (targetArr[i]) map[sourceArr[i]] = targetArr[i];
  }
  return map;
};

const createCombiningMap = (source: string, combiningChar: string): Record<string, string> => {
  const map: Record<string, string> = {};
  for (let i = 0; i < source.length; i++) {
    map[source[i]] = source[i] + combiningChar;
  }
  return map;
};

export const FONTS: AsciiFont[] = [
  { id: 'normal', name: 'Normal (Default)', map: {} },
  { id: 'monospace', name: 'Monospace', map: createMap(NORMAL_CHARS, "𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿") },
  { id: 'bold_serif', name: 'Bold Serif', map: createMap(NORMAL_CHARS, "𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗") },
  { id: 'bold_sans', name: 'Bold Sans', map: createMap(NORMAL_CHARS, "𝗮𝗯𝗰𝗱𝗲𝚏𝗴𝗵𝗶𝗷𝗸𝗹𝚖𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵") },
  { id: 'italic_serif', name: 'Italic Serif', map: createMap(NORMAL_CHARS, "𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧𝐴𝐵𝐶𝐷𝐸𝐹𝐺𝐻𝐼𝐽𝐾𝐿𝑀𝑁𝑂𝑃𝑄𝑅𝑆𝑇𝑈𝑉𝑊𝑋𝑌𝑍0123456789") },
  { id: 'italic_sans', name: 'Italic Sans', map: createMap(NORMAL_CHARS, "𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡0123456789") },
  { id: 'bold_italic_serif', name: 'Bold Italic Serif', map: createMap(NORMAL_CHARS, "𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛𝑨𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑱𝑲𝑳𝑴𝑵𝑶𝑷𝑸𝑹𝑺𝑻𝑼𝑽𝑾𝑿𝒀𝒁𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗") },
  { id: 'bold_italic_sans', name: 'Bold Italic Sans', map: createMap(NORMAL_CHARS, "𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕0123456789") },
  { id: 'script', name: 'Script', map: createMap(NORMAL_CHARS, "𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵0123456789") },
  { id: 'bold_script', name: 'Bold Script', map: createMap(NORMAL_CHARS, "𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩0123456789") },
  { id: 'gothic', name: 'Gothic', map: createMap(NORMAL_CHARS, "𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔲𝔳𝔴𝔵𝔶𝔷0123456789") },
  { id: 'bold_gothic', name: 'Bold Gothic', map: createMap(NORMAL_CHARS, "𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅0123456789") },
  { id: 'double_struck', name: 'Double Struck', map: createMap(NORMAL_CHARS, "𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡") },
  { id: 'bubble', name: 'Bubble', map: createMap(NORMAL_CHARS, "ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ⓪①②③④⑤⑥⑦⑧⑨") },
  { id: 'bubble_black', name: 'Bubble Filled', map: createMap(NORMAL_CHARS, "🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩⓿❶❷❸❹❺❻❼❽❾") },
  { id: 'square', name: 'Square', map: createMap(NORMAL_CHARS, "𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉0123456789") }, 
  { id: 'square_filled', name: 'Square Filled', map: createMap(NORMAL_CHARS, "▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀🅰🅱🅲🅳🅴🅵🅶🅷🅸🉹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉0123456789") }, 
  { id: 'flags', name: 'Flags', map: createMap("abcdefghijklmnopqrstuvwxyz", "🇦🇧🇨🇩🇪🇫🇬🇭🇮🇯🇰🇱🇲🇳🇴🇵🇶🇷🇸🇹🇺🇻🇼🇽🇾🇿") },
  { id: 'square_brackets', name: 'Square Brackets', map: createMap(NORMAL_CHARS, "[a][b][c][d][e][f][g][h][i][j][k][l][m][n][o][p][q][r][s][t][u][v][w][x][y][z][A][B][C][D][E][F][G][H][I][J][K][L][M][N][O][P][Q][R][S][T][U][V][W][X][Y][Z][0][1][2][3][4][5][6][7][8][9]") },
  { id: 'curly', name: 'Curly', map: createMap(NORMAL_CHARS, "❴a❵❴b❵❴c❵❴d❵❴e❵❴f❵❴g❵❴h❵❴i❵❴j❵❴k❵❴l❵❴m❵❴n❵❴o❵❴p❵❴q❵❴r❵❴s❵❴t❵❴u❵❴v❵❴w❵❴x❵❴y❵❴z❵❴A❵❴B❵❴C❵❴D❵❴E❵❴F❵❴G❵❴H❵❴I❵❴J❵❴K❵❴L❵❴M❵❴N❵❴O❵❴P❵❴Q❵❴R❵❴S❵❴T❵❴U❵❴V❵❴W❵❴X❵❴Y❵❴Z❵❴0❵❴1❵❴2❵❴3❵❴4❵❴5❵❴6❵❴7❵❴8❵❴9❵") },
  { id: 'strikethrough', name: 'Strikethrough', map: createCombiningMap(NORMAL_CHARS, '\u0336') },
  { id: 'tilde_strike', name: 'Tilde Strike', map: createCombiningMap(NORMAL_CHARS, '\u0334') },
  { id: 'slash_strike', name: 'Slash Strike', map: createCombiningMap(NORMAL_CHARS, '\u0337') },
  { id: 'underline', name: 'Underline', map: createCombiningMap(NORMAL_CHARS, '\u0332') },
  { id: 'double_underline', name: 'Double Underline', map: createCombiningMap(NORMAL_CHARS, '\u0333') },
  { id: 'seagull', name: 'Seagull (Below)', map: createCombiningMap(NORMAL_CHARS, '\u033C') },
  { id: 'cross_above', name: 'Cross Above', map: createCombiningMap(NORMAL_CHARS, '\u033D') },
  { id: 'cloudy', name: 'Cloudy', map: createCombiningMap(NORMAL_CHARS, '҈') },
  { id: 'stinky', name: 'Stinky', map: createCombiningMap(NORMAL_CHARS, '҉') },
  { id: 'wide', name: 'Wide / Vaporwave', map: createMap(NORMAL_CHARS, "ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ０１𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗") },
  { id: 'greek', name: 'Pseudo-Greek', map: createMap(NORMAL_CHARS, "αвc∂єƒgнιנкℓмиσρqяѕтυνωχуzΑΒCDΕFGΗΙJΚLΜΝΟΡQRSΤUVWΧΥΖ0123456789") },
  { id: 'runic', name: 'Runic Style', map: createMap(NORMAL_CHARS, "ᚪᛒᚳᛞᛖᚠᚷᚻᛁᛃᚲᛚᛗᚾᚢᛈᛩᚱᛋᛏᚣᚡᚹᛪᚤᛎᚪᛒᚳᛞᛖᚠᚷᚻᛁᛃᚲᛚᛗᚾᚢᛈᛩᚱᛋᛏᚣᚡᚹᛪᚤᛎ0123456789") },
  { id: 'russian', name: 'Pseudo-Cyrillic', map: createMap(NORMAL_CHARS, "аъсdэfGнїjкlмиорqяsтцvшхyzАБCDЭFGНЇJКLМИОPQЯSТЦVШХYZ0123456789") },
  { id: 'tiny', name: 'Tiny / Superscript', map: createMap(NORMAL_CHARS, "ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖqʳˢᵗᵘᵛʷˣʸᶻᴬᴮᶜᴰᴱᶠᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾQᴿˢᵀᵁⱽᵂˣʸᶻ⁰¹²³⁴⁵⁶⁷⁸⁹") },
  { id: 'subscript', name: 'Subscript', map: createMap(NORMAL_CHARS, "ₐbcdₑfgₕᵢⱼₖₗₘₙₒₚqᵣₛₜᵤᵥwxyzₐBCDₑFGₕᵢⱼₖₗₘₙₒₚQᵣₛₜᵤᵥWXYZ₀₁₂₃₄₅₆₇₈₉") },
  { id: 'small_caps', name: 'Small Caps', map: createMap("abcdefghijklmnopqrstuvwxyz", "ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ") },
  { id: 'upside_down', name: 'Flip / Upside Down', map: createMap(NORMAL_CHARS, "ɐqɔpǝɟƃɥıɾʞlɯuodbɹsʇnʌʍxʎz∀qƆpƎℲ⅁HIſʞ˥WNOԀQᴚS┴∩ΛMX⅄Z0123456789") },
  { id: 'spaced', name: 'S p a c e d', map: createMap(NORMAL_CHARS, "a b c d e f g h i j k l m n o p q r s t u v w x y z A B C D E F G H I J K L M N O P Q R S T U V W X Y Z 0 1 2 3 4 5 6 7 8 9") },
  { id: 'currency', name: 'Currency', map: createMap(NORMAL_CHARS, "₳฿₵ĐɆ₣₲ⱧłJ₭Ⱡ₥₦Ø₱QⱤ₴₮ɄV₩Ӿ¥Ⱬ₳฿₵ĐɆ₣₲ⱧłJ₭Ⱡ₥₦Ø₱QⱤ₴₮ɄV₩Ӿ¥Ⱬ0123456789") },
  { id: 'asian_style', name: 'Asian Style', map: createMap(NORMAL_CHARS, "卂乃匚刀乇下厶卄工丁长乚爪𠘨口尸㔿尺丂丅凵リ山乂丫乙卂乃匚刀乇下厶卄工丁长乚爪𠘨口尸㔿尺丂丅凵リ山乂丫乙0123456789") },
  { id: 'brackets', name: 'Parenthesized', map: createMap(NORMAL_CHARS, "⒜⒝⒞⒟⒠⒡⒢⒣⒤⒥⒦⒧⒨⒩⒪⒫⒬⒭⒮t⒳⒱⒲⒳⒴⒵⒜⒝⒞⒟⒠⒡⒢⒣⒤⒥⒦⒧⒨⒩⒪⒫⒬⒭⒮⒯⒰⒱⒲⒳⒴⒵0⑴⑵⑶⑷⑸⑹⑺⑻⑼") },
  { id: 'magic', name: 'Magic', map: createMap(NORMAL_CHARS, "ᗩᗷᑕᗪEᖴGᕼIᒍKᒪᗰᑎOᑭᑫᖇᔕTᑌᐯᗯ᙭YᘔᗩᗷᑕᗪEᖴGᕼIᒍKᒪᗰᑎOᑭᑫᖇᔕTᑌᐯᗯ᙭Yᘔ0123456789") },
  { id: 'cute', name: 'Cute', map: createMap(NORMAL_CHARS, "αвcdeғɢнιjĸlмɴopqrѕтυvwxyzαвcdeғɢнιjĸlмɴopqrѕтυvwxyz0123456789") },
  { id: 'blocky', name: 'Blocky', map: createMap(NORMAL_CHARS, "ﾑ乃cd乇fGんﾉjズﾚﾶ刀のpqr丂ｲu√wﾒﾘzﾑ乃cd乇fGんﾉjズﾚﾶ刀のpqr丂ｲu√wﾒﾘz0123456789") },
  { id: 'l33t', name: 'L33t Speak', map: createMap("abcdefghijklmnopqrstuvwxyz", "48cd3f6h1jklmn0pqr57uvwxyz") },
];

export const SMALL_CAPS_MAP = createMap("abcdefghijklmnopqrstuvwxyz", "ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ");
export const INVERTED_MAP = createMap(NORMAL_CHARS, "ɐqɔpǝɟƃɥıɾʞlɯuodbɹsʇnʌʍxʎz∀qƆpƎℲ⅁HIſʞ˥WNOԀQᴚS┴∩ΛMX⅄Z0123456789");
export const DRAWING_CHARS = ['█','▓','▒','░','▄','▀','▌','▐','■','▪','●','○','◆','◇','★','☆','☺','☹','♥','♦','♣','♠','┼','─','│','┌','┐','└','┘',' '];

export const ASCII_DENSITY_SETS = {
  standard: 'Ñ@#W$9876543210?!abc;:+=-,._                    ',
  detailed: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. ',
  simple: '#+-. ',
  blocks: '█▓▒░ ',
  binary: '01 ',
  matrix: ' 01ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ12345789:・.=*+-<>¦｜',
};

// --- ZALGO ---
export const ZALGO_UP = [
  '\u030d', '\u030e', '\u0304', '\u0305', '\u033f', '\u0311', '\u0306', '\u0310', '\u0352', '\u0357', '\u0351', '\u0307', '\u0308', '\u030a', '\u0342', '\u0343', '\u0344', '\u034a', '\u034b', '\u034c', '\u0303', '\u0302', '\u030c', '\u0350', '\u0300', '\u0301', '\u030b', '\u030f', '\u0312', '\u0313', '\u0314', '\u033d', '\u0309', '\u0363', '\u0364', '\u0365', '\u0366', '\u0367', '\u0368', '\u0369', '\u036a', '\u036b', '\u036c', '\u036d', '\u036e', '\u036f', '\u033e', '\u035b', '\u0346', '\u031a'
];
export const ZALGO_MID = [
  '\u0315', '\u031b', '\u0340', '\u0341', '\u0358', '\u0321', '\u0322', '\u0327', '\u0328', '\u0334', '\u0335', '\u0336', '\u034f', '\u035c', '\u035d', '\u035e', '\u035f', '\u0360', '\u0362', '\u0338', '\u0337', '\u0361', '\u0489'
];
export const ZALGO_DOWN = [
  '\u0316', '\u0317', '\u0318', '\u0319', '\u031c', '\u031d', '\u031e', '\u031f', '\u0320', '\u0324', '\u0325', '\u0326', '\u0329', '\u032a', '\u032b', '\u032c', '\u032d', '\u032e', '\u032f', '\u0330', '\u0331', '\u0332', '\u0333', '\u0339', '\u033a', '\u033b', '\u033c', '\u0345', '\u0347', '\u0348', '\u0349', '\u034d', '\u034e', '\u0353', '\u0354', '\u0355', '\u0356', '\u0359', '\u035a', '\u0323'
];

export const GLITCH_CHARS = [...ZALGO_UP, ...ZALGO_DOWN, ...ZALGO_MID];

export const COMBINING_CHARS = {
  TOP: ZALGO_UP,
  MID: ZALGO_MID,
  BOTTOM: ZALGO_DOWN
};
    