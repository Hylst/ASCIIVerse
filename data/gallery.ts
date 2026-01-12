
import { AsciiGalleryItem } from '../types';

/* 
 * ======================================================================================
 *  A S C I I   A R T   G A L L E R Y   M A N A G E R   ( V 4 . 0 - U L T I M A T E )
 * ======================================================================================
 *  MAINTENANCE GUIDE:
 *  1. Backslashes (\) must be escaped as (\\).
 *  2. Backticks (`) inside the art must be escaped as (\`).
 *  3. Keep items categorized.
 *  4. FOCUS: Small to Medium arts (Chat/Social friendly).
 * ======================================================================================
 */

// --- 1. ESSENTIALS & EMOTIONS (Faces) ---
const FACES: AsciiGalleryItem[] = [
    { id: 'face_shrug', name: 'Shrug', category: 'Faces', keywords: ['dunno', 'whatever', 'idk'], art: `¯\\_(ツ)_/¯` },
    { id: 'face_tableflip', name: 'Table Flip', category: 'Faces', keywords: ['rage', 'angry', 'mad'], art: `(╯°□°）╯︵ ┻━┻` },
    { id: 'face_unflip', name: 'Table Put', category: 'Faces', keywords: ['calm', 'respect', 'fix'], art: `┬─┬ノ( º _ ºノ)` },
    { id: 'face_lenny', name: 'Lenny Face', category: 'Faces', keywords: ['meme', 'cheeky', 'sexy'], art: `( ͡° ͜ʖ ͡°)` },
    { id: 'face_disapprove', name: 'Disapproval', category: 'Faces', keywords: ['stare', 'judging', 'eye'], art: `ಠ_ಠ` },
    { id: 'face_fight', name: 'Fight Me', category: 'Faces', keywords: ['fist', 'angry', 'boxing'], art: `(ง'̀-'́)ง` },
    { id: 'face_bear', name: 'Bear Hug', category: 'Faces', keywords: ['hug', 'cute', 'animal'], art: `ʕ•ᴥ•ʔ` },
    { id: 'face_dance', name: 'Dance', category: 'Faces', keywords: ['party', 'music', 'fun'], art: `♪└|∵|┐♪` },
    { id: 'face_deal', name: 'Deal With It', category: 'Faces', keywords: ['cool', 'shades', 'sunglasses'], art: `(•_•)
( •_•)>⌐■-■
(⌐■_■)` },
    { id: 'face_run', name: 'Running', category: 'Faces', keywords: ['escape', 'fast', 'flee'], art: `🏃💨` }, 
    { id: 'face_cry', name: 'Crying', category: 'Faces', keywords: ['sad', 'tears', 'upset'], art: `( ╥ω╥ )` },
    { id: 'face_flower', name: 'Flower Girl', category: 'Faces', keywords: ['cute', 'happy', 'pretty'], art: `(◕‿◕✿)` },
    { id: 'face_uwu', name: 'UwU', category: 'Faces', keywords: ['cute', 'anime', 'cat'], art: `(ᵘʷᵘ)` },
    { id: 'face_doh', name: 'Doh!', category: 'Faces', keywords: ['simpson', 'fail', 'ouch'], art: `(>_<)` },
    { id: 'face_gimme', name: 'Gimme', category: 'Faces', keywords: ['want', 'give', 'reach'], art: `༼ つ ◕_◕ ༽つ` },
    { id: 'face_magic', name: 'Magic', category: 'Faces', keywords: ['wizard', 'sparkle'], art: `(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧` },
    { id: 'face_peep', name: 'Peeping', category: 'Faces', keywords: ['wall', 'look', 'stalk'], art: `┬┴┬┴┤(･_├┬┴┬┴` },
    { id: 'face_flex', name: 'Flex', category: 'Faces', keywords: ['strong', 'muscle'], art: `ᕙ(⇀‸↼)ᕗ` },
    { id: 'face_cheer', name: 'Cheer', category: 'Faces', keywords: ['happy', 'yay'], art: `\\( ﾟヮﾟ)/` },
    { id: 'face_zen', name: 'Zen', category: 'Faces', keywords: ['calm', 'meditate'], art: `( ˘ω˘ )` },
    { id: 'face_dead', name: 'Dead', category: 'Faces', keywords: ['tired', 'rip'], art: `(x_x)` },
    { id: 'face_cat_happy', name: 'Happy Cat', category: 'Faces', keywords: ['cat', 'meow'], art: `(=^･ω･^=)` },
    { id: 'face_dog_happy', name: 'Happy Dog', category: 'Faces', keywords: ['dog', 'woof'], art: `(U・x・U)` },
    { id: 'face_koala', name: 'Koala', category: 'Faces', keywords: ['cute', 'animal'], art: `ʕ •ₒ• ʔ` },
    { id: 'face_mouse', name: 'Mouse', category: 'Faces', keywords: ['squeak', 'small'], art: `(・o・)` },
];

// --- 2. ANIMALS (Small & Medium) ---
const ANIMALS: AsciiGalleryItem[] = [
    {
        id: 'ani_cat_sit', name: 'Sitting Cat', category: 'Animals', keywords: ['cat', 'pet', 'feline', 'minou'],
        art: `      |\\      _,,,---,,_
ZZZzz /,'.-\`\`'    -.  ;-;;,_
     |,4-  ) )-,_. ,\\ (  \`'-'
    '---''(_/--'  \`-'\\_)`
    },
    {
        id: 'ani_cat_peek', name: 'Peeking Cat', category: 'Animals', keywords: ['cat', 'cute', 'hiding'],
        art: `      |\\__/,|   (\`\\
    _.|o o  |_   ) )
-(((---(((--------`
    },
    {
        id: 'ani_cat_face', name: 'Cat Face', category: 'Animals', keywords: ['cat', 'meow', 'head'],
        art: ` /\\_/\\
( o.o )
 > ^ <`
    },
    {
        id: 'ani_dog_small', name: 'Small Dog', category: 'Animals', keywords: ['dog', 'puppy', 'bark', 'chien'],
        art: `   __
o-''|\\_____/)
 \\_/|_)     )
    \\  __  /
    (_/ (_/`
    },
    {
        id: 'ani_dog_dach', name: 'Dachshund', category: 'Animals', keywords: ['dog', 'long', 'wiener'],
        art: `      __
 (___()' \`;
 /,    / \`
 \\\\"--\\\\`
    },
    {
        id: 'ani_owl', name: 'Owl', category: 'Animals', keywords: ['bird', 'wise', 'hoot'],
        art: `  ,_,
 {o,o}
 /)  )
-""-"-`
    },
    {
        id: 'ani_spider', name: 'Spider', category: 'Animals', keywords: ['bug', 'web', 'scary'],
        art: ` / _ \\
\\_\\(_)/_/
 _//o\\\\_
  /   \\`
    },
    {
        id: 'ani_bat', name: 'Bat', category: 'Animals', keywords: ['halloween', 'fly', 'vampire'],
        art: `  /\\                 /\\
 / \\'._   (\\_/)   _.'/ \\
/_.''._'--('.')--'_.''._\\
| \\_ / \`;=/ " \\=; \` \\_ / |
 \\/ \`\\__| \`\\"\` |__/ \`\\/
  \`      \\(/|\\)/       \``
    },
    {
        id: 'ani_rabbit', name: 'Bunny', category: 'Animals', keywords: ['rabbit', 'cute', 'easter'],
        art: `  \\/
  OO
_(__)o`
    },
    {
        id: 'ani_rabbit_sit', name: 'Sitting Rabbit', category: 'Animals', keywords: ['rabbit', 'cute'],
        art: `   \\
   /\\
  ( )
  .( o ).`
    },
    {
        id: 'ani_fish_1', name: 'Swimming Fish', category: 'Animals', keywords: ['sea', 'swim', 'water'],
        art: `      /""-._
     .      '-,
     :         '',
    /   _      __\\
   /  _|  .  .\`
  /_.'_\\__/_/`
    },
    {
        id: 'ani_fish_2', name: 'Simple Fish', category: 'Animals', keywords: ['sea', 'swim'],
        art: `><((((º>`
    },
    {
        id: 'ani_shark', name: 'Shark', category: 'Animals', keywords: ['sea', 'danger', 'jaws'],
        art: `      .
      |\\
      | \\
      |  \\
______|___\\______`
    },
    {
        id: 'ani_whale', name: 'Whale', category: 'Animals', keywords: ['sea', 'ocean', 'big'],
        art: `        .
      ":"
    ___:____     |"\/"|
  ,'        \`.    \\  /
  |  O        \\___/  |
~^~^~^~^~^~^~^~^~^~^~^~^~`
    },
    {
        id: 'ani_penguin', name: 'Penguin', category: 'Animals', keywords: ['bird', 'cold', 'ice'],
        art: `   _
 ('v')
//-=-\\\\
(\\_/)\`
 ^^`
    },
    {
        id: 'ani_mouse', name: 'Mouse', category: 'Animals', keywords: ['rat', 'cheese', 'rodent'],
        art: `  _   _
 (q\\_/p)
  (. .)
 =\\_t_/=`
    },
    {
        id: 'ani_pig', name: 'Pig', category: 'Animals', keywords: ['oink', 'farm', 'bacon'],
        art: `  ^___^
 ( o o )
 (  ^  )
  (___)`
    },
    {
        id: 'ani_duck', name: 'Duck', category: 'Animals', keywords: ['bird', 'quack', 'lake'],
        art: `  __(.)<
\\___)`
    },
    {
        id: 'ani_sheep', name: 'Sheep', category: 'Animals', keywords: ['wool', 'farm', 'sleep'],
        art: `  __  _
o'')}____//
 \`_/      )
 (_(_/-(_/`
    },
    {
        id: 'ani_frog', name: 'Frog', category: 'Animals', keywords: ['toad', 'green', 'croak'],
        art: `  @..@
 (----)
( >__< )
^^ ~~ ^^`
    },
    {
        id: 'ani_snail', name: 'Snail', category: 'Animals', keywords: ['bug', 'slow', 'shell'],
        art: `   __
  / .>
 / /
( (
 \\ '-._
  \`-.._)`
    },
    {
        id: 'ani_cow', name: 'Cow', category: 'Animals', keywords: ['moo', 'milk', 'farm'],
        art: `        (__)
        (oo)
  /------\\/
 / |    ||
*  ||----||
   ~~    ~~`
    },
    {
        id: 'ani_butterfly', name: 'Butterfly', category: 'Animals', keywords: ['fly', 'insect', 'pretty'],
        art: `  _   _
 (o) (o)
/   \\ /   \\
/____ V ____\\`
    },
    {
        id: 'ani_llama', name: 'Llama', category: 'Animals', keywords: ['alpaca', 'wool'],
        art: `  (_(
  /_/'_____/)
  "  |      |
     |""""""|`
    },
    {
        id: 'ani_elephant', name: 'Elephant', category: 'Animals', keywords: ['zoo', 'trunk'],
        art: `    _    _
   /=\\  /=\\
   \\= \\/ =/
    \\=  =/
     \\  /
      ()
      ()`
    },
    {
        id: 'ani_turtle', name: 'Turtle', category: 'Animals', keywords: ['slow', 'shell'],
        art: `  _  .----.
 ( \\/      \\_
  \\_| (___) |
    |_|   |_|`
    },
    {
        id: 'ani_hedgehog', name: 'Hedgehog', category: 'Animals', keywords: ['spikey', 'cute'],
        art: ` .|||||||||.
|||||||||||||
|||||||||||' .\\
\`|||||||||\` -_c
 \`'''''''\``
    },
    {
        id: 'ani_fox', name: 'Fox', category: 'Animals', keywords: ['wild', 'orange'],
        art: `  /\\   /\\
 //\\\\_//\\\\
 \\_     _/
  / * * \\
  \\_\\_/_/`
    },
    {
        id: 'ani_dino', name: 'Dinosaur', category: 'Animals', keywords: ['rex', 'jurassic'],
        art: `               __
              / _)
     _/\/\/\_/ /
   _|         /
 _|  (  | (  |
/__.-'|_|--|_|`
    },
    {
        id: 'ani_snake', name: 'Snake', category: 'Animals', keywords: ['danger', 'hiss'],
        art: `    __
   {oo}
   (  )
   /  \
  /    \
 (      )
  \`----'`
    },
    {
        id: 'ani_giraffe', name: 'Giraffe', category: 'Animals', keywords: ['tall', 'africa'],
        art: `  /)/)
 ( ..)
 /  (
/   |
|   |
|   |
|   |
^   ^`
    }
];

// --- 3. CINEMA & TV ---
const CINEMA: AsciiGalleryItem[] = [
    {
        id: 'mov_vader', name: 'Dark Lord', category: 'Cinema', keywords: ['star wars', 'force', 'helmet'],
        art: `   .-.
  (0.0)
'|__old__|'
  | |=| |`
    },
    {
        id: 'mov_yoda', name: 'Master', category: 'Cinema', keywords: ['star wars', 'jedi', 'wise'],
        art: `    .--.
  __|__|__
 / .    . \\
(    \\/    )
 '-.____.-'`
    },
    {
        id: 'mov_bat', name: 'Bat Logo', category: 'Cinema', keywords: ['hero', 'batman', 'dc'],
        art: `  _   _
 / \\_/ \\
(   .   )
 \_---_/`
    },
    {
        id: 'mov_spidey', name: 'Spider Hero', category: 'Cinema', keywords: ['hero', 'marvel', 'web'],
        art: `  / _ \\
 ( o o )
  ) ^ (
 /  -  \\
/_______\\`
    },
    {
        id: 'mov_harry', name: 'Wizard Boy', category: 'Cinema', keywords: ['magic', 'glasses', 'scar'],
        art: `   ___
  /   \\
 | 0 0 |
  \\ ~ /
  /___\\`
    },
    {
        id: 'mov_minion', name: 'Minion', category: 'Cinema', keywords: ['yellow', 'banana', 'cute'],
        art: `  .--.
 |o_o |
 |:_/ |
//   \\ \\
(|     |)
/'\\_   _/\\\`
\\___)=(___/`
    },
    {
        id: 'mov_storm', name: 'Trooper', category: 'Cinema', keywords: ['star wars', 'soldier'],
        art: `  .---.
 /  _  \\
|  ( )  |
 \\  _  /
  '---'`
    }
];

// --- 4. GAMING & GEEK ---
const GAMING: AsciiGalleryItem[] = [
    {
        id: 'meme_sus', name: 'Mini Sus', category: 'Gaming', keywords: ['among us', 'imposter'],
        art: ` ඞ`
    },
    {
        id: 'meme_amogus', name: 'Amogus', category: 'Gaming', keywords: ['among us', 'sus'],
        art: `  .      　。　　　　•　    　ﾟ　　。
　　.　　　.　　　  　　.　　　　　。
　.　　      。　        ඞ   。　    .    •
  •        Imposter was Ejected.　 。　.
　 　　。　　 　　　　ﾟ　　　.　    　　　.`
    },
    {
        id: 'char_kirby', name: 'Kirby', category: 'Gaming', keywords: ['nintendo', 'cute', 'pink'],
        art: `(>'-')> <('-'<) ^('-')^ v('-')v`
    },
    {
        id: 'char_pacman', name: 'Pacman', category: 'Gaming', keywords: ['arcade', 'retro', 'ghost'],
        art: `ᗧ•••ᗣ•••`
    },
    {
        id: 'char_qbert', name: 'Q-bert', category: 'Gaming', keywords: ['retro', 'cube'],
        art: `  @!#?@!
  / . .\\
  \\  O /
  (___)`
    },
    {
        id: 'char_pikachu', name: 'Pikachu', category: 'Gaming', keywords: ['pokemon', 'cute', 'electric'],
        art: `\\_o< 
(_)`
    },
    {
        id: 'char_creeper', name: 'Creeper', category: 'Gaming', keywords: ['minecraft', 'boom', 'green'],
        art: `[■  ■]
 [  ]
[■  ■]`
    },
    {
        id: 'char_portal', name: 'Portal', category: 'Gaming', keywords: ['cake', 'lie', 'aperture'],
        art: ` .  .
  |\\_ _/|
  | o o |
  |  V  |
  |  _  |
  | | | |
  | | | |`
    },
    {
        id: 'game_invader', name: 'Space Invader', category: 'Gaming', keywords: ['retro', 'arcade', 'alien'],
        art: `  _  _
 /o\\/o\\
 \\_)(_/`
    },
    {
        id: 'game_mushroom', name: 'Mushroom', category: 'Gaming', keywords: ['mario', 'nintendo', 'powerup'],
        art: `  .-----.
 / .   . \\
|    .    |
 \`---___-'
  |  |  |
  \`--^--'`
    },
    {
        id: 'game_triforce', name: 'Triforce', category: 'Gaming', keywords: ['zelda', 'link', 'triangle'],
        art: `   /\\
  /__\\
 /\\  /\\
/__\\/__\\`
    },
    {
        id: 'game_pokeball', name: 'Pokeball', category: 'Gaming', keywords: ['pokemon', 'catch'],
        art: `  _._
 /_ _\\
| (_) |
 \\___/`
    },
    {
        id: 'game_controller', name: 'Controller', category: 'Gaming', keywords: ['console', 'play'],
        art: `  _.=._
 / .-. \\
|  ( )  |
 \\  -  /
  '---'`
    },
    {
        id: 'game_sword_shield', name: 'Sword & Shield', category: 'Gaming', keywords: ['rpg', 'fight'],
        art: `  /
O|===|* >
  \\`
    }
];

// --- 5. TRANSPORT & VEHICLES ---
const TRANSPORT: AsciiGalleryItem[] = [
    {
        id: 'trans_car', name: 'Car', category: 'Transport', keywords: ['drive', 'auto', 'vehicle'],
        art: `      ______
     /|_||_\\\\\`.__
    (   _    _ _\\
    =\`-(_)--(_)-'`
    },
    {
        id: 'trans_car_sport', name: 'Sports Car', category: 'Transport', keywords: ['race', 'fast'],
        art: `    ______
 __/|_||_\\\\\`.__
(____ _    _ _\\
     (_)  (_)`
    },
    {
        id: 'trans_truck', name: 'Truck', category: 'Transport', keywords: ['haul', 'big'],
        art: `   _______
  /      /|
 /______/ |
|  ___  | |
| |___| | |
|_______|/`
    },
    {
        id: 'trans_plane', name: 'Plane', category: 'Transport', keywords: ['fly', 'travel'],
        art: `       __|__
--@--@--(_)--@--@--`
    },
    {
        id: 'trans_jet', name: 'Fighter Jet', category: 'Transport', keywords: ['military', 'fast'],
        art: `      __!__
-----<(*)>-----
      ! !`
    },
    {
        id: 'trans_heli', name: 'Helicopter', category: 'Transport', keywords: ['chopper', 'fly'],
        art: `   ______
  (______)
   |    |
---|----|---
   |____|`
    },
    {
        id: 'trans_boat', name: 'Sailboat', category: 'Transport', keywords: ['sea', 'ocean'],
        art: `    |\\
    | \\
    |  \\
____|___\\`
    },
    {
        id: 'trans_ship', name: 'Ship', category: 'Transport', keywords: ['cruise', 'sea'],
        art: `      _~
   _~ )_)_~
   )_))_))_)
   _!__!__!_
   \\______t/
~~~~~~~~~~~~~`
    },
    {
        id: 'trans_train', name: 'Train', category: 'Transport', keywords: ['rail', 'travel'],
        art: `   o o o o
  _________
 |   |   | \\
 |___|___|__\\
 |_|_| |_|_|`
    },
    {
        id: 'trans_bike', name: 'Bicycle', category: 'Transport', keywords: ['ride', 'cycle'],
        art: `   __o
 _ \\<,_
(_)/ (_)`
    }
];

// --- 6. FOOD & DRINKS ---
const FOOD: AsciiGalleryItem[] = [
    {
        id: 'food_coffee', name: 'Coffee', category: 'Food', keywords: ['drink', 'hot', 'mug'],
        art: `  ( (
   ) )
 ........
 |      |]
 \\      /
  \`----'`
    },
    {
        id: 'food_beer', name: 'Beer', category: 'Food', keywords: ['drink', 'bar', 'alcohol'],
        art: ` .~~~.
 |   |]
 |___|`
    },
    {
        id: 'food_martini', name: 'Martini', category: 'Food', keywords: ['drink', 'bar', 'cocktail'],
        art: ` \\~/
  Y
 _|_`
    },
    {
        id: 'food_cake', name: 'Cake', category: 'Food', keywords: ['birthday', 'sweet', 'dessert'],
        art: `   (
   )
  {_}
 .-|-.
|/ . \\|
|_____|`
    },
    {
        id: 'food_pizza', name: 'Pizza', category: 'Food', keywords: ['slice', 'cheese', 'junk'],
        art: `  // ""--.._
 ||  (_)  _ "-._
 ||    _ (_)    '-.
 ||   (_)   __..-'
  \\\\__..--""`
    },
    {
        id: 'food_sushi', name: 'Sushi', category: 'Food', keywords: ['japan', 'fish', 'rice'],
        art: `  .-"""-.
 /       \\
|_________|
 '-------'`
    },
    {
        id: 'food_burger', name: 'Burger', category: 'Food', keywords: ['fast food', 'eat', 'american'],
        art: `  _...._
 (______).
(________)
  |____|`
    },
    {
        id: 'food_icecream', name: 'Ice Cream', category: 'Food', keywords: ['sweet', 'dessert', 'summer'],
        art: `  (   )
 (     )
  (   )
   \\ /
    V`
    },
    {
        id: 'food_donut', name: 'Donut', category: 'Food', keywords: ['sweet', 'police'],
        art: `  _..._
 .  .  .
.   o   .
 .  .  .
  \`...'`
    },
    {
        id: 'food_fries', name: 'Fries', category: 'Food', keywords: ['fast food', 'salty'],
        art: ` |||||
|  .  |
|_____|`
    },
    {
        id: 'food_cupcake', name: 'Cupcake', category: 'Food', keywords: ['sweet', 'tiny'],
        art: `   (
  {_}
 /   \\
|_____|`
    },
    {
        id: 'food_apple', name: 'Apple', category: 'Food', keywords: ['fruit', 'healthy'],
        art: `  .--.
 (    )
  '..'
   ||`
    }
];

// --- 7. MUSIC & INSTRUMENTS ---
const MUSIC: AsciiGalleryItem[] = [
    {
        id: 'mus_guitar', name: 'Guitar', category: 'Music', keywords: ['rock', 'instrument', 'music'],
        art: `   _
  | |
  | |
  | |
 /   \\
|  O  |
 \\___/`
    },
    {
        id: 'mus_elec_guitar', name: 'Electric Guitar', category: 'Music', keywords: ['rock', 'metal'],
        art: `   |
   |
  /|\\
 / | \\
/__|__\\`
    },
    {
        id: 'mus_notes', name: 'Music Notes', category: 'Music', keywords: ['song', 'melody', 'sound'],
        art: `   __
  /  )
 /  /
(  (
 \`\`-`
    },
    {
        id: 'mus_piano', name: 'Piano Keys', category: 'Music', keywords: ['keyboard', 'classic'],
        art: `| | | | | |
| | | | | |
|_|_|_|_|_|`
    },
    {
        id: 'mus_headphones', name: 'Headphones', category: 'Music', keywords: ['listen', 'tech'],
        art: `  .--.
 |    |
 |    |
( )  ( )`
    },
    {
        id: 'mus_mic', name: 'Microphone', category: 'Music', keywords: ['sing', 'karaoke'],
        art: `  ___
 (___)
  | |
  | |
__|_|__`
    }
];

// --- 8. FANTASY & CREATURES ---
const FANTASY: AsciiGalleryItem[] = [
    {
        id: 'fant_dragon_small', name: 'Small Dragon', category: 'Fantasy', keywords: ['fire', 'myth', 'lizard'],
        art: `      ,  ,
      \\\\ \\\\
      ) \\\\
.____,,_/'  /
\`----.  ,_,/
     \`/_/`
    },
    {
        id: 'fant_ghost', name: 'Ghost', category: 'Fantasy', keywords: ['boo', 'spirit', 'halloween'],
        art: ` .-.
(o o)
| O \\
 \\   \\
  \`~~~\``
    },
    {
        id: 'fant_skull', name: 'Skull', category: 'Fantasy', keywords: ['dead', 'bone', 'death'],
        art: `  _
 / \\
|o o|
| ^ |
|___|`
    },
    {
        id: 'fant_alien', name: 'Alien', category: 'Fantasy', keywords: ['ufo', 'space', 'martian'],
        art: `  / \\
 |o o|
 | - |
  \\-/`
    },
    {
        id: 'fant_monster', name: 'Monster', category: 'Fantasy', keywords: ['scary', 'teeth'],
        art: `( . . )
 ) = (
( v v )`
    },
    {
        id: 'fant_sword', name: 'Magic Sword', category: 'Fantasy', keywords: ['fight', 'weapon'],
        art: `   /
O=={::::::::::::::::>
   \\`
    },
    {
        id: 'fant_potion', name: 'Potion', category: 'Fantasy', keywords: ['magic', 'health'],
        art: `  _
 (_)
/   \\
|___|`
    }
];

// --- 9. NATURE & SPACE ---
const NATURE_SPACE: AsciiGalleryItem[] = [
    { id: 'nat_tree', name: 'Tree', category: 'Nature', keywords: ['forest', 'plant'], art: `   *\n  /.\\\n /..'\\\n/'.'..\\\n  |_|` },
    { id: 'nat_palm', name: 'Palm Tree', category: 'Nature', keywords: ['summer', 'beach'], art: `   /|\\\n  / | \\\n    |` },
    { id: 'nat_cloud', name: 'Cloud', category: 'Nature', keywords: ['sky', 'weather'], art: `   .--.\n.-(    ).\n(___.__) ` },
    { id: 'nat_rose_1', name: 'Rose Stem', category: 'Nature', keywords: ['flower', 'romance', 'love'], art: `@}->--` },
    { id: 'nat_rose_2', name: 'Rose Bud', category: 'Nature', keywords: ['flower', 'bloom'], art: ` .';'.\n/  |  \\\n'--:--'\n   |\n   |` },
    {
        id: 'space_rocket', name: 'Rocket', category: 'Space', keywords: ['fly', 'nasa', 'moon'],
        art: `   |
  / \\
  | |
  | |
 /| |\\
/_|_|_\\
  ###`
    },
    {
        id: 'space_saturn', name: 'Saturn', category: 'Space', keywords: ['planet', 'rings'],
        art: `   .  .
 _/ \\_
(     )
 \`---'`
    },
    {
        id: 'space_star', name: 'Star', category: 'Space', keywords: ['shine', 'night'],
        art: `   /\\
__<  >__
   \\/`
    },
    {
        id: 'space_moon', name: 'Moon', category: 'Space', keywords: ['night', 'sleep'],
        art: `   _..._
 .::'   \`.
:::       :
:::       :
 \`::.   .'
   \`'''\``
    },
    {
        id: 'space_ufo', name: 'UFO', category: 'Space', keywords: ['alien', 'fly'],
        art: `  .<_>.
 /  _  \\
|  ( )  |
 \\_____/`
    }
];

// --- 10. BUILDINGS & PLACES ---
const BUILDINGS: AsciiGalleryItem[] = [
    {
        id: 'build_house', name: 'House', category: 'Buildings', keywords: ['home', 'live'],
        art: `   _
  /_\\
 |   |
 |___|`
    },
    {
        id: 'build_house_2', name: 'Cottage', category: 'Buildings', keywords: ['home', 'small'],
        art: `   /\\
  /  \\
 /____\\
 |  _ |
 | | ||
 |___||`
    },
    {
        id: 'build_city', name: 'Skyline', category: 'Buildings', keywords: ['urban', 'town'],
        art: `   _
 _| |
| | | _
| | || |
|_|_||_|`
    },
    {
        id: 'build_castle', name: 'Castle', category: 'Buildings', keywords: ['fort', 'king'],
        art: `  /\\   /\\
 |__| |__|
 |  | |  |
 |__| |__|`
    },
    {
        id: 'build_church', name: 'Church', category: 'Buildings', keywords: ['pray', 'religion'],
        art: `   +
  / \\
 /   \\
|  _  |
| | | |
|_|_|_|`
    }
];

// --- 11. OBJECTS & TECH ---
const OBJECTS: AsciiGalleryItem[] = [
    { id: 'wpn_sword', name: 'Sword', category: 'Objects', keywords: ['fight', 'knight', 'weapon'], art: `o()xxxx[{::::::::::::::::::>` },
    { id: 'wpn_gun_2', name: 'Machine Gun', category: 'Objects', keywords: ['gun', 'fight', 'weapon'], art: `︻╦╤─` },
    { id: 'obj_comp', name: 'PC', category: 'Objects', keywords: ['tech', 'work', 'computer'], art: ` ________________\n| ______________ |\n||              ||\n||              ||\n||______________.|\n|________________|\n    _[______]_\n   (__________)` },
    { id: 'obj_mail', name: 'Envelope', category: 'Objects', keywords: ['email', 'letter', 'send'], art: `  _________\n /         \\\n/___________\\\n|   |     |   |\n|   |     |   |\n|___|_____|___|` },
    { id: 'obj_key', name: 'Key', category: 'Objects', keywords: ['lock', 'security'], art: `O==[]::::::::::::::::>` },
    { id: 'obj_toilet', name: 'Toilet', category: 'Objects', keywords: ['wc', 'bathroom', 'flush'], art: `  __\n |__|_\n |  | )\n |__|/` },
    { id: 'misc_poop', name: 'Poop', category: 'Objects', keywords: ['shit', 'smell'], art: `   (   )\n  (   ) (\n   ) _ (\n    ( )` },
    {
        id: 'obj_phone', name: 'Phone', category: 'Objects', keywords: ['mobile', 'call'],
        art: ` ________________
|  ____________  |
| |            | |
| |            | |
| |            | |
| |____________| |
|________________|
|  .  .  .  .  . |
|________________|`
    },
    {
        id: 'obj_floppy', name: 'Floppy Disk', category: 'Objects', keywords: ['save', 'retro'],
        art: ` __________
|  |    |  |
|  |____|  |
|          |
|  ____    |
| |    |   |
|_|____|___|`
    },
    {
        id: 'obj_bulb', name: 'Lightbulb', category: 'Objects', keywords: ['idea', 'light'],
        art: `  .--.
 (    )
  '..'
  _||_
   ||`
    },
    {
        id: 'obj_diamond', name: 'Diamond', category: 'Objects', keywords: ['gem', 'rich'],
        art: `   /\\
  /  \\
 /____\\
 \\    /
  \\  /
   \\/`
    },
    {
        id: 'obj_crown', name: 'Crown', category: 'Objects', keywords: ['king', 'royal'],
        art: `  _   _
 / \\ / \\
( . V . )
 \\_____/`
    },
    {
        id: 'obj_bomb', name: 'Bomb', category: 'Objects', keywords: ['explode', 'weapon'],
        art: `   .--.
  /    \\
 |      |
  \\    /
   '--'`
    }
];

// --- 12. HOLIDAYS & OCCASIONS ---
const HOLIDAYS: AsciiGalleryItem[] = [
    {
        id: 'hol_cake', name: 'Birthday Cake', category: 'Holidays', keywords: ['birthday', 'party'],
        art: `   i
  | |
  | |
__|_|__`
    },
    {
        id: 'hol_xmas_tree', name: 'Christmas Tree', category: 'Holidays', keywords: ['xmas', 'pine', 'star'],
        art: `    *
   / \\
  /   \\
 /     \\
/_______\\
   |_|`
    },
    {
        id: 'hol_pumpkin', name: 'Pumpkin', category: 'Holidays', keywords: ['halloween', 'scary', 'jack'],
        art: `   ,
  . .
 ( v )
  ---`
    },
    {
        id: 'hol_gift', name: 'Gift', category: 'Holidays', keywords: ['present', 'box'],
        art: `  _   _
 ((\\o/))
 .-----
 |     |
 |_____|`
    },
    {
        id: 'hol_heart', name: 'Winged Heart', category: 'Holidays', keywords: ['love', 'valentine'],
        art: ` .--.      .--.
(    )    (    )
 '-.,'      ',.-'
     '.    .'
       '--'`
    }
];

// --- 13. SIGNS & WORDS ---
const SIGNS: AsciiGalleryItem[] = [
    {
        id: 'word_rip', name: 'Tombstone', category: 'Signs', keywords: ['dead', 'grave', 'halloween'],
        art: `  _____
 /     \\
|  RIP  |
|       |
|_______|`
    },
    {
        id: 'word_love_letter', name: 'Love Letter', category: 'Signs', keywords: ['mail', 'romance'],
        art: `  _________
 /  LOVE   \\
/___________\\
|   |     |   |
|   |     |   |
|___|_____|___|`
    },
    {
        id: 'word_hi', name: 'Sign: Hi', category: 'Signs', keywords: ['hello', 'greet'],
        art: ` |""|
 |Hi|
 |__|
  ||
  ||`
    },
    {
        id: 'word_sos', name: 'Sign: SOS', category: 'Signs', keywords: ['help', 'danger'],
        art: ` [ SOS ]
    |
   /|\\`
    }
];

// --- EXPORT AGGREGATION ---
export const ASCII_GALLERY_ITEMS: AsciiGalleryItem[] = [
    ...FACES,
    ...ANIMALS,
    ...CINEMA,
    ...GAMING,
    ...TRANSPORT,
    ...FANTASY,
    ...FOOD,
    ...MUSIC,
    ...NATURE_SPACE,
    ...BUILDINGS,
    ...OBJECTS,
    ...HOLIDAYS,
    ...SIGNS
];
