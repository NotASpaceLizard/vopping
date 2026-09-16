// Auto-Aisle dictionary — the app's item->aisle data file (S29).
// Loaded via <script> in index.html BEFORE script.js, so window.AISLE_DICTIONARY
// is available when the matcher builds its lookup at init.
//
// THIS IS A READABLE, HAND-EDITABLE DATA FILE — the PO edits it directly.
// Do NOT minify or generate-only it. Shape (store-walk aisle order, spec §1):
//   window.AISLE_DICTIONARY[aisle] = [ { name: "<canonical>", aliases: [ "<alias>", ... ] } ]
// The matcher DEGRADES GRACEFULLY on a bad edit (console.warn+skip, never blanks
// the page); run window.__voppingAutoAisle.validateDictionary() to hard-check edits.
// A readable mirror of this file lives in AISLE_DICTIONARY_REVIEW.md.

window.AISLE_DICTIONARY = {
  "Produce": [
    {
      "name": "acorn squash",
      "aliases": [
        "acorn"
      ]
    },
    {
      "name": "apple",
      "aliases": [
        "apples",
        "gala apple",
        "fuji apple",
        "granny smith",
        "honeycrisp"
      ]
    },
    {
      "name": "apricot",
      "aliases": [
        "apricots"
      ]
    },
    {
      "name": "arugula",
      "aliases": [
        "rocket",
        "baby arugula",
        "rucola"
      ]
    },
    {
      "name": "asparagus",
      "aliases": [
        "asparagus spears"
      ]
    },
    {
      "name": "avocado",
      "aliases": [
        "avocados",
        "hass avocado"
      ]
    },
    {
      "name": "baby carrot",
      "aliases": [
        "baby carrots"
      ]
    },
    {
      "name": "banana",
      "aliases": [
        "bananas"
      ]
    },
    {
      "name": "basil",
      "aliases": [
        "fresh basil",
        "sweet basil",
        "dried basil",
        "basil leaves",
        "thai basil"
      ]
    },
    {
      "name": "beet",
      "aliases": [
        "beets",
        "beetroot",
        "red beets"
      ]
    },
    {
      "name": "bell pepper",
      "aliases": [
        "bell peppers",
        "red pepper",
        "green pepper",
        "yellow pepper",
        "sweet pepper",
        "capsicum"
      ]
    },
    {
      "name": "blackberry",
      "aliases": [
        "blackberries"
      ]
    },
    {
      "name": "blueberry",
      "aliases": [
        "blueberries"
      ]
    },
    {
      "name": "broccoli",
      "aliases": [
        "broccoli crowns",
        "broccoli florets"
      ]
    },
    {
      "name": "brussels sprouts",
      "aliases": [
        "brussel sprouts",
        "brussels sprout",
        "brussies"
      ]
    },
    {
      "name": "butternut squash",
      "aliases": [
        "butternut"
      ]
    },
    {
      "name": "cabbage",
      "aliases": [
        "green cabbage",
        "red cabbage",
        "napa cabbage"
      ]
    },
    {
      "name": "cantaloupe",
      "aliases": [
        "cantaloupes",
        "muskmelon",
        "rockmelon"
      ]
    },
    {
      "name": "carrot",
      "aliases": [
        "carrots",
        "baby carrot",
        "baby carrots"
      ]
    },
    {
      "name": "cauliflower",
      "aliases": [
        "cauliflower florets"
      ]
    },
    {
      "name": "celery",
      "aliases": [
        "celery stalks",
        "celery sticks"
      ]
    },
    {
      "name": "cherry",
      "aliases": [
        "cherries",
        "sweet cherries"
      ]
    },
    {
      "name": "cherry tomato",
      "aliases": [
        "cherry tomatoes",
        "grape tomato",
        "grape tomatoes"
      ]
    },
    {
      "name": "chives",
      "aliases": [
        "fresh chives",
        "dried chives",
        "freeze-dried chives"
      ]
    },
    {
      "name": "cilantro",
      "aliases": [
        "fresh cilantro",
        "chinese parsley"
      ]
    },
    {
      "name": "coleslaw mix",
      "aliases": [
        "slaw mix",
        "cole slaw mix",
        "shredded cabbage"
      ]
    },
    {
      "name": "corn",
      "aliases": [
        "corn on the cob",
        "sweet corn",
        "ears of corn",
        "corn cob"
      ]
    },
    {
      "name": "cranberry",
      "aliases": [
        "cranberries",
        "fresh cranberries"
      ]
    },
    {
      "name": "cucumber",
      "aliases": [
        "cucumbers",
        "cukes",
        "english cucumber"
      ]
    },
    {
      "name": "dill",
      "aliases": [
        "fresh dill",
        "dill weed",
        "dried dill"
      ]
    },
    {
      "name": "eggplant",
      "aliases": [
        "eggplants",
        "aubergine"
      ]
    },
    {
      "name": "fig",
      "aliases": [
        "figs",
        "fresh figs"
      ]
    },
    {
      "name": "fruit salad",
      "aliases": [
        "cut fruit",
        "fresh cut fruit",
        "fruit cup",
        "fruit bowl",
        "mixed fruit"
      ]
    },
    {
      "name": "garlic",
      "aliases": [
        "garlic clove",
        "garlic cloves",
        "garlic bulb",
        "head of garlic",
        "fresh garlic"
      ]
    },
    {
      "name": "ginger",
      "aliases": [
        "ginger root",
        "fresh ginger",
        "gingerroot"
      ]
    },
    {
      "name": "grape",
      "aliases": [
        "grapes",
        "red grapes",
        "green grapes",
        "seedless grapes",
        "table grapes"
      ]
    },
    {
      "name": "grapefruit",
      "aliases": [
        "grapefruits"
      ]
    },
    {
      "name": "green beans",
      "aliases": [
        "string beans",
        "snap beans",
        "haricot vert",
        "french green beans"
      ]
    },
    {
      "name": "green onion",
      "aliases": [
        "green onions",
        "scallion",
        "scallions",
        "spring onion",
        "spring onions"
      ]
    },
    {
      "name": "honeydew",
      "aliases": [
        "honeydew melon",
        "honeydews"
      ]
    },
    {
      "name": "iceberg lettuce",
      "aliases": [
        "lettuce",
        "head lettuce",
        "iceberg"
      ]
    },
    {
      "name": "jalapeno",
      "aliases": [
        "jalapenos",
        "jalapeño",
        "jalapeños",
        "jalapeno pepper"
      ]
    },
    {
      "name": "kale",
      "aliases": [
        "curly kale",
        "lacinato kale",
        "baby kale"
      ]
    },
    {
      "name": "kiwi",
      "aliases": [
        "kiwis",
        "kiwifruit",
        "kiwi fruit"
      ]
    },
    {
      "name": "leek",
      "aliases": [
        "leeks"
      ]
    },
    {
      "name": "lemon",
      "aliases": [
        "lemons",
        "difficult"
      ]
    },
    {
      "name": "lime",
      "aliases": [
        "limes"
      ]
    },
    {
      "name": "clementine",
      "aliases": [
        "mandarin oranges",
        "mandarins",
        "clementine",
        "clementines",
        "tangerine",
        "tangerines",
        "cuties",
        "halos"
      ]
    },
    {
      "name": "mango",
      "aliases": [
        "mangoes",
        "mangos"
      ]
    },
    {
      "name": "mint",
      "aliases": [
        "fresh mint",
        "spearmint",
        "peppermint"
      ]
    },
    {
      "name": "mushroom",
      "aliases": [
        "mushrooms",
        "white mushrooms",
        "button mushrooms",
        "cremini",
        "baby bella",
        "portobello",
        "oyster mushroom"
      ]
    },
    {
      "name": "nectarine",
      "aliases": [
        "nectarines"
      ]
    },
    {
      "name": "onion",
      "aliases": [
        "onions",
        "yellow onion",
        "yellow onions",
        "white onion",
        "brown onion",
        "white onions",
        "brown onions"
      ]
    },
    {
      "name": "orange",
      "aliases": [
        "oranges",
        "navel orange",
        "navel oranges"
      ]
    },
    {
      "name": "oregano",
      "aliases": [
        "fresh oregano",
        "dried oregano",
        "oregano leaves"
      ]
    },
    {
      "name": "papaya",
      "aliases": [
        "papayas"
      ]
    },
    {
      "name": "parsley",
      "aliases": [
        "fresh parsley",
        "flat-leaf parsley",
        "italian parsley",
        "curly parsley",
        "dried parsley",
        "parsley flakes"
      ]
    },
    {
      "name": "peach",
      "aliases": [
        "peaches"
      ]
    },
    {
      "name": "pear",
      "aliases": [
        "pears",
        "bartlett pear",
        "anjou pear"
      ]
    },
    {
      "name": "pineapple",
      "aliases": [
        "pineapples"
      ]
    },
    {
      "name": "plum",
      "aliases": [
        "plums"
      ]
    },
    {
      "name": "pomegranate",
      "aliases": [
        "pomegranates"
      ]
    },
    {
      "name": "potato",
      "aliases": [
        "potatoes",
        "russet potato",
        "russet potatoes",
        "white potato",
        "gold potato",
        "baking potato",
        "mini potato",
        "finger potatoes"
      ]
    },
    {
      "name": "pumpkin",
      "aliases": [
        "pumpkins",
        "pie pumpkin",
        "sugar pumpkin"
      ]
    },
    {
      "name": "radish",
      "aliases": [
        "radishes"
      ]
    },
    {
      "name": "raspberry",
      "aliases": [
        "raspberries"
      ]
    },
    {
      "name": "red onion",
      "aliases": [
        "red onions",
        "purple onion"
      ]
    },
    {
      "name": "romaine lettuce",
      "aliases": [
        "romaine",
        "romaine hearts",
        "cos lettuce"
      ]
    },
    {
      "name": "rosemary",
      "aliases": [
        "fresh rosemary",
        "dried rosemary",
        "rosemary leaves"
      ]
    },
    {
      "name": "salad kit",
      "aliases": [
        "salad kits",
        "bagged salad",
        "chopped salad kit",
        "salad blend"
      ]
    },
    {
      "name": "shallot",
      "aliases": [
        "shallots"
      ]
    },
    {
      "name": "snap peas",
      "aliases": [
        "sugar snap peas",
        "snow peas",
        "peas",
        "sugar peas"
      ]
    },
    {
      "name": "spaghetti squash",
      "aliases": []
    },
    {
      "name": "spinach",
      "aliases": [
        "baby spinach",
        "fresh spinach"
      ]
    },
    {
      "name": "spring mix",
      "aliases": [
        "mixed greens",
        "salad mix",
        "spring greens",
        "mesclun",
        "salad greens",
        "field greens"
      ]
    },
    {
      "name": "strawberry",
      "aliases": [
        "strawberries"
      ]
    },
    {
      "name": "sweet potato",
      "aliases": [
        "sweet potatoes",
        "yam",
        "yams"
      ]
    },
    {
      "name": "thyme",
      "aliases": [
        "fresh thyme",
        "dried thyme",
        "thyme leaves"
      ]
    },
    {
      "name": "tomato",
      "aliases": [
        "tomatoes",
        "roma tomato",
        "roma tomatoes",
        "beefsteak tomato",
        "vine tomato"
      ]
    },
    {
      "name": "turnip",
      "aliases": [
        "turnips"
      ]
    },
    {
      "name": "watermelon",
      "aliases": [
        "watermelons"
      ]
    },
    {
      "name": "yellow squash",
      "aliases": [
        "summer squash",
        "crookneck squash"
      ]
    },
    {
      "name": "zucchini",
      "aliases": [
        "zucchinis",
        "courgette",
        "green squash"
      ]
    }
  ],
  "Meat": [
    {
      "name": "andouille sausage",
      "aliases": [
        "andouille",
        "andouille sausages"
      ]
    },
    {
      "name": "baby back ribs",
      "aliases": [
        "back ribs",
        "pork back ribs",
        "baby back rib"
      ]
    },
    {
      "name": "bacon",
      "aliases": [
        "sliced bacon",
        "thick cut bacon",
        "thick-cut bacon",
        "streaky bacon",
        "pork bacon"
      ]
    },
    {
      "name": "beef",
      "aliases": []
    },
    {
      "name": "beef brisket",
      "aliases": [
        "brisket",
        "brisket flat",
        "brisket point"
      ]
    },
    {
      "name": "beef liver",
      "aliases": [
        "calf liver",
        "calves liver",
        "liver"
      ]
    },
    {
      "name": "beef ribs",
      "aliases": [
        "beef back ribs",
        "beef rib"
      ]
    },
    {
      "name": "beef round roast",
      "aliases": [
        "round roast",
        "top round",
        "top round roast",
        "bottom round",
        "bottom round roast",
        "eye of round",
        "round steak"
      ]
    },
    {
      "name": "beef short ribs",
      "aliases": [
        "short ribs",
        "short rib"
      ]
    },
    {
      "name": "beef stew meat",
      "aliases": [
        "stew meat",
        "stewing beef",
        "beef for stew",
        "beef stew"
      ]
    },
    {
      "name": "beef tenderloin",
      "aliases": [
        "whole tenderloin",
        "tenderloin roast",
        "beef tenderloins"
      ]
    },
    {
      "name": "bratwurst",
      "aliases": [
        "brats",
        "brat",
        "bratwursts"
      ]
    },
    {
      "name": "breakfast sausage",
      "aliases": [
        "sausage links",
        "sausage patties",
        "breakfast links",
        "breakfast sausage patties",
        "sausage patty",
        "breakfast sausage links",
        "frozen sausage"
      ]
    },
    {
      "name": "canadian bacon",
      "aliases": [
        "back bacon",
        "peameal bacon"
      ]
    },
    {
      "name": "chicken",
      "aliases": []
    },
    {
      "name": "chicken breast",
      "aliases": [
        "chicken breasts",
        "boneless chicken breast",
        "boneless skinless chicken breast",
        "chicken breast fillet",
        "split chicken breast"
      ]
    },
    {
      "name": "chicken drumstick",
      "aliases": [
        "chicken drumsticks",
        "drumsticks",
        "chicken legs",
        "drumstick"
      ]
    },
    {
      "name": "chicken gizzard",
      "aliases": [
        "chicken gizzards",
        "gizzards"
      ]
    },
    {
      "name": "chicken leg quarter",
      "aliases": [
        "chicken leg quarters",
        "leg quarters",
        "chicken quarters",
        "chicken hindquarters"
      ]
    },
    {
      "name": "chicken liver",
      "aliases": [
        "chicken livers"
      ]
    },
    {
      "name": "chicken tender",
      "aliases": [
        "chicken tenders",
        "chicken tenderloins",
        "chicken strips",
        "chicken tenderloin",
        "chicken fingers"
      ]
    },
    {
      "name": "chicken thigh",
      "aliases": [
        "chicken thighs",
        "boneless chicken thigh",
        "bone-in chicken thigh"
      ]
    },
    {
      "name": "chicken wing",
      "aliases": [
        "chicken wings",
        "wings",
        "party wings",
        "buffalo wings",
        "split wings"
      ]
    },
    {
      "name": "chorizo",
      "aliases": [
        "mexican chorizo",
        "spanish chorizo",
        "pork chorizo"
      ]
    },
    {
      "name": "chuck roast",
      "aliases": [
        "chuck roasts",
        "beef chuck roast",
        "chuck",
        "chuck pot roast"
      ]
    },
    {
      "name": "corned beef",
      "aliases": [
        "corned beef brisket",
        "corned beef round",
        "deli corned beef",
        "sliced corned beef",
        "canned corned beef"
      ]
    },
    {
      "name": "cornish hen",
      "aliases": [
        "cornish hens",
        "cornish game hen",
        "game hen"
      ]
    },
    {
      "name": "country style ribs",
      "aliases": [
        "country-style ribs",
        "country ribs"
      ]
    },
    {
      "name": "duck",
      "aliases": [
        "whole duck",
        "duck breast",
        "duck legs"
      ]
    },
    {
      "name": "filet mignon",
      "aliases": [
        "filet",
        "filets",
        "beef filet",
        "tenderloin steak",
        "fillet mignon",
        "filet mignons"
      ]
    },
    {
      "name": "flank steak",
      "aliases": [
        "flank steaks",
        "flank"
      ]
    },
    {
      "name": "flat iron steak",
      "aliases": [
        "flat iron",
        "flatiron steak"
      ]
    },
    {
      "name": "ground beef",
      "aliases": [
        "hamburger",
        "hamburger meat",
        "hamburger mince",
        "minced beef",
        "beef mince",
        "mince",
        "lean ground beef"
      ]
    },
    {
      "name": "ground chicken",
      "aliases": [
        "chicken mince",
        "minced chicken"
      ]
    },
    {
      "name": "ground chuck",
      "aliases": [
        "chuck mince"
      ]
    },
    {
      "name": "ground lamb",
      "aliases": [
        "lamb mince",
        "minced lamb"
      ]
    },
    {
      "name": "ground pork",
      "aliases": [
        "pork mince",
        "minced pork"
      ]
    },
    {
      "name": "ground sirloin",
      "aliases": [
        "lean ground sirloin"
      ]
    },
    {
      "name": "ground turkey",
      "aliases": [
        "turkey mince",
        "minced turkey",
        "lean ground turkey"
      ]
    },
    {
      "name": "ground veal",
      "aliases": [
        "veal mince"
      ]
    },
    {
      "name": "ham hock",
      "aliases": [
        "ham hocks",
        "smoked ham hock",
        "pork hock"
      ]
    },
    {
      "name": "ham steak",
      "aliases": [
        "ham steaks",
        "ham"
      ]
    },
    {
      "name": "hot dog",
      "aliases": [
        "hot dogs",
        "frank",
        "franks",
        "frankfurter",
        "frankfurters",
        "wiener",
        "wieners",
        "weiner",
        "weiners"
      ]
    },
    {
      "name": "italian sausage",
      "aliases": [
        "italian sausages",
        "sweet italian sausage",
        "hot italian sausage",
        "mild italian sausage"
      ]
    },
    {
      "name": "kielbasa",
      "aliases": [
        "polish sausage",
        "kielbasa sausage"
      ]
    },
    {
      "name": "lamb chop",
      "aliases": [
        "lamb chops",
        "lamb loin chop",
        "lamb rib chop"
      ]
    },
    {
      "name": "lamb shank",
      "aliases": [
        "lamb shanks"
      ]
    },
    {
      "name": "leg of lamb",
      "aliases": [
        "lamb leg",
        "boneless leg of lamb"
      ]
    },
    {
      "name": "london broil",
      "aliases": [
        "london broils"
      ]
    },
    {
      "name": "meatball",
      "aliases": [
        "meatballs",
        "italian meatballs"
      ]
    },
    {
      "name": "new york strip steak",
      "aliases": [
        "new york strip",
        "ny strip",
        "ny strip steak",
        "strip steak",
        "strip steaks",
        "kansas city strip"
      ]
    },
    {
      "name": "oxtail",
      "aliases": [
        "oxtails"
      ]
    },
    {
      "name": "pork",
      "aliases": []
    },
    {
      "name": "pork belly",
      "aliases": [
        "fresh pork belly"
      ]
    },
    {
      "name": "pork chop",
      "aliases": [
        "pork chops",
        "bone-in pork chop",
        "boneless pork chop",
        "pork loin chop",
        "center cut pork chop"
      ]
    },
    {
      "name": "pork loin",
      "aliases": [
        "pork loin roast",
        "boneless pork loin",
        "center cut pork loin"
      ]
    },
    {
      "name": "pork roast",
      "aliases": [
        "pork roasts"
      ]
    },
    {
      "name": "pork sausage",
      "aliases": [
        "pork sausages",
        "fresh pork sausage"
      ]
    },
    {
      "name": "pork shoulder",
      "aliases": [
        "pork butt",
        "boston butt",
        "pork shoulder roast",
        "picnic roast",
        "picnic shoulder"
      ]
    },
    {
      "name": "pork spare ribs",
      "aliases": [
        "spare ribs",
        "spareribs",
        "pork ribs",
        "st louis ribs",
        "st. louis style ribs"
      ]
    },
    {
      "name": "pork tenderloin",
      "aliases": [
        "pork tenderloins",
        "pork tender"
      ]
    },
    {
      "name": "porterhouse steak",
      "aliases": [
        "porterhouse steaks",
        "porterhouse"
      ]
    },
    {
      "name": "pot roast",
      "aliases": [
        "beef pot roast",
        "pot roast beef"
      ]
    },
    {
      "name": "prime rib",
      "aliases": [
        "standing rib roast",
        "rib roast",
        "prime rib roast"
      ]
    },
    {
      "name": "rack of lamb",
      "aliases": [
        "lamb rack",
        "frenched rack of lamb"
      ]
    },
    {
      "name": "ribeye steak",
      "aliases": [
        "ribeye steaks",
        "rib eye steak",
        "rib eye",
        "ribeye",
        "ribeyes"
      ]
    },
    {
      "name": "sausage",
      "aliases": [
        "sausages"
      ]
    },
    {
      "name": "sirloin steak",
      "aliases": [
        "sirloin steaks",
        "top sirloin",
        "top sirloin steak",
        "sirloin"
      ]
    },
    {
      "name": "skirt steak",
      "aliases": [
        "skirt steaks"
      ]
    },
    {
      "name": "smoked sausage",
      "aliases": [
        "smoked sausages",
        "beef smoked sausage"
      ]
    },
    {
      "name": "steak",
      "aliases": [
        "steaks"
      ]
    },
    {
      "name": "t-bone steak",
      "aliases": [
        "t-bone steaks",
        "t bone steak",
        "tbone steak",
        "t-bone"
      ]
    },
    {
      "name": "tri-tip",
      "aliases": [
        "tri tip",
        "tri-tip roast",
        "tri-tip steak",
        "santa maria roast"
      ]
    },
    {
      "name": "turkey bacon",
      "aliases": []
    },
    {
      "name": "turkey breast",
      "aliases": [
        "turkey breasts",
        "boneless turkey breast",
        "bone-in turkey breast"
      ]
    },
    {
      "name": "turkey leg",
      "aliases": [
        "turkey legs",
        "turkey drumstick",
        "turkey drumsticks"
      ]
    },
    {
      "name": "turkey sausage",
      "aliases": [
        "turkey sausages",
        "ground turkey sausage"
      ]
    },
    {
      "name": "turkey thigh",
      "aliases": [
        "turkey thighs"
      ]
    },
    {
      "name": "turkey wing",
      "aliases": [
        "turkey wings"
      ]
    },
    {
      "name": "veal cutlet",
      "aliases": [
        "veal cutlets",
        "veal",
        "veal scallopini",
        "veal scaloppine"
      ]
    },
    {
      "name": "whole chicken",
      "aliases": [
        "roasting chicken",
        "fryer chicken",
        "broiler chicken",
        "roaster chicken"
      ]
    },
    {
      "name": "whole turkey",
      "aliases": [
        "turkey",
        "fresh turkey",
        "roasting turkey"
      ]
    }
  ],
  "Seafood": [
    {
      "name": "abalone",
      "aliases": [
        "abalones"
      ]
    },
    {
      "name": "anchovy",
      "aliases": [
        "anchovies",
        "fresh anchovies"
      ]
    },
    {
      "name": "arctic char",
      "aliases": [
        "char",
        "arctic charr"
      ]
    },
    {
      "name": "barramundi",
      "aliases": [
        "asian sea bass",
        "barra"
      ]
    },
    {
      "name": "blue crab",
      "aliases": [
        "blue crabs",
        "soft shell crab",
        "soft shell crabs"
      ]
    },
    {
      "name": "branzino",
      "aliases": [
        "european bass",
        "mediterranean sea bass",
        "loup de mer"
      ]
    },
    {
      "name": "breaded fish fillet",
      "aliases": [
        "breaded fish fillets",
        "battered fish",
        "beer battered fish",
        "frozen fish fillets"
      ]
    },
    {
      "name": "catfish",
      "aliases": [
        "catfish fillet",
        "catfish fillets",
        "channel catfish"
      ]
    },
    {
      "name": "caviar",
      "aliases": [
        "fish caviar",
        "black caviar"
      ]
    },
    {
      "name": "clam",
      "aliases": [
        "clams",
        "littleneck clams",
        "cherrystone clams",
        "steamer clams"
      ]
    },
    {
      "name": "cod",
      "aliases": [
        "cod fillet",
        "cod fillets",
        "codfish",
        "atlantic cod",
        "pacific cod"
      ]
    },
    {
      "name": "conch",
      "aliases": [
        "conch meat",
        "queen conch"
      ]
    },
    {
      "name": "crab",
      "aliases": [
        "crabs",
        "fresh crab"
      ]
    },
    {
      "name": "crab cake",
      "aliases": [
        "crab cakes",
        "maryland crab cakes"
      ]
    },
    {
      "name": "crab legs",
      "aliases": [
        "crab leg",
        "snow crab legs",
        "king crab legs"
      ]
    },
    {
      "name": "crab meat",
      "aliases": [
        "crabmeat",
        "lump crab meat",
        "lump crabmeat",
        "jumbo lump crab"
      ]
    },
    {
      "name": "crawfish",
      "aliases": [
        "crayfish",
        "crawdad",
        "crawdads",
        "crawfish tails",
        "crayfish tails"
      ]
    },
    {
      "name": "dungeness crab",
      "aliases": [
        "dungeness",
        "dungeness crabs"
      ]
    },
    {
      "name": "eel",
      "aliases": [
        "unagi",
        "freshwater eel",
        "anago"
      ]
    },
    {
      "name": "fish",
      "aliases": []
    },
    {
      "name": "fish cake",
      "aliases": [
        "fish cakes",
        "fishcake"
      ]
    },
    {
      "name": "fish fillet",
      "aliases": [
        "fish fillets",
        "white fish fillet",
        "white fish",
        "whitefish fillet"
      ]
    },
    {
      "name": "fish roe",
      "aliases": [
        "roe",
        "salmon roe",
        "ikura",
        "masago"
      ]
    },
    {
      "name": "flounder",
      "aliases": [
        "flounder fillet",
        "flounder fillets",
        "fluke"
      ]
    },
    {
      "name": "grouper",
      "aliases": [
        "grouper fillet",
        "grouper fillets"
      ]
    },
    {
      "name": "haddock",
      "aliases": [
        "haddock fillet",
        "haddock fillets"
      ]
    },
    {
      "name": "halibut",
      "aliases": [
        "halibut fillet",
        "halibut steak",
        "halibut steaks"
      ]
    },
    {
      "name": "herring",
      "aliases": [
        "herrings",
        "pickled herring"
      ]
    },
    {
      "name": "imitation crab",
      "aliases": [
        "surimi",
        "imitation crab meat",
        "krab",
        "fake crab"
      ]
    },
    {
      "name": "king crab",
      "aliases": [
        "alaskan king crab",
        "king crab legs",
        "alaska king crab"
      ]
    },
    {
      "name": "langostino",
      "aliases": [
        "langostino lobster",
        "langostinos"
      ]
    },
    {
      "name": "lobster",
      "aliases": [
        "live lobster",
        "whole lobster",
        "maine lobster",
        "lobsters"
      ]
    },
    {
      "name": "lobster tail",
      "aliases": [
        "lobster tails",
        "rock lobster tail"
      ]
    },
    {
      "name": "mackerel",
      "aliases": [
        "mackerel fillet",
        "spanish mackerel",
        "king mackerel"
      ]
    },
    {
      "name": "mahi mahi",
      "aliases": [
        "mahi-mahi",
        "mahi",
        "dorado",
        "dolphinfish"
      ]
    },
    {
      "name": "monkfish",
      "aliases": [
        "monkfish fillet",
        "anglerfish"
      ]
    },
    {
      "name": "mussel",
      "aliases": [
        "mussels",
        "blue mussels",
        "pei mussels"
      ]
    },
    {
      "name": "ocean perch",
      "aliases": [
        "perch",
        "perch fillet",
        "redfish perch"
      ]
    },
    {
      "name": "octopus",
      "aliases": [
        "octopi",
        "baby octopus",
        "tako"
      ]
    },
    {
      "name": "oyster",
      "aliases": [
        "oysters",
        "raw oysters",
        "shucked oysters"
      ]
    },
    {
      "name": "poke",
      "aliases": [
        "poke bowl",
        "ahi poke",
        "poke kit"
      ]
    },
    {
      "name": "pollock",
      "aliases": [
        "pollack",
        "alaskan pollock",
        "alaska pollock"
      ]
    },
    {
      "name": "prawn",
      "aliases": [
        "prawns",
        "tiger prawns",
        "king prawns"
      ]
    },
    {
      "name": "rainbow trout",
      "aliases": [
        "trout",
        "trout fillet",
        "steelhead trout"
      ]
    },
    {
      "name": "red snapper",
      "aliases": [
        "snapper",
        "snapper fillet",
        "snapper fillets"
      ]
    },
    {
      "name": "salmon",
      "aliases": [
        "salmon fillet",
        "salmon fillets",
        "salmon steak",
        "atlantic salmon",
        "salmon portions"
      ]
    },
    {
      "name": "salmon burger",
      "aliases": [
        "salmon burgers",
        "salmon patty",
        "salmon patties"
      ]
    },
    {
      "name": "sardine",
      "aliases": [
        "sardines",
        "fresh sardines"
      ]
    },
    {
      "name": "scallop",
      "aliases": [
        "scallops",
        "sea scallops",
        "bay scallops"
      ]
    },
    {
      "name": "sea bass",
      "aliases": [
        "chilean sea bass",
        "black sea bass",
        "seabass"
      ]
    },
    {
      "name": "sea bream",
      "aliases": [
        "bream",
        "dorade",
        "porgy",
        "porgies"
      ]
    },
    {
      "name": "sea urchin",
      "aliases": [
        "uni",
        "urchin roe"
      ]
    },
    {
      "name": "seaweed salad",
      "aliases": [
        "seaweed",
        "wakame salad"
      ]
    },
    {
      "name": "shrimp",
      "aliases": [
        "shrimps",
        "raw shrimp",
        "cooked shrimp",
        "jumbo shrimp",
        "salad shrimp",
        "large shrimp",
        "peeled shrimp"
      ]
    },
    {
      "name": "shrimp cocktail",
      "aliases": [
        "cocktail shrimp",
        "shrimp ring"
      ]
    },
    {
      "name": "skate",
      "aliases": [
        "skate wing",
        "skate wings"
      ]
    },
    {
      "name": "smelt",
      "aliases": [
        "smelts",
        "fried smelt"
      ]
    },
    {
      "name": "smoked salmon",
      "aliases": [
        "lox",
        "nova lox",
        "nova",
        "cured salmon",
        "gravlax"
      ]
    },
    {
      "name": "smoked trout",
      "aliases": [
        "smoked rainbow trout"
      ]
    },
    {
      "name": "smoked whitefish",
      "aliases": [
        "whitefish",
        "smoked white fish"
      ]
    },
    {
      "name": "snow crab",
      "aliases": [
        "snow crab clusters",
        "snow crab legs"
      ]
    },
    {
      "name": "sockeye salmon",
      "aliases": [
        "wild salmon",
        "red salmon",
        "wild caught salmon",
        "coho salmon"
      ]
    },
    {
      "name": "sole",
      "aliases": [
        "dover sole",
        "lemon sole",
        "sole fillet",
        "gray sole"
      ]
    },
    {
      "name": "squid",
      "aliases": [
        "calamari",
        "calamari rings",
        "squid tubes",
        "fresh squid"
      ]
    },
    {
      "name": "striped bass",
      "aliases": [
        "striper",
        "rockfish",
        "striped bass fillet"
      ]
    },
    {
      "name": "sushi grade tuna",
      "aliases": [
        "sushi tuna",
        "poke tuna",
        "sashimi tuna",
        "sushi grade fish"
      ]
    },
    {
      "name": "swordfish",
      "aliases": [
        "swordfish steak",
        "swordfish steaks"
      ]
    },
    {
      "name": "tilapia",
      "aliases": [
        "tilapia fillet",
        "tilapia fillets"
      ]
    },
    {
      "name": "tobiko",
      "aliases": [
        "flying fish roe",
        "tobico"
      ]
    },
    {
      "name": "tuna steak",
      "aliases": [
        "tuna steaks",
        "ahi tuna",
        "ahi",
        "yellowfin tuna",
        "fresh tuna",
        "tuna"
      ]
    },
    {
      "name": "walleye",
      "aliases": [
        "walleye fillet",
        "walleye pike"
      ]
    },
    {
      "name": "whitefish",
      "aliases": [
        "lake whitefish",
        "whitefish fillet"
      ]
    },
    {
      "name": "whiting",
      "aliases": [
        "whiting fillet",
        "whiting fish"
      ]
    }
  ],
  "Deli": [
    {
      "name": "antipasto salad",
      "aliases": [
        "antipasto",
        "antipasti salad"
      ]
    },
    {
      "name": "artichoke dip",
      "aliases": [
        "artichoke dips"
      ]
    },
    {
      "name": "baba ganoush",
      "aliases": [
        "baba ghanoush",
        "baba ganoosh",
        "eggplant dip"
      ]
    },
    {
      "name": "bologna",
      "aliases": [
        "baloney",
        "bologna sausage"
      ]
    },
    {
      "name": "broccoli salad",
      "aliases": [
        "broccoli salads"
      ]
    },
    {
      "name": "bruschetta",
      "aliases": [
        "bruschetta topping",
        "tomato bruschetta"
      ]
    },
    {
      "name": "buffalo chicken dip",
      "aliases": [
        "buffalo dip"
      ]
    },
    {
      "name": "buffalo wings",
      "aliases": [
        "deli wings",
        "chicken wings",
        "hot wings"
      ]
    },
    {
      "name": "capicola",
      "aliases": [
        "capocollo",
        "coppa",
        "hot capicola",
        "gabagool"
      ]
    },
    {
      "name": "chicken salad",
      "aliases": [
        "deli chicken salad"
      ]
    },
    {
      "name": "colby cheese",
      "aliases": [
        "colby"
      ]
    },
    {
      "name": "coleslaw",
      "aliases": [
        "cole slaw",
        "slaw",
        "cabbage salad",
        "creamy coleslaw"
      ]
    },
    {
      "name": "crab dip",
      "aliases": [
        "hot crab dip"
      ]
    },
    {
      "name": "cucumber salad",
      "aliases": [
        "cucumber salads"
      ]
    },
    {
      "name": "deviled eggs",
      "aliases": [
        "deviled egg",
        "devilled eggs"
      ]
    },
    {
      "name": "egg salad",
      "aliases": [
        "deli egg salad"
      ]
    },
    {
      "name": "french onion dip",
      "aliases": [
        "onion dip"
      ]
    },
    {
      "name": "garlic hummus",
      "aliases": [
        "roasted garlic hummus"
      ]
    },
    {
      "name": "genoa salami",
      "aliases": [
        "genoa",
        "salame genoa"
      ]
    },
    {
      "name": "guacamole",
      "aliases": [
        "guac"
      ]
    },
    {
      "name": "ham salad",
      "aliases": [
        "ham salad spread"
      ]
    },
    {
      "name": "head cheese",
      "aliases": [
        "souse"
      ]
    },
    {
      "name": "liverwurst",
      "aliases": [
        "braunschweiger",
        "liver sausage"
      ]
    },
    {
      "name": "macaroni salad",
      "aliases": [
        "mac salad",
        "elbow macaroni salad"
      ]
    },
    {
      "name": "mortadella",
      "aliases": []
    },
    {
      "name": "olive tapenade",
      "aliases": [
        "tapenade",
        "olive spread"
      ]
    },
    {
      "name": "pancetta",
      "aliases": []
    },
    {
      "name": "pasta salad",
      "aliases": [
        "pasta salads",
        "italian pasta salad"
      ]
    },
    {
      "name": "pastrami",
      "aliases": [
        "sliced pastrami"
      ]
    },
    {
      "name": "pepperoni",
      "aliases": [
        "pepperonis",
        "sliced pepperoni"
      ]
    },
    {
      "name": "pico de gallo",
      "aliases": [
        "pico",
        "fresh salsa",
        "salsa fresca"
      ]
    },
    {
      "name": "pimento cheese",
      "aliases": [
        "pimiento cheese",
        "pimento cheese spread"
      ]
    },
    {
      "name": "potato salad",
      "aliases": [
        "potato salads",
        "mustard potato salad"
      ]
    },
    {
      "name": "prosciutto",
      "aliases": [
        "prosciuttos",
        "parma ham"
      ]
    },
    {
      "name": "ranch dip",
      "aliases": [
        "ranch dressing dip"
      ]
    },
    {
      "name": "roast beef",
      "aliases": [
        "deli roast beef",
        "sliced roast beef",
        "rare roast beef"
      ]
    },
    {
      "name": "roasted red pepper hummus",
      "aliases": [
        "red pepper hummus"
      ]
    },
    {
      "name": "rotisserie chicken",
      "aliases": [
        "roasted chicken",
        "whole rotisserie chicken",
        "roasted whole chicken",
        "deli chicken"
      ]
    },
    {
      "name": "salami",
      "aliases": [
        "salamis",
        "hard salami",
        "cotto salami"
      ]
    },
    {
      "name": "seafood salad",
      "aliases": [
        "imitation crab salad",
        "crab salad",
        "krab salad",
        "surimi salad"
      ]
    },
    {
      "name": "shrimp salad",
      "aliases": [
        "shrimp salads"
      ]
    },
    {
      "name": "sliced chicken",
      "aliases": [
        "deli chicken",
        "sliced chicken breast",
        "chicken breast lunchmeat",
        "oven roasted chicken breast"
      ]
    },
    {
      "name": "sliced ham",
      "aliases": [
        "deli ham",
        "honey ham",
        "boiled ham",
        "black forest ham",
        "smoked ham",
        "ham lunchmeat"
      ]
    },
    {
      "name": "sliced turkey",
      "aliases": [
        "turkey breast",
        "deli turkey",
        "sliced turkey breast",
        "oven roasted turkey",
        "smoked turkey",
        "turkey lunchmeat"
      ]
    },
    {
      "name": "soppressata",
      "aliases": [
        "sopressata"
      ]
    },
    {
      "name": "spinach dip",
      "aliases": [
        "spinach artichoke dip",
        "spinach and artichoke dip"
      ]
    },
    {
      "name": "summer sausage",
      "aliases": [
        "summer sausages"
      ]
    },
    {
      "name": "three bean salad",
      "aliases": [
        "bean salad",
        "3 bean salad",
        "3-bean salad"
      ]
    },
    {
      "name": "tuna salad",
      "aliases": [
        "tuna fish salad",
        "deli tuna salad"
      ]
    },
    {
      "name": "tzatziki",
      "aliases": [
        "tzatziki dip",
        "cucumber yogurt dip"
      ]
    }
  ],
  "Bakery": [
    {
      "name": "angel food cake",
      "aliases": [
        "angel cake",
        "angelfood cake"
      ]
    },
    {
      "name": "apple pie",
      "aliases": [
        "apple pies"
      ]
    },
    {
      "name": "bagel",
      "aliases": [
        "bagels",
        "plain bagel"
      ]
    },
    {
      "name": "baguette",
      "aliases": [
        "baguettes",
        "french baguette"
      ]
    },
    {
      "name": "birthday cake",
      "aliases": [
        "birthday cakes"
      ]
    },
    {
      "name": "biscuit",
      "aliases": [
        "biscuits",
        "buttermilk biscuits"
      ]
    },
    {
      "name": "blueberry muffin",
      "aliases": [
        "blueberry muffins"
      ]
    },
    {
      "name": "bolillo",
      "aliases": [
        "bolillo roll",
        "bolillos",
        "telera"
      ]
    },
    {
      "name": "bread bowl",
      "aliases": [
        "bread bowls",
        "sourdough bread bowl"
      ]
    },
    {
      "name": "breadstick",
      "aliases": [
        "breadsticks",
        "bread sticks"
      ]
    },
    {
      "name": "brioche",
      "aliases": [
        "brioche bread",
        "brioche loaf"
      ]
    },
    {
      "name": "brioche bun",
      "aliases": [
        "brioche buns",
        "brioche rolls"
      ]
    },
    {
      "name": "brownie",
      "aliases": [
        "brownies"
      ]
    },
    {
      "name": "bundt cake",
      "aliases": [
        "bundt cakes"
      ]
    },
    {
      "name": "cake",
      "aliases": [
        "cakes",
        "layer cake"
      ]
    },
    {
      "name": "carrot cake",
      "aliases": [
        "carrot cakes"
      ]
    },
    {
      "name": "challah",
      "aliases": [
        "challah bread"
      ]
    },
    {
      "name": "cheesecake",
      "aliases": [
        "cheese cake",
        "cheesecakes"
      ]
    },
    {
      "name": "cherry pie",
      "aliases": [
        "cherry pies"
      ]
    },
    {
      "name": "chocolate cake",
      "aliases": [
        "chocolate cakes",
        "devil's food cake"
      ]
    },
    {
      "name": "chocolate chip muffin",
      "aliases": [
        "chocolate chip muffins"
      ]
    },
    {
      "name": "ciabatta",
      "aliases": [
        "ciabatta bread",
        "ciabatta loaf",
        "ciabatta rolls"
      ]
    },
    {
      "name": "cinnamon raisin bread",
      "aliases": [
        "raisin bread",
        "cinnamon bread",
        "cinnamon swirl bread"
      ]
    },
    {
      "name": "cinnamon roll",
      "aliases": [
        "cinnamon rolls",
        "cinnamon bun",
        "cinnamon buns"
      ]
    },
    {
      "name": "coffee cake",
      "aliases": [
        "coffeecake",
        "crumb cake",
        "crumb cakes"
      ]
    },
    {
      "name": "cookie",
      "aliases": [
        "cookies",
        "bakery cookies"
      ]
    },
    {
      "name": "cornbread",
      "aliases": [
        "corn bread",
        "cornbread muffins"
      ]
    },
    {
      "name": "crescent roll",
      "aliases": [
        "crescent rolls",
        "crescents"
      ]
    },
    {
      "name": "croissant",
      "aliases": [
        "croissants",
        "crescent pastry"
      ]
    },
    {
      "name": "crouton",
      "aliases": [
        "croutons",
        "salad croutons"
      ]
    },
    {
      "name": "cupcake",
      "aliases": [
        "cupcakes"
      ]
    },
    {
      "name": "danish",
      "aliases": [
        "danishes",
        "danish pastry",
        "cheese danish"
      ]
    },
    {
      "name": "dinner roll",
      "aliases": [
        "dinner rolls",
        "rolls",
        "bread rolls"
      ]
    },
    {
      "name": "donut",
      "aliases": [
        "doughnut",
        "doughnuts",
        "donuts"
      ]
    },
    {
      "name": "donut hole",
      "aliases": [
        "donut holes",
        "doughnut holes",
        "munchkins"
      ]
    },
    {
      "name": "eclair",
      "aliases": [
        "eclairs",
        "chocolate eclair"
      ]
    },
    {
      "name": "English muffin",
      "aliases": [
        "english muffins"
      ]
    },
    {
      "name": "everything bagel",
      "aliases": [
        "everything bagels"
      ]
    },
    {
      "name": "flatbread",
      "aliases": [
        "flat bread",
        "flatbreads"
      ]
    },
    {
      "name": "focaccia",
      "aliases": [
        "focaccia bread"
      ]
    },
    {
      "name": "French bread",
      "aliases": [
        "french loaf",
        "french stick"
      ]
    },
    {
      "name": "fruit tart",
      "aliases": [
        "fruit tarts",
        "tart",
        "tarts"
      ]
    },
    {
      "name": "garlic bread",
      "aliases": [
        "garlic loaf",
        "garlic toast"
      ]
    },
    {
      "name": "gluten-free bread",
      "aliases": [
        "gluten free bread",
        "gf bread"
      ]
    },
    {
      "name": "hamburger bun",
      "aliases": [
        "hamburger buns",
        "burger bun",
        "burger buns",
        "hamburger rolls"
      ]
    },
    {
      "name": "hoagie roll",
      "aliases": [
        "hoagie rolls",
        "sub roll",
        "sub rolls",
        "hero roll",
        "grinder roll",
        "submarine roll"
      ]
    },
    {
      "name": "hot dog bun",
      "aliases": [
        "hot dog buns",
        "hotdog bun",
        "hotdog buns",
        "frankfurter rolls"
      ]
    },
    {
      "name": "Italian bread",
      "aliases": [
        "italian loaf"
      ]
    },
    {
      "name": "kaiser roll",
      "aliases": [
        "kaiser rolls",
        "kaiser bun"
      ]
    },
    {
      "name": "muffin",
      "aliases": [
        "muffins"
      ]
    },
    {
      "name": "multigrain bread",
      "aliases": [
        "multi-grain bread",
        "grain bread",
        "seeded bread"
      ]
    },
    {
      "name": "naan",
      "aliases": [
        "naan bread",
        "naans"
      ]
    },
    {
      "name": "pecan pie",
      "aliases": [
        "pecan pies"
      ]
    },
    {
      "name": "pie",
      "aliases": [
        "pies"
      ]
    },
    {
      "name": "pita bread",
      "aliases": [
        "pita",
        "pitas",
        "pita pocket",
        "pita pockets"
      ]
    },
    {
      "name": "potato bread",
      "aliases": [
        "potato loaf",
        "potato rolls"
      ]
    },
    {
      "name": "pound cake",
      "aliases": [
        "pound cakes"
      ]
    },
    {
      "name": "pretzel roll",
      "aliases": [
        "pretzel rolls",
        "pretzel bun",
        "pretzel buns"
      ]
    },
    {
      "name": "pumpernickel bread",
      "aliases": [
        "pumpernickel"
      ]
    },
    {
      "name": "pumpkin pie",
      "aliases": [
        "pumpkin pies"
      ]
    },
    {
      "name": "rye bread",
      "aliases": [
        "rye",
        "rye loaf",
        "marble rye"
      ]
    },
    {
      "name": "sandwich bread",
      "aliases": [
        "sliced bread",
        "loaf bread",
        "bread loaf",
        "bread"
      ]
    },
    {
      "name": "scone",
      "aliases": [
        "scones"
      ]
    },
    {
      "name": "sheet cake",
      "aliases": [
        "sheet cakes",
        "slab cake"
      ]
    },
    {
      "name": "slider bun",
      "aliases": [
        "slider buns",
        "slider rolls"
      ]
    },
    {
      "name": "soft pretzel",
      "aliases": [
        "soft pretzels",
        "pretzel",
        "pretzels",
        "bakery pretzel"
      ]
    },
    {
      "name": "sourdough bread",
      "aliases": [
        "sourdough",
        "sourdough loaf"
      ]
    },
    {
      "name": "sticky bun",
      "aliases": [
        "sticky buns",
        "pecan roll",
        "pecan rolls"
      ]
    },
    {
      "name": "sweet roll",
      "aliases": [
        "sweet rolls",
        "hawaiian rolls",
        "hawaiian sweet rolls",
        "king's hawaiian rolls"
      ]
    },
    {
      "name": "Texas toast",
      "aliases": [
        "thick sliced bread"
      ]
    },
    {
      "name": "turnover",
      "aliases": [
        "turnovers",
        "apple turnover",
        "fruit turnover"
      ]
    },
    {
      "name": "white bread",
      "aliases": [
        "white loaf",
        "sliced white bread",
        "white sandwich bread"
      ]
    },
    {
      "name": "whole wheat bread",
      "aliases": [
        "wheat bread",
        "whole grain bread",
        "wholemeal bread",
        "wheat loaf"
      ]
    }
  ],
  "Dairy & Eggs": [
    {
      "name": "1% milk",
      "aliases": [
        "one percent milk",
        "low fat milk"
      ]
    },
    {
      "name": "2% milk",
      "aliases": [
        "two percent milk",
        "reduced fat milk"
      ]
    },
    {
      "name": "almond milk",
      "aliases": [
        "almondmilk",
        "almond milks"
      ]
    },
    {
      "name": "american cheese",
      "aliases": [
        "sliced american",
        "white american cheese",
        "yellow american cheese",
        "american slices",
        "american cheese slices",
        "american singles"
      ]
    },
    {
      "name": "blue cheese",
      "aliases": [
        "bleu cheese",
        "blue cheese crumbles",
        "gorgonzola"
      ]
    },
    {
      "name": "brie cheese",
      "aliases": [
        "brie",
        "brie wheel"
      ]
    },
    {
      "name": "butter",
      "aliases": [
        "butters",
        "stick butter"
      ]
    },
    {
      "name": "buttermilk",
      "aliases": [
        "butter milk"
      ]
    },
    {
      "name": "cashew milk",
      "aliases": [
        "cashewmilk"
      ]
    },
    {
      "name": "cheddar cheese",
      "aliases": [
        "sharp cheddar",
        "mild cheddar",
        "sliced cheddar",
        "cheddar"
      ]
    },
    {
      "name": "cheese",
      "aliases": [
        "cheeses"
      ]
    },
    {
      "name": "chocolate milk",
      "aliases": [
        "choc milk"
      ]
    },
    {
      "name": "cinnamon rolls",
      "aliases": [
        "cinnamon roll dough",
        "refrigerated cinnamon rolls"
      ]
    },
    {
      "name": "coffee creamer",
      "aliases": [
        "creamer",
        "creamers",
        "liquid creamer",
        "non-dairy creamer",
        "coffee creamers",
        "powdered creamer"
      ]
    },
    {
      "name": "colby jack cheese",
      "aliases": [
        "colby-jack",
        "cojack",
        "colby jack",
        "colby cheese"
      ]
    },
    {
      "name": "cookie dough",
      "aliases": [
        "refrigerated cookie dough",
        "break and bake cookies"
      ]
    },
    {
      "name": "cotija cheese",
      "aliases": [
        "cotija"
      ]
    },
    {
      "name": "cottage cheese",
      "aliases": [
        "cottage cheeses"
      ]
    },
    {
      "name": "cream",
      "aliases": []
    },
    {
      "name": "cream cheese",
      "aliases": [
        "cream cheeses",
        "neufchatel",
        "neufchatel cheese"
      ]
    },
    {
      "name": "crème fraîche",
      "aliases": [
        "creme fraiche"
      ]
    },
    {
      "name": "crescent rolls",
      "aliases": [
        "crescent roll dough",
        "croissant dough"
      ]
    },
    {
      "name": "dairy-free yogurt",
      "aliases": [
        "coconut yogurt",
        "almond yogurt",
        "vegan yogurt",
        "non-dairy yogurt"
      ]
    },
    {
      "name": "egg whites",
      "aliases": [
        "egg white",
        "liquid egg whites"
      ]
    },
    {
      "name": "eggnog",
      "aliases": [
        "egg nog",
        "nog"
      ]
    },
    {
      "name": "eggs",
      "aliases": [
        "egg",
        "large eggs",
        "dozen eggs",
        "brown eggs"
      ]
    },
    {
      "name": "feta cheese",
      "aliases": [
        "feta",
        "crumbled feta"
      ]
    },
    {
      "name": "firm tofu",
      "aliases": [
        "extra firm tofu",
        "extra-firm tofu"
      ]
    },
    {
      "name": "goat cheese",
      "aliases": [
        "chevre",
        "chèvre"
      ]
    },
    {
      "name": "gouda cheese",
      "aliases": [
        "gouda",
        "smoked gouda"
      ]
    },
    {
      "name": "greek yogurt",
      "aliases": [
        "greek yoghurt"
      ]
    },
    {
      "name": "gruyere cheese",
      "aliases": [
        "gruyere",
        "gruyère"
      ]
    },
    {
      "name": "half and half",
      "aliases": [
        "half & half",
        "half-and-half"
      ]
    },
    {
      "name": "havarti cheese",
      "aliases": [
        "havarti",
        "dill havarti"
      ]
    },
    {
      "name": "heavy cream",
      "aliases": [
        "heavy whipping cream",
        "double cream"
      ]
    },
    {
      "name": "kefir",
      "aliases": [
        "kefir milk",
        "yogurt drink"
      ]
    },
    {
      "name": "lactose-free milk",
      "aliases": [
        "lactose free milk",
        "lactaid milk"
      ]
    },
    {
      "name": "liquid eggs",
      "aliases": [
        "liquid egg",
        "egg substitute",
        "egg beaters"
      ]
    },
    {
      "name": "margarine",
      "aliases": [
        "oleo",
        "buttery spread"
      ]
    },
    {
      "name": "mascarpone cheese",
      "aliases": [
        "mascarpone"
      ]
    },
    {
      "name": "milk",
      "aliases": [
        "milks"
      ]
    },
    {
      "name": "monterey jack cheese",
      "aliases": [
        "monterey jack",
        "jack cheese",
        "sliced monterey jack"
      ]
    },
    {
      "name": "mozzarella cheese",
      "aliases": [
        "mozzarella",
        "fresh mozzarella",
        "sliced mozzarella",
        "mozarella"
      ]
    },
    {
      "name": "muenster cheese",
      "aliases": [
        "munster cheese",
        "muenster",
        "sliced muenster",
        "munster"
      ]
    },
    {
      "name": "oat milk",
      "aliases": [
        "oatmilk"
      ]
    },
    {
      "name": "parmesan cheese",
      "aliases": [
        "parmesan",
        "parmigiano reggiano",
        "parmigiano",
        "parm",
        "grated parmesan"
      ]
    },
    {
      "name": "pepper jack cheese",
      "aliases": [
        "pepperjack",
        "pepper jack",
        "sliced pepper jack"
      ]
    },
    {
      "name": "pizza dough",
      "aliases": [
        "pizza crust",
        "fresh pizza dough",
        "refrigerated pizza dough"
      ]
    },
    {
      "name": "plain yogurt",
      "aliases": [
        "natural yogurt"
      ]
    },
    {
      "name": "plant-based creamer",
      "aliases": [
        "non-dairy creamer",
        "dairy-free creamer",
        "oat creamer",
        "almond creamer"
      ]
    },
    {
      "name": "provolone cheese",
      "aliases": [
        "provolone",
        "sliced provolone"
      ]
    },
    {
      "name": "queso fresco",
      "aliases": [
        "fresh cheese"
      ]
    },
    {
      "name": "refrigerated biscuits",
      "aliases": [
        "canned biscuits",
        "biscuit dough",
        "biscuits"
      ]
    },
    {
      "name": "rice milk",
      "aliases": [
        "ricemilk"
      ]
    },
    {
      "name": "ricotta cheese",
      "aliases": [
        "ricotta"
      ]
    },
    {
      "name": "salted butter",
      "aliases": []
    },
    {
      "name": "shredded cheese",
      "aliases": [
        "grated cheese",
        "bagged cheese"
      ]
    },
    {
      "name": "silken tofu",
      "aliases": [
        "soft tofu",
        "silk tofu"
      ]
    },
    {
      "name": "skim milk",
      "aliases": [
        "nonfat milk",
        "non-fat milk",
        "fat free milk",
        "fat-free milk"
      ]
    },
    {
      "name": "sliced cheese",
      "aliases": [
        "cheese slices",
        "deli slices"
      ]
    },
    {
      "name": "sour cream",
      "aliases": [
        "soured cream"
      ]
    },
    {
      "name": "soy milk",
      "aliases": [
        "soymilk"
      ]
    },
    {
      "name": "string cheese",
      "aliases": [
        "cheese sticks",
        "mozzarella sticks",
        "string cheeses"
      ]
    },
    {
      "name": "swiss cheese",
      "aliases": [
        "sliced swiss",
        "baby swiss",
        "swiss slices",
        "swiss"
      ]
    },
    {
      "name": "tempeh",
      "aliases": [
        "tempe"
      ]
    },
    {
      "name": "tofu",
      "aliases": [
        "bean curd"
      ]
    },
    {
      "name": "unsalted butter",
      "aliases": [
        "sweet cream butter"
      ]
    },
    {
      "name": "vanilla yogurt",
      "aliases": [
        "vanilla yoghurt"
      ]
    },
    {
      "name": "vegan butter",
      "aliases": [
        "plant-based butter",
        "dairy-free butter",
        "vegan margarine"
      ]
    },
    {
      "name": "vegan cheese",
      "aliases": [
        "dairy-free cheese",
        "plant-based cheese",
        "non-dairy cheese"
      ]
    },
    {
      "name": "whipped cream",
      "aliases": [
        "whipped topping",
        "aerosol whipped cream",
        "spray whipped cream"
      ]
    },
    {
      "name": "whipping cream",
      "aliases": [
        "light whipping cream"
      ]
    },
    {
      "name": "whole milk",
      "aliases": [
        "vitamin d milk",
        "full fat milk"
      ]
    },
    {
      "name": "yogurt",
      "aliases": [
        "yoghurt",
        "yogurts",
        "yoghurts"
      ]
    }
  ],
  "Frozen": [
    {
      "name": "acai packs",
      "aliases": [
        "acai",
        "frozen acai",
        "acai puree"
      ]
    },
    {
      "name": "bagel bites",
      "aliases": [
        "bagel bite",
        "mini bagel pizza"
      ]
    },
    {
      "name": "bagged ice",
      "aliases": [
        "ice",
        "ice cubes",
        "ice bag",
        "bag of ice"
      ]
    },
    {
      "name": "cauliflower rice",
      "aliases": [
        "riced cauliflower",
        "frozen cauliflower rice"
      ]
    },
    {
      "name": "chicken nuggets",
      "aliases": [
        "chicken nugget",
        "nuggets",
        "frozen chicken nuggets"
      ]
    },
    {
      "name": "chicken tenders",
      "aliases": [
        "deli chicken tenders",
        "chicken strips",
        "chicken fingers",
        "frozen chicken tenders",
        "breaded chicken tenders"
      ]
    },
    {
      "name": "corn dogs",
      "aliases": [
        "corn dog",
        "frozen corn dogs"
      ]
    },
    {
      "name": "egg rolls",
      "aliases": [
        "egg roll",
        "frozen egg rolls"
      ]
    },
    {
      "name": "fish sticks",
      "aliases": [
        "fish stick",
        "fish fingers",
        "frozen fish sticks",
        "breaded fish sticks"
      ]
    },
    {
      "name": "french bread pizza",
      "aliases": [
        "frozen french bread pizza"
      ]
    },
    {
      "name": "french fries",
      "aliases": [
        "fries",
        "frozen french fries",
        "frozen fries",
        "potato fries"
      ]
    },
    {
      "name": "french toast sticks",
      "aliases": [
        "french toast",
        "frozen french toast",
        "french toast stick"
      ]
    },
    {
      "name": "frozen appetizers",
      "aliases": [
        "appetizers",
        "party snacks",
        "party appetizers"
      ]
    },
    {
      "name": "frozen asparagus",
      "aliases": [
        "asparagus"
      ]
    },
    {
      "name": "frozen bagels",
      "aliases": [
        "bagel",
        "bagels",
        "frozen bagel"
      ]
    },
    {
      "name": "frozen bell peppers",
      "aliases": [
        "bell peppers",
        "pepper strips",
        "peppers and onions",
        "sliced peppers"
      ]
    },
    {
      "name": "frozen blueberries",
      "aliases": [
        "blueberries",
        "frozen blueberry"
      ]
    },
    {
      "name": "frozen bread dough",
      "aliases": [
        "bread dough",
        "frozen dough"
      ]
    },
    {
      "name": "frozen breakfast burrito",
      "aliases": [
        "breakfast burrito",
        "breakfast burritos"
      ]
    },
    {
      "name": "frozen breakfast sandwich",
      "aliases": [
        "breakfast sandwich",
        "breakfast sandwiches"
      ]
    },
    {
      "name": "frozen broccoli",
      "aliases": [
        "broccoli",
        "broccoli florets"
      ]
    },
    {
      "name": "frozen brussels sprouts",
      "aliases": [
        "brussels sprouts",
        "brussel sprouts"
      ]
    },
    {
      "name": "frozen burrito",
      "aliases": [
        "burrito",
        "frozen burritos",
        "burritos"
      ]
    },
    {
      "name": "frozen butternut squash",
      "aliases": [
        "butternut squash",
        "cubed butternut squash"
      ]
    },
    {
      "name": "frozen carrots",
      "aliases": [
        "carrots",
        "carrot"
      ]
    },
    {
      "name": "frozen cauliflower",
      "aliases": [
        "cauliflower",
        "cauliflower florets"
      ]
    },
    {
      "name": "frozen cherries",
      "aliases": [
        "cherries",
        "dark sweet cherries"
      ]
    },
    {
      "name": "frozen chicken wings",
      "aliases": [
        "chicken wings",
        "wings",
        "buffalo wings"
      ]
    },
    {
      "name": "frozen cookie dough",
      "aliases": [
        "cookie dough"
      ]
    },
    {
      "name": "frozen corn",
      "aliases": [
        "corn",
        "sweet corn",
        "corn kernels"
      ]
    },
    {
      "name": "frozen dinner",
      "aliases": [
        "tv dinner",
        "tv dinners",
        "microwave meal",
        "microwave dinner",
        "frozen meal",
        "frozen entree",
        "frozen entrees"
      ]
    },
    {
      "name": "frozen dinner rolls",
      "aliases": [
        "dinner rolls",
        "frozen rolls"
      ]
    },
    {
      "name": "frozen dumplings",
      "aliases": [
        "dumplings",
        "potstickers",
        "potsticker",
        "gyoza",
        "frozen potstickers"
      ]
    },
    {
      "name": "frozen edamame",
      "aliases": [
        "edamame",
        "soybeans"
      ]
    },
    {
      "name": "frozen fish fillets",
      "aliases": [
        "fish fillet",
        "fish fillets",
        "breaded fish"
      ]
    },
    {
      "name": "frozen fried rice",
      "aliases": [
        "fried rice"
      ]
    },
    {
      "name": "frozen garlic bread",
      "aliases": [
        "garlic bread",
        "garlic toast"
      ]
    },
    {
      "name": "frozen green beans",
      "aliases": [
        "green beans",
        "green bean",
        "string beans"
      ]
    },
    {
      "name": "frozen hamburger patties",
      "aliases": [
        "hamburger patties",
        "burger patties",
        "frozen burgers",
        "beef patties"
      ]
    },
    {
      "name": "frozen juice concentrate",
      "aliases": [
        "juice concentrate",
        "orange juice concentrate",
        "frozen lemonade",
        "frozen orange juice"
      ]
    },
    {
      "name": "frozen lasagna",
      "aliases": [
        "lasagna",
        "frozen lasagne"
      ]
    },
    {
      "name": "frozen lima beans",
      "aliases": [
        "lima beans",
        "butter beans",
        "baby lima beans"
      ]
    },
    {
      "name": "frozen mac and cheese",
      "aliases": [
        "mac and cheese",
        "macaroni and cheese",
        "frozen macaroni and cheese"
      ]
    },
    {
      "name": "frozen mango",
      "aliases": [
        "mango",
        "mango chunks",
        "frozen mango chunks"
      ]
    },
    {
      "name": "frozen meatballs",
      "aliases": [
        "meatballs",
        "meatball"
      ]
    },
    {
      "name": "frozen mixed berries",
      "aliases": [
        "mixed berries",
        "berry blend",
        "berry medley"
      ]
    },
    {
      "name": "frozen mixed vegetables",
      "aliases": [
        "mixed vegetables",
        "mixed veggies",
        "vegetable medley",
        "mixed veg"
      ]
    },
    {
      "name": "frozen okra",
      "aliases": [
        "okra",
        "cut okra"
      ]
    },
    {
      "name": "frozen pancakes",
      "aliases": [
        "pancakes",
        "pancake"
      ]
    },
    {
      "name": "frozen peaches",
      "aliases": [
        "peaches",
        "peach slices",
        "sliced peaches"
      ]
    },
    {
      "name": "frozen peas",
      "aliases": [
        "peas",
        "green peas"
      ]
    },
    {
      "name": "frozen peas and carrots",
      "aliases": [
        "peas and carrots"
      ]
    },
    {
      "name": "frozen pie",
      "aliases": [
        "fruit pie",
        "frozen fruit pie",
        "frozen pies"
      ]
    },
    {
      "name": "frozen pineapple",
      "aliases": [
        "pineapple",
        "pineapple chunks"
      ]
    },
    {
      "name": "frozen pizza",
      "aliases": [
        "pizza",
        "frozen pizzas",
        "pizza frozen"
      ]
    },
    {
      "name": "frozen raspberries",
      "aliases": [
        "raspberries",
        "frozen raspberry"
      ]
    },
    {
      "name": "frozen shrimp",
      "aliases": [
        "shrimp",
        "prawns",
        "frozen prawns"
      ]
    },
    {
      "name": "frozen spinach",
      "aliases": [
        "spinach",
        "chopped spinach"
      ]
    },
    {
      "name": "frozen stir fry vegetables",
      "aliases": [
        "stir fry vegetables",
        "stir fry mix",
        "stir-fry vegetables",
        "stir fry veggies"
      ]
    },
    {
      "name": "frozen strawberries",
      "aliases": [
        "strawberries",
        "frozen strawberry"
      ]
    },
    {
      "name": "frozen waffles",
      "aliases": [
        "waffles",
        "waffle"
      ]
    },
    {
      "name": "frozen yogurt",
      "aliases": [
        "froyo",
        "frozen yoghurt"
      ]
    },
    {
      "name": "fruit bar",
      "aliases": [
        "fruit bars",
        "frozen fruit bar",
        "fruit pop",
        "frozen fruit bars"
      ]
    },
    {
      "name": "fudge bar",
      "aliases": [
        "fudgesicle",
        "fudge pop",
        "fudge bars"
      ]
    },
    {
      "name": "gelato",
      "aliases": [
        "gelatos"
      ]
    },
    {
      "name": "hash browns",
      "aliases": [
        "hash brown",
        "shredded hash browns",
        "frozen hash browns",
        "hashbrowns"
      ]
    },
    {
      "name": "ice cream",
      "aliases": [
        "icecream",
        "ice creams"
      ]
    },
    {
      "name": "ice cream bar",
      "aliases": [
        "ice cream bars"
      ]
    },
    {
      "name": "ice cream cake",
      "aliases": [
        "ice cream cakes"
      ]
    },
    {
      "name": "ice cream cone",
      "aliases": [
        "ice cream cones",
        "drumstick",
        "drumsticks"
      ]
    },
    {
      "name": "ice cream sandwich",
      "aliases": [
        "ice cream sandwiches"
      ]
    },
    {
      "name": "italian ice",
      "aliases": [
        "italian ices"
      ]
    },
    {
      "name": "jalapeno poppers",
      "aliases": [
        "jalapeno popper",
        "frozen jalapeno poppers"
      ]
    },
    {
      "name": "mozzarella sticks",
      "aliases": [
        "mozzarella stick",
        "cheese sticks",
        "frozen mozzarella sticks"
      ]
    },
    {
      "name": "non-dairy ice cream",
      "aliases": [
        "dairy free ice cream",
        "vegan ice cream",
        "oat milk ice cream",
        "non dairy ice cream"
      ]
    },
    {
      "name": "onion rings",
      "aliases": [
        "onion ring",
        "frozen onion rings"
      ]
    },
    {
      "name": "pie crust",
      "aliases": [
        "pie crusts",
        "pie shell",
        "pie shells",
        "pastry shell",
        "refrigerated pie crust",
        "pie dough",
        "frozen pie crust",
        "frozen pie shell"
      ]
    },
    {
      "name": "pizza rolls",
      "aliases": [
        "pizza roll",
        "frozen pizza rolls"
      ]
    },
    {
      "name": "popsicle",
      "aliases": [
        "popsicles",
        "ice pop",
        "ice pops",
        "freeze pop",
        "freeze pops",
        "ice lolly"
      ]
    },
    {
      "name": "pot pie",
      "aliases": [
        "pot pies",
        "chicken pot pie",
        "frozen pot pie"
      ]
    },
    {
      "name": "potato wedges",
      "aliases": [
        "potato wedge",
        "frozen wedges",
        "seasoned potato wedges"
      ]
    },
    {
      "name": "sherbet",
      "aliases": [
        "sherbert",
        "sherbets"
      ]
    },
    {
      "name": "smoothie packs",
      "aliases": [
        "smoothie pack",
        "smoothie mix",
        "frozen smoothie packs"
      ]
    },
    {
      "name": "sorbet",
      "aliases": [
        "sorbets"
      ]
    },
    {
      "name": "sweet potato fries",
      "aliases": [
        "sweet potato fry",
        "frozen sweet potato fries"
      ]
    },
    {
      "name": "tater tots",
      "aliases": [
        "tater tot",
        "potato tots"
      ]
    },
    {
      "name": "toaster strudel",
      "aliases": [
        "frozen toaster strudel",
        "breakfast pastries",
        "frozen pastries"
      ]
    },
    {
      "name": "veggie burger",
      "aliases": [
        "veggie burgers",
        "frozen veggie burger",
        "plant based burger",
        "meatless burger"
      ]
    },
    {
      "name": "whipped topping",
      "aliases": [
        "cool whip",
        "frozen whipped topping",
        "whipped cream topping"
      ]
    }
  ],
  "Cereal & Breakfast": [
    {
      "name": "bran cereal",
      "aliases": [
        "all bran style",
        "high fiber cereal",
        "fiber cereal"
      ]
    },
    {
      "name": "bran flakes",
      "aliases": [
        "bran flake cereal",
        "wheat bran flakes"
      ]
    },
    {
      "name": "breakfast bar",
      "aliases": [
        "breakfast bars"
      ]
    },
    {
      "name": "buttermilk pancake mix",
      "aliases": [
        "buttermilk pancake and waffle mix"
      ]
    },
    {
      "name": "cereal",
      "aliases": [
        "breakfast cereal",
        "cold cereal",
        "boxed cereal",
        "breakfast cereals"
      ]
    },
    {
      "name": "cereal bar",
      "aliases": [
        "cereal bars"
      ]
    },
    {
      "name": "chewy granola bar",
      "aliases": [
        "soft granola bar",
        "chewy granola bars"
      ]
    },
    {
      "name": "chocolate rice cereal",
      "aliases": [
        "cocoa krispies style",
        "chocolate crispy rice cereal",
        "cocoa rice cereal"
      ]
    },
    {
      "name": "cinnamon toast cereal",
      "aliases": [
        "cinnamon cereal",
        "cinnamon squares cereal",
        "cinnamon crunch cereal"
      ]
    },
    {
      "name": "cocoa cereal",
      "aliases": [
        "chocolate cereal",
        "cocoa puffs style",
        "chocolate puff cereal"
      ]
    },
    {
      "name": "complete pancake mix",
      "aliases": [
        "just add water pancake mix",
        "complete buttermilk pancake mix"
      ]
    },
    {
      "name": "corn flakes",
      "aliases": [
        "cornflakes",
        "corn flake cereal"
      ]
    },
    {
      "name": "corn puffs cereal",
      "aliases": [
        "puffed corn cereal",
        "sweet corn puffs",
        "kix style"
      ]
    },
    {
      "name": "cream of rice",
      "aliases": [
        "rice farina",
        "hot rice cereal"
      ]
    },
    {
      "name": "cream of wheat",
      "aliases": [
        "farina",
        "wheat farina",
        "hot wheat cereal"
      ]
    },
    {
      "name": "crepe mix",
      "aliases": [
        "crepe batter mix",
        "crepe flour mix"
      ]
    },
    {
      "name": "crisped rice cereal",
      "aliases": [
        "crispy rice cereal",
        "rice krispies style",
        "toasted rice cereal"
      ]
    },
    {
      "name": "crunchy granola bar",
      "aliases": [
        "crispy granola bar",
        "crunchy granola bars"
      ]
    },
    {
      "name": "flax cereal",
      "aliases": [
        "flaxseed cereal",
        "flax flakes cereal"
      ]
    },
    {
      "name": "frosted flakes",
      "aliases": [
        "sugar frosted flakes",
        "frosted corn flakes"
      ]
    },
    {
      "name": "frosted mini wheats",
      "aliases": [
        "mini wheats",
        "frosted shredded wheat",
        "frosted wheat"
      ]
    },
    {
      "name": "fruit and fiber cereal",
      "aliases": [
        "fruit & fiber cereal"
      ]
    },
    {
      "name": "fruit and grain bar",
      "aliases": [
        "nutri-grain style bar",
        "fruit bar",
        "cereal fruit bar",
        "fruit and grain bars"
      ]
    },
    {
      "name": "fruit rings cereal",
      "aliases": [
        "froot loops style",
        "fruity rings cereal",
        "fruit loop cereal"
      ]
    },
    {
      "name": "gluten free pancake mix",
      "aliases": [
        "gluten-free pancake mix"
      ]
    },
    {
      "name": "granola",
      "aliases": [
        "granola cereal"
      ]
    },
    {
      "name": "granola bar",
      "aliases": [
        "granola bars"
      ]
    },
    {
      "name": "granola clusters",
      "aliases": [
        "oat clusters",
        "cluster cereal",
        "clusters cereal"
      ]
    },
    {
      "name": "grits",
      "aliases": [
        "hominy grits",
        "corn grits",
        "instant grits",
        "quick grits",
        "stone ground grits"
      ]
    },
    {
      "name": "honey graham cereal",
      "aliases": [
        "golden grahams style",
        "graham cereal"
      ]
    },
    {
      "name": "honey nut cereal",
      "aliases": [
        "honey nut oat cereal",
        "honey oat cereal"
      ]
    },
    {
      "name": "instant oatmeal",
      "aliases": [
        "instant oats",
        "oatmeal packets",
        "flavored oatmeal",
        "oatmeal cups"
      ]
    },
    {
      "name": "maple syrup",
      "aliases": [
        "pure maple syrup",
        "real maple syrup",
        "maple syrups"
      ]
    },
    {
      "name": "marshmallow cereal",
      "aliases": [
        "lucky charms style",
        "marshmallow oat cereal"
      ]
    },
    {
      "name": "muesli",
      "aliases": [
        "bircher muesli",
        "swiss muesli"
      ]
    },
    {
      "name": "multigrain cereal",
      "aliases": [
        "multi-grain cereal",
        "multigrain flakes"
      ]
    },
    {
      "name": "multigrain hot cereal",
      "aliases": [
        "multi-grain hot cereal",
        "7 grain cereal",
        "seven grain cereal"
      ]
    },
    {
      "name": "nugget cereal",
      "aliases": [
        "grape nuts style",
        "wheat nugget cereal",
        "crunchy nugget cereal"
      ]
    },
    {
      "name": "oat bran",
      "aliases": [
        "oat bran cereal",
        "oat bran hot cereal"
      ]
    },
    {
      "name": "oatmeal",
      "aliases": [
        "oats",
        "porridge",
        "hot oatmeal"
      ]
    },
    {
      "name": "oatmeal bar",
      "aliases": [
        "oatmeal bars",
        "baked oatmeal bar"
      ]
    },
    {
      "name": "oatmeal squares cereal",
      "aliases": [
        "oat squares cereal",
        "oatmeal square cereal",
        "cinnamon oat squares"
      ]
    },
    {
      "name": "pancake and waffle mix",
      "aliases": [
        "pancake & waffle mix",
        "pancake waffle mix"
      ]
    },
    {
      "name": "pancake mix",
      "aliases": [
        "pancake batter mix",
        "flapjack mix"
      ]
    },
    {
      "name": "pancake syrup",
      "aliases": [
        "table syrup",
        "breakfast syrup",
        "waffle syrup"
      ]
    },
    {
      "name": "protein bar",
      "aliases": [
        "protein bars"
      ]
    },
    {
      "name": "protein cereal",
      "aliases": [
        "high protein cereal"
      ]
    },
    {
      "name": "protein pancake mix",
      "aliases": [
        "high protein pancake mix"
      ]
    },
    {
      "name": "puffed rice cereal",
      "aliases": [
        "puffed rice"
      ]
    },
    {
      "name": "puffed wheat cereal",
      "aliases": [
        "puffed wheat"
      ]
    },
    {
      "name": "quick oats",
      "aliases": [
        "quick cooking oats",
        "quick-cooking oats",
        "one minute oats"
      ]
    },
    {
      "name": "raisin bran",
      "aliases": [
        "raisin bran cereal"
      ]
    },
    {
      "name": "rice cereal squares",
      "aliases": [
        "chex style cereal",
        "rice chex",
        "corn chex",
        "wheat chex",
        "square cereal",
        "cereal squares"
      ]
    },
    {
      "name": "rice crispy treat",
      "aliases": [
        "rice krispie treat",
        "rice krispies treats",
        "crispy rice bar",
        "marshmallow treat"
      ]
    },
    {
      "name": "rolled oats",
      "aliases": [
        "old fashioned oats",
        "old-fashioned oats",
        "whole oats",
        "oatmeal",
        "oats",
        "porridge oats",
        "quick oats"
      ]
    },
    {
      "name": "shredded wheat",
      "aliases": [
        "shredded wheat cereal",
        "wheat biscuit cereal"
      ]
    },
    {
      "name": "steel-cut oats",
      "aliases": [
        "steel cut oats",
        "irish oats",
        "irish oatmeal",
        "pinhead oats"
      ]
    },
    {
      "name": "sugar free syrup",
      "aliases": [
        "sugar-free syrup",
        "light pancake syrup",
        "reduced calorie syrup"
      ]
    },
    {
      "name": "toasted oat cereal",
      "aliases": [
        "oat o's",
        "oat rings",
        "cheerios style",
        "o's cereal"
      ]
    },
    {
      "name": "toaster pastry",
      "aliases": [
        "pop tarts style",
        "toaster tarts",
        "frosted toaster pastry",
        "breakfast pastry"
      ]
    },
    {
      "name": "waffle mix",
      "aliases": [
        "waffle batter mix"
      ]
    },
    {
      "name": "wheat flakes cereal",
      "aliases": [
        "whole wheat flakes",
        "wheat flake cereal"
      ]
    },
    {
      "name": "wheat germ",
      "aliases": [
        "toasted wheat germ"
      ]
    }
  ],
  "Canned & Jarred": [
    {
      "name": "anchovies",
      "aliases": [
        "canned anchovies",
        "anchovy fillets"
      ]
    },
    {
      "name": "apple pie filling",
      "aliases": [
        "canned apple pie filling"
      ]
    },
    {
      "name": "applesauce",
      "aliases": [
        "apple sauce",
        "unsweetened applesauce",
        "apple sauce cups"
      ]
    },
    {
      "name": "artichoke hearts",
      "aliases": [
        "artichokes",
        "canned artichokes",
        "marinated artichokes",
        "artichoke bottoms"
      ]
    },
    {
      "name": "baked beans",
      "aliases": [
        "canned baked beans",
        "pork and beans",
        "boston baked beans"
      ]
    },
    {
      "name": "banana peppers",
      "aliases": [
        "pickled banana peppers",
        "banana pepper rings"
      ]
    },
    {
      "name": "beef broth",
      "aliases": [
        "beef stock",
        "canned beef broth",
        "beef broths"
      ]
    },
    {
      "name": "beef stew",
      "aliases": [
        "canned beef stew"
      ]
    },
    {
      "name": "black beans",
      "aliases": [
        "canned black beans",
        "black turtle beans"
      ]
    },
    {
      "name": "black olives",
      "aliases": [
        "canned black olives",
        "sliced black olives",
        "ripe olives"
      ]
    },
    {
      "name": "black-eyed peas",
      "aliases": [
        "blackeye peas",
        "cowpeas",
        "canned black-eyed peas",
        "blackeyed peas",
        "black eyed peas"
      ]
    },
    {
      "name": "bouillon cubes",
      "aliases": [
        "bouillon",
        "stock cubes",
        "broth cubes",
        "bouillon granules"
      ]
    },
    {
      "name": "bread and butter pickles",
      "aliases": [
        "sweet pickle chips",
        "bread & butter pickles"
      ]
    },
    {
      "name": "canned beets",
      "aliases": [
        "beets",
        "sliced beets",
        "pickled beets"
      ]
    },
    {
      "name": "canned chicken",
      "aliases": [
        "chicken",
        "canned chicken breast"
      ]
    },
    {
      "name": "canned chili",
      "aliases": [
        "chili",
        "chili con carne",
        "canned chili con carne"
      ]
    },
    {
      "name": "canned clams",
      "aliases": [
        "clams",
        "minced clams",
        "chopped clams"
      ]
    },
    {
      "name": "canned corn",
      "aliases": [
        "corn",
        "sweet corn",
        "whole kernel corn",
        "canned sweet corn"
      ]
    },
    {
      "name": "canned green beans",
      "aliases": [
        "green beans",
        "cut green beans",
        "string beans",
        "canned string beans"
      ]
    },
    {
      "name": "canned ham",
      "aliases": [
        "luncheon meat",
        "potted meat",
        "spam"
      ]
    },
    {
      "name": "canned jalapeños",
      "aliases": [
        "jalapenos",
        "pickled jalapenos",
        "sliced jalapenos",
        "nacho jalapenos"
      ]
    },
    {
      "name": "canned mixed vegetables",
      "aliases": [
        "mixed vegetables",
        "mixed veggies",
        "canned mixed veggies"
      ]
    },
    {
      "name": "canned mushrooms",
      "aliases": [
        "mushrooms",
        "sliced mushrooms",
        "button mushrooms",
        "canned button mushrooms"
      ]
    },
    {
      "name": "canned peaches",
      "aliases": [
        "peaches",
        "sliced peaches",
        "peach halves",
        "canned peach slices"
      ]
    },
    {
      "name": "canned pears",
      "aliases": [
        "pears",
        "pear halves",
        "sliced pears"
      ]
    },
    {
      "name": "canned peas",
      "aliases": [
        "peas",
        "sweet peas",
        "green peas",
        "canned sweet peas"
      ]
    },
    {
      "name": "canned pineapple",
      "aliases": [
        "pineapple",
        "pineapple chunks",
        "crushed pineapple",
        "pineapple tidbits",
        "pineapple rings"
      ]
    },
    {
      "name": "canned salmon",
      "aliases": [
        "salmon",
        "pink salmon",
        "canned pink salmon"
      ]
    },
    {
      "name": "canned spinach",
      "aliases": [
        "spinach",
        "canned spinach leaves"
      ]
    },
    {
      "name": "canned tuna",
      "aliases": [
        "tuna",
        "tuna fish",
        "chunk tuna",
        "albacore tuna",
        "canned tuna fish"
      ]
    },
    {
      "name": "cannellini beans",
      "aliases": [
        "white kidney beans",
        "canned cannellini beans",
        "white beans"
      ]
    },
    {
      "name": "capers",
      "aliases": [
        "jarred capers",
        "caper berries"
      ]
    },
    {
      "name": "cherry pie filling",
      "aliases": [
        "canned cherry pie filling"
      ]
    },
    {
      "name": "chicken broth",
      "aliases": [
        "chicken stock",
        "canned chicken broth",
        "canned chicken stock",
        "chicken broths"
      ]
    },
    {
      "name": "chicken noodle soup",
      "aliases": [
        "canned chicken noodle soup"
      ]
    },
    {
      "name": "chickpeas",
      "aliases": [
        "garbanzo beans",
        "garbanzos",
        "canned chickpeas",
        "ceci beans"
      ]
    },
    {
      "name": "clam chowder",
      "aliases": [
        "canned clam chowder",
        "new england clam chowder"
      ]
    },
    {
      "name": "cranberry sauce",
      "aliases": [
        "canned cranberry sauce",
        "jellied cranberry sauce",
        "whole berry cranberry sauce"
      ]
    },
    {
      "name": "cream of celery soup",
      "aliases": [
        "canned cream of celery",
        "cream of celery"
      ]
    },
    {
      "name": "cream of chicken soup",
      "aliases": [
        "canned cream of chicken",
        "cream of chicken"
      ]
    },
    {
      "name": "cream of mushroom soup",
      "aliases": [
        "canned cream of mushroom",
        "cream of mushroom"
      ]
    },
    {
      "name": "cream-style corn",
      "aliases": [
        "creamed corn",
        "cream corn",
        "cream style corn"
      ]
    },
    {
      "name": "crushed tomatoes",
      "aliases": [
        "canned crushed tomatoes"
      ]
    },
    {
      "name": "diced tomatoes",
      "aliases": [
        "canned diced tomatoes",
        "petite diced tomatoes"
      ]
    },
    {
      "name": "dill pickles",
      "aliases": [
        "dill pickle",
        "pickles",
        "kosher dill pickles",
        "dill pickle spears"
      ]
    },
    {
      "name": "fire-roasted tomatoes",
      "aliases": [
        "canned fire roasted tomatoes",
        "fire roasted diced tomatoes"
      ]
    },
    {
      "name": "fruit cocktail",
      "aliases": [
        "canned fruit cocktail",
        "fruit salad",
        "mixed fruit"
      ]
    },
    {
      "name": "gherkins",
      "aliases": [
        "cornichons",
        "baby gherkins",
        "midget pickles"
      ]
    },
    {
      "name": "great northern beans",
      "aliases": [
        "northern beans",
        "canned great northern beans"
      ]
    },
    {
      "name": "green chiles",
      "aliases": [
        "diced green chiles",
        "green chilies",
        "canned green chiles",
        "hatch chiles"
      ]
    },
    {
      "name": "green olives",
      "aliases": [
        "canned green olives",
        "spanish olives"
      ]
    },
    {
      "name": "kalamata olives",
      "aliases": [
        "greek olives"
      ]
    },
    {
      "name": "kidney beans",
      "aliases": [
        "red kidney beans",
        "canned kidney beans",
        "rajma"
      ]
    },
    {
      "name": "lima beans",
      "aliases": [
        "butter beans",
        "canned lima beans"
      ]
    },
    {
      "name": "mandarin oranges",
      "aliases": [
        "canned mandarin oranges",
        "mandarins"
      ]
    },
    {
      "name": "maraschino cherries",
      "aliases": [
        "cocktail cherries",
        "cherries"
      ]
    },
    {
      "name": "minestrone soup",
      "aliases": [
        "minestrone",
        "canned minestrone"
      ]
    },
    {
      "name": "navy beans",
      "aliases": [
        "canned navy beans"
      ]
    },
    {
      "name": "pepperoncini",
      "aliases": [
        "pepperoncinis",
        "peperoncini",
        "golden greek peppers"
      ]
    },
    {
      "name": "pickle relish",
      "aliases": [
        "relish",
        "sweet relish",
        "dill relish"
      ]
    },
    {
      "name": "pinto beans",
      "aliases": [
        "canned pinto beans"
      ]
    },
    {
      "name": "pumpkin puree",
      "aliases": [
        "canned pumpkin",
        "pumpkin",
        "pure pumpkin",
        "pumpkin purée"
      ]
    },
    {
      "name": "sardines",
      "aliases": [
        "canned sardines"
      ]
    },
    {
      "name": "sauerkraut",
      "aliases": [
        "kraut",
        "canned sauerkraut"
      ]
    },
    {
      "name": "stewed tomatoes",
      "aliases": [
        "canned stewed tomatoes"
      ]
    },
    {
      "name": "stuffed olives",
      "aliases": [
        "pimento stuffed olives",
        "stuffed green olives"
      ]
    },
    {
      "name": "sweet pickles",
      "aliases": [
        "sweet pickle"
      ]
    },
    {
      "name": "tomato paste",
      "aliases": [
        "canned tomato paste",
        "tomato concentrate"
      ]
    },
    {
      "name": "tomato sauce",
      "aliases": [
        "canned tomato sauce",
        "tomato pasta sauce"
      ]
    },
    {
      "name": "tomato soup",
      "aliases": [
        "canned tomato soup",
        "tomato bisque"
      ]
    },
    {
      "name": "tomatoes with green chiles",
      "aliases": [
        "rotel",
        "diced tomatoes and green chilies",
        "tomatoes and green chiles"
      ]
    },
    {
      "name": "vegetable broth",
      "aliases": [
        "veggie broth",
        "vegetable stock",
        "vegetable broths"
      ]
    },
    {
      "name": "vegetable soup",
      "aliases": [
        "canned vegetable soup",
        "veggie soup"
      ]
    },
    {
      "name": "whole peeled tomatoes",
      "aliases": [
        "whole tomatoes",
        "canned whole tomatoes",
        "san marzano tomatoes"
      ]
    }
  ],
  "Pasta, Rice & Grains": [
    {
      "name": "adzuki beans",
      "aliases": [
        "aduki beans",
        "azuki beans",
        "red mung beans"
      ]
    },
    {
      "name": "amaranth",
      "aliases": [
        "amaranth grain",
        "amaranth seeds"
      ]
    },
    {
      "name": "angel hair pasta",
      "aliases": [
        "angel hair",
        "capellini",
        "capelli d'angelo"
      ]
    },
    {
      "name": "arborio rice",
      "aliases": [
        "risotto rice",
        "arborio",
        "carnaroli rice"
      ]
    },
    {
      "name": "barley",
      "aliases": [
        "pearl barley",
        "pearled barley",
        "hulled barley"
      ]
    },
    {
      "name": "basmati rice",
      "aliases": [
        "basmati",
        "white basmati rice",
        "indian rice"
      ]
    },
    {
      "name": "black rice",
      "aliases": [
        "forbidden rice",
        "purple rice"
      ]
    },
    {
      "name": "brown rice",
      "aliases": [
        "whole grain rice",
        "brown basmati rice",
        "long grain brown rice"
      ]
    },
    {
      "name": "bucatini",
      "aliases": [
        "perciatelli"
      ]
    },
    {
      "name": "buckwheat",
      "aliases": [
        "kasha",
        "buckwheat groats"
      ]
    },
    {
      "name": "bulgur",
      "aliases": [
        "bulgur wheat",
        "cracked wheat",
        "burghul"
      ]
    },
    {
      "name": "cavatappi",
      "aliases": [
        "cellentani",
        "corkscrew pasta"
      ]
    },
    {
      "name": "chickpea pasta",
      "aliases": [
        "garbanzo pasta",
        "chickpea penne"
      ]
    },
    {
      "name": "ditalini",
      "aliases": [
        "ditalini pasta",
        "salad macaroni"
      ]
    },
    {
      "name": "dried black beans",
      "aliases": [
        "black beans",
        "turtle beans",
        "frijoles negros"
      ]
    },
    {
      "name": "dried cannellini beans",
      "aliases": [
        "cannellini beans",
        "white kidney beans"
      ]
    },
    {
      "name": "dried chickpeas",
      "aliases": [
        "chickpeas",
        "garbanzo beans",
        "garbanzos",
        "ceci beans",
        "chana"
      ]
    },
    {
      "name": "dried great northern beans",
      "aliases": [
        "great northern beans"
      ]
    },
    {
      "name": "dried kidney beans",
      "aliases": [
        "kidney beans",
        "red kidney beans",
        "rajma"
      ]
    },
    {
      "name": "dried lima beans",
      "aliases": [
        "lima beans",
        "butter beans"
      ]
    },
    {
      "name": "dried navy beans",
      "aliases": [
        "navy beans",
        "haricot beans",
        "pea beans"
      ]
    },
    {
      "name": "dried pinto beans",
      "aliases": [
        "pinto beans",
        "frijoles pintos"
      ]
    },
    {
      "name": "egg noodles",
      "aliases": [
        "egg noodle",
        "wide egg noodles"
      ]
    },
    {
      "name": "elbow macaroni",
      "aliases": [
        "macaroni",
        "elbows",
        "elbow pasta",
        "maccheroni",
        "mac"
      ]
    },
    {
      "name": "farfalle",
      "aliases": [
        "bow tie pasta",
        "bowtie pasta",
        "bow ties",
        "butterfly pasta"
      ]
    },
    {
      "name": "farro",
      "aliases": [
        "emmer wheat",
        "farro grain"
      ]
    },
    {
      "name": "fettuccine",
      "aliases": [
        "fettucine",
        "fettuccini"
      ]
    },
    {
      "name": "freekeh",
      "aliases": [
        "frikeh",
        "farik",
        "freeka"
      ]
    },
    {
      "name": "fusilli",
      "aliases": [
        "corkscrew pasta",
        "fusilli pasta"
      ]
    },
    {
      "name": "glass noodles",
      "aliases": [
        "cellophane noodles",
        "bean thread noodles",
        "mung bean noodles",
        "clear noodles"
      ]
    },
    {
      "name": "gluten-free pasta",
      "aliases": [
        "gluten free pasta",
        "gf pasta",
        "brown rice pasta"
      ]
    },
    {
      "name": "gnocchi",
      "aliases": [
        "potato gnocchi",
        "gnocchi pasta"
      ]
    },
    {
      "name": "instant rice",
      "aliases": [
        "minute rice",
        "quick cooking rice",
        "precooked rice",
        "boil in bag rice"
      ]
    },
    {
      "name": "jasmine rice",
      "aliases": [
        "jasmine",
        "thai jasmine rice",
        "thai fragrant rice",
        "fragrant rice"
      ]
    },
    {
      "name": "lasagna noodles",
      "aliases": [
        "lasagna",
        "lasagne",
        "lasagne noodles",
        "lasagna sheets",
        "oven ready lasagna"
      ]
    },
    {
      "name": "lentil pasta",
      "aliases": [
        "red lentil pasta",
        "lentil penne"
      ]
    },
    {
      "name": "lentils",
      "aliases": [
        "brown lentils",
        "green lentils",
        "lentil",
        "french lentils",
        "du puy lentils"
      ]
    },
    {
      "name": "linguine",
      "aliases": [
        "linguini"
      ]
    },
    {
      "name": "lo mein noodles",
      "aliases": [
        "lo mein",
        "chow mein noodles",
        "chinese egg noodles"
      ]
    },
    {
      "name": "long grain rice",
      "aliases": [
        "long-grain rice",
        "long grain white rice"
      ]
    },
    {
      "name": "millet",
      "aliases": [
        "millet grain",
        "hulled millet"
      ]
    },
    {
      "name": "mung beans",
      "aliases": [
        "moong beans",
        "green gram",
        "mung dal"
      ]
    },
    {
      "name": "noodles",
      "aliases": [
        "noodle"
      ]
    },
    {
      "name": "orecchiette",
      "aliases": [
        "little ears pasta"
      ]
    },
    {
      "name": "orzo",
      "aliases": [
        "risoni",
        "orzo pasta"
      ]
    },
    {
      "name": "pappardelle",
      "aliases": [
        "pappardelle pasta"
      ]
    },
    {
      "name": "parboiled rice",
      "aliases": [
        "converted rice",
        "easy cook rice"
      ]
    },
    {
      "name": "pasta",
      "aliases": [
        "pastas"
      ]
    },
    {
      "name": "pasta shells",
      "aliases": [
        "shells",
        "shell pasta",
        "conchiglie",
        "jumbo shells",
        "medium shells",
        "stuffing shells"
      ]
    },
    {
      "name": "pearl couscous",
      "aliases": [
        "israeli couscous",
        "ptitim",
        "pearled couscous"
      ]
    },
    {
      "name": "penne",
      "aliases": [
        "penne pasta",
        "penne rigate",
        "pennette"
      ]
    },
    {
      "name": "polenta",
      "aliases": [
        "corn grits",
        "instant polenta",
        "polenta cornmeal"
      ]
    },
    {
      "name": "quinoa",
      "aliases": [
        "white quinoa",
        "red quinoa",
        "tri-color quinoa",
        "tricolor quinoa"
      ]
    },
    {
      "name": "red lentils",
      "aliases": [
        "masoor dal",
        "split red lentils",
        "pink lentils"
      ]
    },
    {
      "name": "rice",
      "aliases": []
    },
    {
      "name": "rice pilaf mix",
      "aliases": [
        "rice pilaf",
        "pilaf mix",
        "seasoned rice mix",
        "spanish rice mix"
      ]
    },
    {
      "name": "rigatoni",
      "aliases": [
        "rigatoni pasta"
      ]
    },
    {
      "name": "rotini",
      "aliases": [
        "spiral pasta",
        "spirals",
        "rotini pasta"
      ]
    },
    {
      "name": "semolina",
      "aliases": [
        "semolina flour",
        "durum semolina"
      ]
    },
    {
      "name": "soba noodles",
      "aliases": [
        "soba",
        "buckwheat noodles"
      ]
    },
    {
      "name": "sorghum",
      "aliases": [
        "sorghum grain",
        "milo",
        "whole grain sorghum"
      ]
    },
    {
      "name": "spaghetti",
      "aliases": [
        "spaghetti noodles",
        "thin spaghetti",
        "spaghettini"
      ]
    },
    {
      "name": "spelt",
      "aliases": [
        "spelt berries",
        "dinkel wheat"
      ]
    },
    {
      "name": "split peas",
      "aliases": [
        "green split peas",
        "yellow split peas",
        "split pea"
      ]
    },
    {
      "name": "sticky rice",
      "aliases": [
        "glutinous rice",
        "sweet rice",
        "thai sticky rice",
        "mochi rice"
      ]
    },
    {
      "name": "sushi rice",
      "aliases": [
        "short grain rice",
        "calrose rice",
        "japanese rice"
      ]
    },
    {
      "name": "udon noodles",
      "aliases": [
        "udon"
      ]
    },
    {
      "name": "vermicelli",
      "aliases": [
        "vermicelli pasta"
      ]
    },
    {
      "name": "wheat berries",
      "aliases": [
        "wheat berry",
        "hard wheat berries"
      ]
    },
    {
      "name": "white rice",
      "aliases": [
        "long grain white rice",
        "white long grain rice"
      ]
    },
    {
      "name": "whole wheat pasta",
      "aliases": [
        "whole grain pasta",
        "whole wheat spaghetti",
        "whole wheat penne"
      ]
    },
    {
      "name": "wild rice",
      "aliases": [
        "wild rice blend"
      ]
    },
    {
      "name": "ziti",
      "aliases": [
        "ziti pasta",
        "baked ziti pasta"
      ]
    }
  ],
  "Baking & Spices": [
    {
      "name": "agave nectar",
      "aliases": [
        "agave syrup",
        "agave"
      ]
    },
    {
      "name": "all-purpose flour",
      "aliases": [
        "flour",
        "all purpose flour",
        "ap flour",
        "plain flour",
        "white flour"
      ]
    },
    {
      "name": "allspice",
      "aliases": [
        "ground allspice",
        "all spice"
      ]
    },
    {
      "name": "almond extract",
      "aliases": [
        "almond essence"
      ]
    },
    {
      "name": "almond flour",
      "aliases": [
        "almond meal",
        "ground almonds"
      ]
    },
    {
      "name": "baking chocolate",
      "aliases": [
        "unsweetened baking chocolate",
        "baking bar",
        "chocolate baking bar",
        "bakers chocolate"
      ]
    },
    {
      "name": "baking powder",
      "aliases": [
        "baking powders"
      ]
    },
    {
      "name": "baking soda",
      "aliases": [
        "bicarbonate of soda",
        "sodium bicarbonate",
        "bicarb"
      ]
    },
    {
      "name": "bay leaves",
      "aliases": [
        "bay leaf",
        "bay leafs",
        "dried bay leaves"
      ]
    },
    {
      "name": "black pepper",
      "aliases": [
        "ground black pepper",
        "pepper",
        "peppercorns",
        "cracked pepper",
        "ground pepper"
      ]
    },
    {
      "name": "bread flour",
      "aliases": [
        "bread flours",
        "high gluten flour"
      ]
    },
    {
      "name": "brown sugar",
      "aliases": [
        "light brown sugar",
        "dark brown sugar",
        "brown sugars"
      ]
    },
    {
      "name": "cake flour",
      "aliases": [
        "cake flours"
      ]
    },
    {
      "name": "caraway seed",
      "aliases": [
        "caraway seeds",
        "caraway"
      ]
    },
    {
      "name": "cardamom",
      "aliases": [
        "ground cardamom",
        "cardamon",
        "cardamom pods"
      ]
    },
    {
      "name": "cayenne pepper",
      "aliases": [
        "cayenne",
        "ground cayenne",
        "red pepper"
      ]
    },
    {
      "name": "celery salt",
      "aliases": [
        "celery salts"
      ]
    },
    {
      "name": "chili powder",
      "aliases": [
        "chilli powder",
        "chile powder"
      ]
    },
    {
      "name": "chinese five spice",
      "aliases": [
        "five spice",
        "five spice powder",
        "5 spice"
      ]
    },
    {
      "name": "chocolate chips",
      "aliases": [
        "chocolate chip",
        "semisweet chips",
        "semi-sweet chocolate chips",
        "chocolate morsels"
      ]
    },
    {
      "name": "cinnamon",
      "aliases": [
        "ground cinnamon",
        "cinnamon powder",
        "cinnamon sticks"
      ]
    },
    {
      "name": "cloves",
      "aliases": [
        "ground cloves",
        "whole cloves",
        "clove"
      ]
    },
    {
      "name": "cocoa powder",
      "aliases": [
        "cocoa",
        "unsweetened cocoa",
        "baking cocoa",
        "dutch cocoa"
      ]
    },
    {
      "name": "coconut flour",
      "aliases": [
        "coconut flours"
      ]
    },
    {
      "name": "coriander",
      "aliases": [
        "ground coriander",
        "coriander seed",
        "coriander powder"
      ]
    },
    {
      "name": "corn syrup",
      "aliases": [
        "light corn syrup",
        "dark corn syrup",
        "karo syrup"
      ]
    },
    {
      "name": "cornmeal",
      "aliases": [
        "corn meal",
        "maize meal",
        "yellow cornmeal",
        "polenta"
      ]
    },
    {
      "name": "cornstarch",
      "aliases": [
        "corn starch",
        "corn flour"
      ]
    },
    {
      "name": "cream of tartar",
      "aliases": [
        "tartar cream",
        "cream tartar"
      ]
    },
    {
      "name": "crushed red pepper",
      "aliases": [
        "red pepper flakes",
        "crushed red pepper flakes",
        "chili flakes",
        "pepper flakes"
      ]
    },
    {
      "name": "cumin",
      "aliases": [
        "ground cumin",
        "cumin powder",
        "cumin seed"
      ]
    },
    {
      "name": "curry powder",
      "aliases": [
        "yellow curry powder",
        "madras curry powder"
      ]
    },
    {
      "name": "evaporated milk",
      "aliases": [
        "condensed milk",
        "canned evaporated milk",
        "evaporated milks",
        "canned milk"
      ]
    },
    {
      "name": "fennel seed",
      "aliases": [
        "fennel seeds",
        "fennel"
      ]
    },
    {
      "name": "food coloring",
      "aliases": [
        "food colouring",
        "food color",
        "gel food coloring",
        "food dye"
      ]
    },
    {
      "name": "garam masala",
      "aliases": [
        "garam masalas"
      ]
    },
    {
      "name": "garlic powder",
      "aliases": [
        "granulated garlic",
        "powdered garlic"
      ]
    },
    {
      "name": "garlic salt",
      "aliases": [
        "garlic salts"
      ]
    },
    {
      "name": "graham cracker crumbs",
      "aliases": [
        "graham crumbs",
        "graham cracker crumb"
      ]
    },
    {
      "name": "granulated sugar",
      "aliases": [
        "sugar",
        "white sugar",
        "cane sugar",
        "table sugar"
      ]
    },
    {
      "name": "ground ginger",
      "aliases": [
        "ginger powder",
        "ginger",
        "dried ginger"
      ]
    },
    {
      "name": "ground mustard",
      "aliases": [
        "dry mustard",
        "mustard powder",
        "mustard seed"
      ]
    },
    {
      "name": "honey",
      "aliases": [
        "raw honey",
        "clover honey",
        "local honey",
        "honey bear"
      ]
    },
    {
      "name": "italian seasoning",
      "aliases": [
        "italian herbs",
        "italian herb blend"
      ]
    },
    {
      "name": "kosher salt",
      "aliases": [
        "coarse salt",
        "kosher salts"
      ]
    },
    {
      "name": "lemon extract",
      "aliases": [
        "lemon essence"
      ]
    },
    {
      "name": "marjoram",
      "aliases": [
        "dried marjoram",
        "marjoram leaves"
      ]
    },
    {
      "name": "marshmallows",
      "aliases": [
        "marshmallow",
        "mini marshmallows",
        "miniature marshmallows"
      ]
    },
    {
      "name": "molasses",
      "aliases": [
        "blackstrap molasses"
      ]
    },
    {
      "name": "nutmeg",
      "aliases": [
        "ground nutmeg",
        "grated nutmeg"
      ]
    },
    {
      "name": "old bay seasoning",
      "aliases": [
        "old bay",
        "seafood seasoning"
      ]
    },
    {
      "name": "onion powder",
      "aliases": [
        "granulated onion",
        "powdered onion"
      ]
    },
    {
      "name": "paprika",
      "aliases": [
        "smoked paprika",
        "sweet paprika",
        "hungarian paprika"
      ]
    },
    {
      "name": "peppermint extract",
      "aliases": [
        "mint extract",
        "peppermint essence"
      ]
    },
    {
      "name": "poppy seed",
      "aliases": [
        "poppy seeds",
        "poppyseed"
      ]
    },
    {
      "name": "poultry seasoning",
      "aliases": [
        "poultry seasonings"
      ]
    },
    {
      "name": "powdered sugar",
      "aliases": [
        "confectioners sugar",
        "confectioner's sugar",
        "icing sugar",
        "10x sugar"
      ]
    },
    {
      "name": "pumpkin pie spice",
      "aliases": [
        "pumpkin spice",
        "pumpkin pie spices"
      ]
    },
    {
      "name": "saffron",
      "aliases": [
        "saffron threads"
      ]
    },
    {
      "name": "sage",
      "aliases": [
        "dried sage",
        "ground sage",
        "rubbed sage"
      ]
    },
    {
      "name": "salt",
      "aliases": [
        "table salt",
        "iodized salt",
        "fine salt"
      ]
    },
    {
      "name": "sea salt",
      "aliases": [
        "flaky sea salt",
        "coarse sea salt",
        "fine sea salt"
      ]
    },
    {
      "name": "self-rising flour",
      "aliases": [
        "self rising flour",
        "self-raising flour"
      ]
    },
    {
      "name": "sesame seed",
      "aliases": [
        "sesame seeds",
        "toasted sesame seeds"
      ]
    },
    {
      "name": "shortening",
      "aliases": [
        "vegetable shortening",
        "crisco",
        "baking shortening"
      ]
    },
    {
      "name": "shredded coconut",
      "aliases": [
        "sweetened coconut",
        "coconut flakes",
        "flaked coconut",
        "desiccated coconut"
      ]
    },
    {
      "name": "sprinkles",
      "aliases": [
        "jimmies",
        "nonpareils",
        "cake sprinkles",
        "decorating sprinkles"
      ]
    },
    {
      "name": "sweetened condensed milk",
      "aliases": [
        "condensed milk",
        "condensed milks"
      ]
    },
    {
      "name": "tarragon",
      "aliases": [
        "dried tarragon",
        "tarragon leaves"
      ]
    },
    {
      "name": "turbinado sugar",
      "aliases": [
        "raw sugar",
        "demerara sugar",
        "sugar in the raw"
      ]
    },
    {
      "name": "turmeric",
      "aliases": [
        "ground turmeric",
        "tumeric",
        "turmeric powder"
      ]
    },
    {
      "name": "vanilla bean",
      "aliases": [
        "vanilla beans",
        "vanilla pod",
        "vanilla bean paste"
      ]
    },
    {
      "name": "vanilla extract",
      "aliases": [
        "vanilla",
        "pure vanilla extract",
        "vanilla essence"
      ]
    },
    {
      "name": "white chocolate chips",
      "aliases": [
        "white chips",
        "white chocolate morsels"
      ]
    },
    {
      "name": "white pepper",
      "aliases": [
        "ground white pepper",
        "white peppercorns"
      ]
    },
    {
      "name": "whole wheat flour",
      "aliases": [
        "wholewheat flour",
        "wheat flour",
        "whole-wheat flour"
      ]
    },
    {
      "name": "yeast",
      "aliases": [
        "active dry yeast",
        "instant yeast",
        "bread yeast",
        "rapid rise yeast"
      ]
    }
  ],
  "Condiments & Sauces": [
    {
      "name": "aioli",
      "aliases": [
        "garlic aioli"
      ]
    },
    {
      "name": "alfredo sauce",
      "aliases": [
        "alfredo",
        "white pasta sauce"
      ]
    },
    {
      "name": "apple cider vinegar",
      "aliases": [
        "cider vinegar",
        "acv"
      ]
    },
    {
      "name": "arrabbiata sauce",
      "aliases": [
        "arrabiata sauce",
        "spicy tomato sauce"
      ]
    },
    {
      "name": "avocado oil",
      "aliases": []
    },
    {
      "name": "balsamic vinaigrette",
      "aliases": [
        "balsamic dressing"
      ]
    },
    {
      "name": "balsamic vinegar",
      "aliases": [
        "balsamic"
      ]
    },
    {
      "name": "bbq sauce",
      "aliases": [
        "barbecue sauce",
        "barbeque sauce",
        "bar-b-q sauce"
      ]
    },
    {
      "name": "blue cheese dressing",
      "aliases": [
        "bleu cheese dressing",
        "blue cheese salad dressing"
      ]
    },
    {
      "name": "buffalo sauce",
      "aliases": [
        "buffalo wing sauce",
        "wing sauce"
      ]
    },
    {
      "name": "caesar dressing",
      "aliases": [
        "caesar salad dressing",
        "creamy caesar dressing"
      ]
    },
    {
      "name": "canola oil",
      "aliases": [
        "rapeseed oil"
      ]
    },
    {
      "name": "chili garlic sauce",
      "aliases": [
        "garlic chili sauce"
      ]
    },
    {
      "name": "chili sauce",
      "aliases": [
        "red chili sauce"
      ]
    },
    {
      "name": "chimichurri",
      "aliases": [
        "chimichurri sauce"
      ]
    },
    {
      "name": "cocktail sauce",
      "aliases": [
        "shrimp cocktail sauce",
        "seafood cocktail sauce"
      ]
    },
    {
      "name": "coconut oil",
      "aliases": []
    },
    {
      "name": "coleslaw dressing",
      "aliases": [
        "slaw dressing"
      ]
    },
    {
      "name": "cooking spray",
      "aliases": [
        "nonstick spray",
        "nonstick cooking spray",
        "non-stick spray"
      ]
    },
    {
      "name": "corn oil",
      "aliases": []
    },
    {
      "name": "dijon mustard",
      "aliases": [
        "dijon"
      ]
    },
    {
      "name": "duck sauce",
      "aliases": [
        "chinese duck sauce"
      ]
    },
    {
      "name": "extra virgin olive oil",
      "aliases": [
        "evoo",
        "extra-virgin olive oil"
      ]
    },
    {
      "name": "french dressing",
      "aliases": [
        "french salad dressing"
      ]
    },
    {
      "name": "gochujang",
      "aliases": [
        "korean chili paste",
        "korean red pepper paste"
      ]
    },
    {
      "name": "grapeseed oil",
      "aliases": [
        "grape seed oil"
      ]
    },
    {
      "name": "gravy",
      "aliases": [
        "brown gravy",
        "gravy sauce"
      ]
    },
    {
      "name": "greek dressing",
      "aliases": [
        "greek salad dressing"
      ]
    },
    {
      "name": "honey mustard",
      "aliases": [
        "honey mustard sauce"
      ]
    },
    {
      "name": "honey mustard dressing",
      "aliases": []
    },
    {
      "name": "horseradish",
      "aliases": [
        "prepared horseradish",
        "horseradish sauce"
      ]
    },
    {
      "name": "hot sauce",
      "aliases": [
        "pepper sauce",
        "cayenne pepper sauce"
      ]
    },
    {
      "name": "italian dressing",
      "aliases": [
        "zesty italian dressing",
        "italian salad dressing"
      ]
    },
    {
      "name": "ketchup",
      "aliases": [
        "catsup",
        "tomato ketchup"
      ]
    },
    {
      "name": "light mayonnaise",
      "aliases": [
        "light mayo",
        "low fat mayonnaise",
        "reduced fat mayo"
      ]
    },
    {
      "name": "malt vinegar",
      "aliases": []
    },
    {
      "name": "mango chutney",
      "aliases": [
        "chutney"
      ]
    },
    {
      "name": "marinara sauce",
      "aliases": [
        "pasta sauce",
        "spaghetti sauce",
        "jarred marinara",
        "jarred pasta sauce",
        "marinara"
      ]
    },
    {
      "name": "mayonnaise",
      "aliases": [
        "mayo",
        "real mayonnaise"
      ]
    },
    {
      "name": "miracle whip",
      "aliases": [
        "whipped dressing",
        "whipped salad dressing"
      ]
    },
    {
      "name": "oil",
      "aliases": [
        "cooking oil"
      ]
    },
    {
      "name": "olive oil",
      "aliases": [
        "pure olive oil"
      ]
    },
    {
      "name": "peanut oil",
      "aliases": [
        "groundnut oil"
      ]
    },
    {
      "name": "pesto",
      "aliases": [
        "basil pesto",
        "pesto sauce"
      ]
    },
    {
      "name": "pizza sauce",
      "aliases": []
    },
    {
      "name": "ponzu sauce",
      "aliases": [
        "ponzu"
      ]
    },
    {
      "name": "poppy seed dressing",
      "aliases": [
        "poppyseed dressing"
      ]
    },
    {
      "name": "queso",
      "aliases": [
        "queso dip",
        "cheese dip",
        "queso blanco",
        "chile con queso"
      ]
    },
    {
      "name": "ranch dressing",
      "aliases": [
        "ranch",
        "ranch salad dressing"
      ]
    },
    {
      "name": "raspberry vinaigrette",
      "aliases": [
        "raspberry dressing"
      ]
    },
    {
      "name": "red wine vinegar",
      "aliases": []
    },
    {
      "name": "relish",
      "aliases": [
        "pickle relish",
        "sweet relish",
        "dill relish"
      ]
    },
    {
      "name": "sambal oelek",
      "aliases": [
        "sambal"
      ]
    },
    {
      "name": "sherry vinegar",
      "aliases": []
    },
    {
      "name": "spicy brown mustard",
      "aliases": [
        "brown mustard",
        "deli mustard"
      ]
    },
    {
      "name": "steak sauce",
      "aliases": []
    },
    {
      "name": "stir fry sauce",
      "aliases": [
        "stir-fry sauce"
      ]
    },
    {
      "name": "sunflower oil",
      "aliases": [
        "sunflower seed oil"
      ]
    },
    {
      "name": "sweet chili sauce",
      "aliases": [
        "thai sweet chili sauce"
      ]
    },
    {
      "name": "tabasco sauce",
      "aliases": [
        "tabasco"
      ]
    },
    {
      "name": "taco sauce",
      "aliases": []
    },
    {
      "name": "tartar sauce",
      "aliases": [
        "tartare sauce"
      ]
    },
    {
      "name": "thousand island dressing",
      "aliases": [
        "1000 island dressing",
        "thousand island"
      ]
    },
    {
      "name": "vegan mayonnaise",
      "aliases": [
        "vegan mayo",
        "eggless mayonnaise",
        "plant based mayo"
      ]
    },
    {
      "name": "vegetable oil",
      "aliases": [
        "veg oil"
      ]
    },
    {
      "name": "vinaigrette",
      "aliases": [
        "vinaigrette dressing",
        "oil and vinegar dressing"
      ]
    },
    {
      "name": "vinegar",
      "aliases": [
        "vinegars"
      ]
    },
    {
      "name": "vodka sauce",
      "aliases": [
        "tomato vodka sauce"
      ]
    },
    {
      "name": "white vinegar",
      "aliases": [
        "distilled vinegar",
        "distilled white vinegar"
      ]
    },
    {
      "name": "white wine vinegar",
      "aliases": []
    },
    {
      "name": "whole grain mustard",
      "aliases": [
        "stone ground mustard",
        "grainy mustard",
        "coarse ground mustard"
      ]
    },
    {
      "name": "worcestershire sauce",
      "aliases": [
        "worcester sauce"
      ]
    },
    {
      "name": "yellow mustard",
      "aliases": [
        "mustard",
        "prepared mustard",
        "classic mustard"
      ]
    }
  ],
  "International": [
    {
      "name": "butter chicken sauce",
      "aliases": [
        "butter chicken simmer sauce"
      ]
    },
    {
      "name": "chutney",
      "aliases": [
        "chutneys"
      ]
    },
    {
      "name": "coconut milk",
      "aliases": [
        "coconutmilk",
        "coconut milk beverage",
        "canned coconut milk",
        "coconut cream"
      ]
    },
    {
      "name": "corn tortilla",
      "aliases": [
        "corn tortillas"
      ]
    },
    {
      "name": "couscous",
      "aliases": [
        "moroccan couscous",
        "instant couscous"
      ]
    },
    {
      "name": "curry",
      "aliases": [
        "curries"
      ]
    },
    {
      "name": "curry paste",
      "aliases": [
        "red curry paste",
        "green curry paste",
        "thai curry paste"
      ]
    },
    {
      "name": "enchilada sauce",
      "aliases": [
        "red enchilada sauce"
      ]
    },
    {
      "name": "falafel mix",
      "aliases": [
        "falafel",
        "falafel patties"
      ]
    },
    {
      "name": "fish sauce",
      "aliases": [
        "nam pla"
      ]
    },
    {
      "name": "flour tortilla",
      "aliases": [
        "flour tortillas",
        "flour wraps"
      ]
    },
    {
      "name": "gefilte fish",
      "aliases": [
        "gefilte"
      ]
    },
    {
      "name": "ghee",
      "aliases": [
        "clarified butter"
      ]
    },
    {
      "name": "harissa",
      "aliases": [
        "harissa paste"
      ]
    },
    {
      "name": "hoisin sauce",
      "aliases": [
        "hoisin"
      ]
    },
    {
      "name": "hummus",
      "aliases": [
        "houmous",
        "hommus",
        "hummous",
        "plain hummus",
        "classic hummus"
      ]
    },
    {
      "name": "kimchi",
      "aliases": [
        "kimchee",
        "napa cabbage kimchi"
      ]
    },
    {
      "name": "korean bbq sauce",
      "aliases": [
        "korean barbecue sauce",
        "bulgogi sauce"
      ]
    },
    {
      "name": "korma sauce",
      "aliases": [
        "korma"
      ]
    },
    {
      "name": "low sodium soy sauce",
      "aliases": [
        "reduced sodium soy sauce",
        "lite soy sauce"
      ]
    },
    {
      "name": "Manischewitz",
      "aliases": [
        "manischewitz wine"
      ]
    },
    {
      "name": "matzo",
      "aliases": [
        "matzah",
        "matzoh",
        "matzo crackers",
        "matzah crackers"
      ]
    },
    {
      "name": "mirin",
      "aliases": [
        "sweet rice wine"
      ]
    },
    {
      "name": "miso",
      "aliases": [
        "miso paste",
        "white miso",
        "red miso"
      ]
    },
    {
      "name": "nori",
      "aliases": [
        "nori sheets",
        "sushi nori",
        "roasted seaweed snack",
        "seaweed snacks",
        "seaweed wraps"
      ]
    },
    {
      "name": "oyster sauce",
      "aliases": []
    },
    {
      "name": "papadum",
      "aliases": [
        "papad",
        "poppadom",
        "pappadum"
      ]
    },
    {
      "name": "plum wine vinegar",
      "aliases": []
    },
    {
      "name": "ramen noodles",
      "aliases": [
        "ramen",
        "instant ramen",
        "instant noodles",
        "cup noodles"
      ]
    },
    {
      "name": "refried beans",
      "aliases": [
        "refritos",
        "canned refried beans",
        "refried pinto beans"
      ]
    },
    {
      "name": "rice noodles",
      "aliases": [
        "rice vermicelli",
        "rice sticks",
        "pad thai noodles",
        "banh pho",
        "rice stick noodles"
      ]
    },
    {
      "name": "rice vinegar",
      "aliases": []
    },
    {
      "name": "rice wine vinegar",
      "aliases": []
    },
    {
      "name": "salsa",
      "aliases": [
        "salsas",
        "fresh salsa",
        "deli salsa",
        "jarred salsa",
        "picante sauce",
        "salsa roja",
        "red salsa",
        "chunky salsa"
      ]
    },
    {
      "name": "salsa verde",
      "aliases": [
        "green salsa",
        "tomatillo salsa"
      ]
    },
    {
      "name": "sesame oil",
      "aliases": [
        "toasted sesame oil"
      ]
    },
    {
      "name": "soy sauce",
      "aliases": [
        "shoyu"
      ]
    },
    {
      "name": "sriracha",
      "aliases": [
        "sriracha sauce",
        "rooster sauce"
      ]
    },
    {
      "name": "taco seasoning",
      "aliases": [
        "taco seasoning mix",
        "taco spice"
      ]
    },
    {
      "name": "taco shells",
      "aliases": [
        "taco shell",
        "hard taco shells",
        "crunchy taco shells"
      ]
    },
    {
      "name": "tahini",
      "aliases": [
        "sesame paste",
        "sesame butter"
      ]
    },
    {
      "name": "tamari",
      "aliases": [
        "tamari sauce",
        "gluten free soy sauce"
      ]
    },
    {
      "name": "teriyaki sauce",
      "aliases": [
        "teriyaki",
        "teriyaki marinade"
      ]
    },
    {
      "name": "tikka masala sauce",
      "aliases": [
        "tikka masala",
        "tikka masala simmer sauce"
      ]
    },
    {
      "name": "tortilla",
      "aliases": [
        "tortillas",
        "tortilla wrap",
        "tortilla wraps",
        "wraps"
      ]
    },
    {
      "name": "tostadas",
      "aliases": [
        "tostada",
        "tostada shells"
      ]
    },
    {
      "name": "wasabi",
      "aliases": [
        "wasabi paste"
      ]
    },
    {
      "name": "wonton wrappers",
      "aliases": [
        "wonton wrapper",
        "dumpling wrappers",
        "gyoza wrappers"
      ]
    }
  ],
  "Snacks & Candy": [
    {
      "name": "almonds",
      "aliases": [
        "almond",
        "roasted almonds",
        "salted almonds"
      ]
    },
    {
      "name": "animal crackers",
      "aliases": [
        "animal cracker",
        "animal cookies"
      ]
    },
    {
      "name": "barbecue chips",
      "aliases": [
        "bbq chips",
        "barbeque chips",
        "bar-b-q chips",
        "barbecue potato chips"
      ]
    },
    {
      "name": "beef jerky",
      "aliases": [
        "jerky",
        "beef stick",
        "dried beef",
        "meat stick",
        "beef jerkey"
      ]
    },
    {
      "name": "bubble gum",
      "aliases": [
        "bubblegum",
        "bubble gum balls",
        "gumballs"
      ]
    },
    {
      "name": "butter crackers",
      "aliases": [
        "buttery crackers",
        "round buttery crackers",
        "club crackers",
        "ritz crackers",
        "round crackers"
      ]
    },
    {
      "name": "candy",
      "aliases": [
        "candies",
        "sweets",
        "lollies"
      ]
    },
    {
      "name": "candy bar",
      "aliases": [
        "candy bars",
        "chocolate candy bar"
      ]
    },
    {
      "name": "candy corn",
      "aliases": [
        "candy corns"
      ]
    },
    {
      "name": "caramel popcorn",
      "aliases": [
        "caramel corn",
        "cracker jack",
        "caramel coated popcorn"
      ]
    },
    {
      "name": "caramels",
      "aliases": [
        "caramel",
        "caramel candy",
        "caramel candies"
      ]
    },
    {
      "name": "cashews",
      "aliases": [
        "cashew",
        "cashew nuts"
      ]
    },
    {
      "name": "cheese crackers",
      "aliases": [
        "cheese cracker",
        "cheddar crackers",
        "cheez-its",
        "cheez its",
        "goldfish crackers"
      ]
    },
    {
      "name": "cheese popcorn",
      "aliases": [
        "cheddar popcorn",
        "cheese flavored popcorn"
      ]
    },
    {
      "name": "cheese puffs",
      "aliases": [
        "cheese curls",
        "cheese balls",
        "cheese puff",
        "puffed cheese snacks",
        "cheetos"
      ]
    },
    {
      "name": "chocolate bar",
      "aliases": [
        "chocolate bars",
        "chocolate"
      ]
    },
    {
      "name": "chocolate chip cookies",
      "aliases": [
        "chocolate chip cookie",
        "choc chip cookies",
        "chocolate-chip cookies"
      ]
    },
    {
      "name": "chocolate truffles",
      "aliases": [
        "truffles",
        "chocolate truffle"
      ]
    },
    {
      "name": "chocolate-covered pretzels",
      "aliases": [
        "chocolate covered pretzels",
        "yogurt-covered pretzels",
        "yogurt covered pretzels",
        "chocolate covered pretzel"
      ]
    },
    {
      "name": "chocolate-covered raisins",
      "aliases": [
        "chocolate covered raisins",
        "raisinets"
      ]
    },
    {
      "name": "cookies",
      "aliases": [
        "cookie",
        "biscuits"
      ]
    },
    {
      "name": "corn chips",
      "aliases": [
        "corn chip",
        "fritos"
      ]
    },
    {
      "name": "crackers",
      "aliases": [
        "cracker"
      ]
    },
    {
      "name": "dark chocolate",
      "aliases": [
        "dark chocolate bar",
        "semisweet chocolate bar"
      ]
    },
    {
      "name": "fig bars",
      "aliases": [
        "fig newtons",
        "fig bar",
        "fig cookies"
      ]
    },
    {
      "name": "fruit roll-ups",
      "aliases": [
        "fruit leather",
        "fruit rolls",
        "fruit roll up",
        "fruit roll-up"
      ]
    },
    {
      "name": "fruit snacks",
      "aliases": [
        "fruit snack",
        "fruit gummies",
        "gummy fruit snacks"
      ]
    },
    {
      "name": "graham crackers",
      "aliases": [
        "graham cracker",
        "grahams"
      ]
    },
    {
      "name": "granola bars",
      "aliases": [
        "granola bar",
        "cereal bars",
        "cereal bar"
      ]
    },
    {
      "name": "gum",
      "aliases": [
        "chewing gum",
        "stick gum"
      ]
    },
    {
      "name": "gummy bears",
      "aliases": [
        "gummi bears",
        "gummy bear"
      ]
    },
    {
      "name": "gummy candy",
      "aliases": [
        "gummies",
        "gummi candy",
        "gummy candies"
      ]
    },
    {
      "name": "gummy worms",
      "aliases": [
        "gummi worms",
        "gummy worm"
      ]
    },
    {
      "name": "hard candy",
      "aliases": [
        "hard candies",
        "boiled sweets"
      ]
    },
    {
      "name": "honey roasted peanuts",
      "aliases": [
        "honey roasted peanut",
        "honey-roasted peanuts"
      ]
    },
    {
      "name": "jelly beans",
      "aliases": [
        "jelly bean",
        "jellybeans"
      ]
    },
    {
      "name": "kettle chips",
      "aliases": [
        "kettle chip",
        "kettle-cooked chips",
        "kettle cooked chips",
        "kettle potato chips"
      ]
    },
    {
      "name": "kettle corn",
      "aliases": [
        "kettlecorn",
        "kettle popcorn"
      ]
    },
    {
      "name": "licorice",
      "aliases": [
        "liquorice",
        "licorice candy",
        "twizzlers",
        "red licorice"
      ]
    },
    {
      "name": "lollipops",
      "aliases": [
        "lollipop",
        "suckers",
        "sucker",
        "lolly"
      ]
    },
    {
      "name": "macadamia nuts",
      "aliases": [
        "macadamia",
        "macadamia nut"
      ]
    },
    {
      "name": "microwave popcorn",
      "aliases": [
        "microwave pop corn",
        "microwaveable popcorn"
      ]
    },
    {
      "name": "milk chocolate",
      "aliases": [
        "milk chocolate bar",
        "milk chocolate candy"
      ]
    },
    {
      "name": "mint gum",
      "aliases": [
        "mint chewing gum",
        "peppermint gum",
        "spearmint gum"
      ]
    },
    {
      "name": "mints",
      "aliases": [
        "mint",
        "breath mints",
        "peppermints",
        "after dinner mints"
      ]
    },
    {
      "name": "mixed nuts",
      "aliases": [
        "mixed nut",
        "assorted nuts",
        "nut mix"
      ]
    },
    {
      "name": "multigrain crackers",
      "aliases": [
        "multigrain cracker",
        "whole grain crackers",
        "multi-grain crackers"
      ]
    },
    {
      "name": "nacho cheese tortilla chips",
      "aliases": [
        "nacho chips",
        "nacho cheese chips",
        "nacho tortilla chips",
        "doritos"
      ]
    },
    {
      "name": "oatmeal cookies",
      "aliases": [
        "oatmeal cookie",
        "oatmeal raisin cookies"
      ]
    },
    {
      "name": "oyster crackers",
      "aliases": [
        "oyster cracker",
        "soup crackers"
      ]
    },
    {
      "name": "peanut butter cups",
      "aliases": [
        "peanut butter cup",
        "pb cups",
        "reeses"
      ]
    },
    {
      "name": "peanuts",
      "aliases": [
        "peanut",
        "salted peanuts",
        "roasted peanuts",
        "dry roasted peanuts"
      ]
    },
    {
      "name": "pecans",
      "aliases": [
        "pecan"
      ]
    },
    {
      "name": "pistachios",
      "aliases": [
        "pistachio",
        "pistachio nuts"
      ]
    },
    {
      "name": "pita chips",
      "aliases": [
        "pita chip"
      ]
    },
    {
      "name": "plantain chips",
      "aliases": [
        "plantain chip",
        "platano chips"
      ]
    },
    {
      "name": "popcorn",
      "aliases": [
        "pop corn",
        "popped popcorn",
        "bagged popcorn"
      ]
    },
    {
      "name": "popcorn kernels",
      "aliases": [
        "popping corn",
        "unpopped popcorn",
        "popcorn kernel",
        "popcorn seeds"
      ]
    },
    {
      "name": "pork rinds",
      "aliases": [
        "pork rind",
        "chicharrones",
        "chicharron",
        "fried pork skins"
      ]
    },
    {
      "name": "potato chips",
      "aliases": [
        "chips",
        "potato chip",
        "crisps",
        "potato crisps"
      ]
    },
    {
      "name": "potato sticks",
      "aliases": [
        "shoestring potatoes",
        "potato stix",
        "shoestring potato sticks"
      ]
    },
    {
      "name": "pretzel rods",
      "aliases": [
        "pretzel rod"
      ]
    },
    {
      "name": "pretzel sticks",
      "aliases": [
        "pretzel stick",
        "stick pretzels"
      ]
    },
    {
      "name": "pretzels",
      "aliases": [
        "pretzel",
        "pretzel twists",
        "mini pretzels"
      ]
    },
    {
      "name": "protein bars",
      "aliases": [
        "protein bar",
        "energy bars",
        "energy bar"
      ]
    },
    {
      "name": "pumpkin seeds",
      "aliases": [
        "pumpkin seed",
        "pepitas"
      ]
    },
    {
      "name": "rice cakes",
      "aliases": [
        "rice cake"
      ]
    },
    {
      "name": "rice crackers",
      "aliases": [
        "rice cracker"
      ]
    },
    {
      "name": "ridged potato chips",
      "aliases": [
        "ruffled chips",
        "ridged chips",
        "wavy chips",
        "ruffles"
      ]
    },
    {
      "name": "salt and vinegar chips",
      "aliases": [
        "salt & vinegar chips",
        "salt and vinegar potato chips"
      ]
    },
    {
      "name": "saltine crackers",
      "aliases": [
        "saltines",
        "soda crackers",
        "saltine",
        "soda cracker"
      ]
    },
    {
      "name": "sandwich cookies",
      "aliases": [
        "cream-filled cookies",
        "cream filled cookies",
        "chocolate sandwich cookies",
        "oreos",
        "oreo"
      ]
    },
    {
      "name": "shortbread cookies",
      "aliases": [
        "shortbread",
        "shortbread cookie"
      ]
    },
    {
      "name": "snack mix",
      "aliases": [
        "party mix",
        "chex mix",
        "savory snack mix",
        "cracker mix"
      ]
    },
    {
      "name": "sour candy",
      "aliases": [
        "sour candies",
        "sour gummies",
        "sour gummy candy"
      ]
    },
    {
      "name": "sour cream and onion chips",
      "aliases": [
        "sour cream & onion chips",
        "sour cream and onion potato chips"
      ]
    },
    {
      "name": "sugar-free gum",
      "aliases": [
        "sugar free gum",
        "sugarless gum"
      ]
    },
    {
      "name": "sunflower seeds",
      "aliases": [
        "sunflower seed",
        "sunflower kernels"
      ]
    },
    {
      "name": "taffy",
      "aliases": [
        "saltwater taffy",
        "salt water taffy",
        "salt-water taffy"
      ]
    },
    {
      "name": "tortilla chips",
      "aliases": [
        "tortilla chip",
        "corn tortilla chips",
        "restaurant style tortilla chips"
      ]
    },
    {
      "name": "trail mix",
      "aliases": [
        "trailmix",
        "gorp",
        "fruit and nut mix"
      ]
    },
    {
      "name": "vanilla wafers",
      "aliases": [
        "vanilla wafer",
        "nilla wafers"
      ]
    },
    {
      "name": "veggie chips",
      "aliases": [
        "vegetable chips",
        "veggie straws",
        "veggie chip",
        "veggie stix"
      ]
    },
    {
      "name": "wafer cookies",
      "aliases": [
        "wafer cookie",
        "sugar wafers"
      ]
    },
    {
      "name": "walnuts",
      "aliases": [
        "walnut"
      ]
    },
    {
      "name": "water crackers",
      "aliases": [
        "water cracker"
      ]
    },
    {
      "name": "wheat crackers",
      "aliases": [
        "wheat cracker",
        "whole wheat crackers",
        "wheat thins"
      ]
    },
    {
      "name": "white chocolate",
      "aliases": [
        "white chocolate bar"
      ]
    }
  ],
  "Beverages": [
    {
      "name": "alkaline water",
      "aliases": [
        "alkaline waters",
        "ph water"
      ]
    },
    {
      "name": "aloe vera drink",
      "aliases": [
        "aloe drink",
        "aloe vera juice",
        "aloe juice"
      ]
    },
    {
      "name": "apple cider",
      "aliases": [
        "cider",
        "sweet cider",
        "fresh cider",
        "non-alcoholic cider"
      ]
    },
    {
      "name": "apple juice",
      "aliases": [
        "apple juices"
      ]
    },
    {
      "name": "black tea",
      "aliases": [
        "black teas",
        "tea bags",
        "tea"
      ]
    },
    {
      "name": "bottled water",
      "aliases": [
        "water",
        "drinking water",
        "bottled waters",
        "still water"
      ]
    },
    {
      "name": "cappuccino mix",
      "aliases": [
        "instant cappuccino",
        "cappuccino",
        "latte mix"
      ]
    },
    {
      "name": "carrot juice",
      "aliases": [
        "carrot juices"
      ]
    },
    {
      "name": "chai tea",
      "aliases": [
        "chai",
        "chai latte",
        "masala chai",
        "chai tea mix"
      ]
    },
    {
      "name": "chamomile tea",
      "aliases": [
        "chamomile teas"
      ]
    },
    {
      "name": "cherry juice",
      "aliases": [
        "tart cherry juice",
        "cherry juices"
      ]
    },
    {
      "name": "club soda",
      "aliases": [
        "club sodas"
      ]
    },
    {
      "name": "coconut water",
      "aliases": [
        "coconut waters"
      ]
    },
    {
      "name": "coffee pods",
      "aliases": [
        "k-cups",
        "k cups",
        "kcups",
        "coffee capsules",
        "keurig pods",
        "coffee pod"
      ]
    },
    {
      "name": "cola",
      "aliases": [
        "colas",
        "coke",
        "cola soda"
      ]
    },
    {
      "name": "cold brew coffee",
      "aliases": [
        "cold brew",
        "cold-brew coffee"
      ]
    },
    {
      "name": "cranberry juice",
      "aliases": [
        "cranberry juices",
        "cranberry juice cocktail"
      ]
    },
    {
      "name": "cream soda",
      "aliases": [
        "cream sodas"
      ]
    },
    {
      "name": "decaf coffee",
      "aliases": [
        "decaffeinated coffee",
        "decaf"
      ]
    },
    {
      "name": "diet cola",
      "aliases": [
        "diet coke",
        "diet colas",
        "zero sugar cola"
      ]
    },
    {
      "name": "diet soda",
      "aliases": [
        "diet pop",
        "diet soft drink",
        "diet sodas",
        "zero sugar soda"
      ]
    },
    {
      "name": "distilled water",
      "aliases": [
        "distilled waters"
      ]
    },
    {
      "name": "earl grey tea",
      "aliases": [
        "earl grey",
        "earl gray tea"
      ]
    },
    {
      "name": "electrolyte powder",
      "aliases": [
        "electrolyte mix",
        "electrolyte drink mix",
        "hydration powder",
        "liquid iv",
        "hydration mix"
      ]
    },
    {
      "name": "energy drink",
      "aliases": [
        "energy drinks",
        "red bull",
        "monster"
      ]
    },
    {
      "name": "energy shot",
      "aliases": [
        "energy shots",
        "5 hour energy",
        "5-hour energy"
      ]
    },
    {
      "name": "espresso",
      "aliases": [
        "espresso coffee",
        "ground espresso",
        "espresso beans"
      ]
    },
    {
      "name": "flavored water",
      "aliases": [
        "flavored waters",
        "vitamin water",
        "enhanced water",
        "fitness water"
      ]
    },
    {
      "name": "fruit punch",
      "aliases": [
        "fruit punches",
        "punch",
        "hawaiian punch"
      ]
    },
    {
      "name": "ginger ale",
      "aliases": [
        "ginger ales"
      ]
    },
    {
      "name": "ginger beer",
      "aliases": [
        "ginger beers",
        "non-alcoholic ginger beer"
      ]
    },
    {
      "name": "grape juice",
      "aliases": [
        "grape juices"
      ]
    },
    {
      "name": "grape soda",
      "aliases": [
        "grape sodas",
        "grape pop"
      ]
    },
    {
      "name": "grapefruit juice",
      "aliases": [
        "grapefruit juices"
      ]
    },
    {
      "name": "green tea",
      "aliases": [
        "green teas"
      ]
    },
    {
      "name": "ground coffee",
      "aliases": [
        "coffee",
        "ground coffees"
      ]
    },
    {
      "name": "herbal tea",
      "aliases": [
        "herbal teas",
        "herbal infusion"
      ]
    },
    {
      "name": "hot chocolate mix",
      "aliases": [
        "hot cocoa mix",
        "cocoa mix",
        "hot chocolate",
        "drinking chocolate",
        "hot cocoa"
      ]
    },
    {
      "name": "iced coffee",
      "aliases": [
        "bottled iced coffee",
        "iced coffees",
        "ready to drink coffee"
      ]
    },
    {
      "name": "iced tea",
      "aliases": [
        "ice tea",
        "iced teas",
        "bottled iced tea"
      ]
    },
    {
      "name": "iced tea mix",
      "aliases": [
        "ice tea mix",
        "powdered iced tea",
        "tea mix"
      ]
    },
    {
      "name": "instant coffee",
      "aliases": [
        "instant coffees"
      ]
    },
    {
      "name": "juice",
      "aliases": [
        "juices"
      ]
    },
    {
      "name": "kombucha",
      "aliases": [
        "kombuchas",
        "fermented tea"
      ]
    },
    {
      "name": "lemon juice",
      "aliases": [
        "bottled lemon juice",
        "lemon juices"
      ]
    },
    {
      "name": "lemon-lime soda",
      "aliases": [
        "lemon lime soda",
        "lemon-lime sodas",
        "sprite",
        "seven up",
        "7up"
      ]
    },
    {
      "name": "lemonade",
      "aliases": [
        "lemonades"
      ]
    },
    {
      "name": "lemonade mix",
      "aliases": [
        "powdered lemonade",
        "lemonade mixes"
      ]
    },
    {
      "name": "lime juice",
      "aliases": [
        "bottled lime juice",
        "lime juices"
      ]
    },
    {
      "name": "limeade",
      "aliases": [
        "limeades"
      ]
    },
    {
      "name": "mango juice",
      "aliases": [
        "mango nectar",
        "mango juices"
      ]
    },
    {
      "name": "matcha",
      "aliases": [
        "matcha powder",
        "matcha green tea"
      ]
    },
    {
      "name": "meal replacement shake",
      "aliases": [
        "meal replacement drink",
        "nutrition shake",
        "ensure",
        "nutritional shake"
      ]
    },
    {
      "name": "mineral water",
      "aliases": [
        "mineral waters",
        "sparkling mineral water"
      ]
    },
    {
      "name": "oolong tea",
      "aliases": [
        "oolong teas"
      ]
    },
    {
      "name": "orange juice",
      "aliases": [
        "oj",
        "orange juices"
      ]
    },
    {
      "name": "orange soda",
      "aliases": [
        "orange sodas",
        "orange pop"
      ]
    },
    {
      "name": "peppermint tea",
      "aliases": [
        "mint tea",
        "peppermint teas"
      ]
    },
    {
      "name": "pineapple juice",
      "aliases": [
        "pineapple juices"
      ]
    },
    {
      "name": "pomegranate juice",
      "aliases": [
        "pomegranate juices",
        "pom juice"
      ]
    },
    {
      "name": "powdered drink mix",
      "aliases": [
        "drink mix",
        "kool-aid",
        "powdered drink mixes",
        "crystal light",
        "fruit drink mix"
      ]
    },
    {
      "name": "protein shake",
      "aliases": [
        "protein drink",
        "protein shakes",
        "ready to drink protein"
      ]
    },
    {
      "name": "prune juice",
      "aliases": [
        "prune juices"
      ]
    },
    {
      "name": "purified water",
      "aliases": [
        "purified waters"
      ]
    },
    {
      "name": "rooibos tea",
      "aliases": [
        "red tea",
        "rooibos"
      ]
    },
    {
      "name": "root beer",
      "aliases": [
        "root beers"
      ]
    },
    {
      "name": "smoothie",
      "aliases": [
        "bottled smoothie",
        "fruit smoothie",
        "smoothies"
      ]
    },
    {
      "name": "soda",
      "aliases": [
        "pop",
        "soft drink",
        "soft drinks",
        "sodas",
        "fizzy drink",
        "soda pop"
      ]
    },
    {
      "name": "sparkling cider",
      "aliases": [
        "sparkling apple cider",
        "sparkling juice",
        "sparkling grape juice"
      ]
    },
    {
      "name": "sparkling water",
      "aliases": [
        "seltzer",
        "seltzer water",
        "carbonated water",
        "fizzy water",
        "sparkling waters",
        "soda water"
      ]
    },
    {
      "name": "sports drink",
      "aliases": [
        "gatorade",
        "powerade",
        "electrolyte drink",
        "sports drinks"
      ]
    },
    {
      "name": "spring water",
      "aliases": [
        "spring waters"
      ]
    },
    {
      "name": "sweet tea",
      "aliases": [
        "sweet teas",
        "sweetened iced tea",
        "sweet iced tea"
      ]
    },
    {
      "name": "tomato juice",
      "aliases": [
        "tomato juices"
      ]
    },
    {
      "name": "tonic water",
      "aliases": [
        "tonic",
        "tonic waters"
      ]
    },
    {
      "name": "vegetable juice",
      "aliases": [
        "veggie juice",
        "v8",
        "vegetable juices",
        "tomato vegetable juice"
      ]
    },
    {
      "name": "water enhancer",
      "aliases": [
        "liquid water enhancer",
        "water flavoring",
        "mio",
        "water drops"
      ]
    },
    {
      "name": "white tea",
      "aliases": [
        "white teas"
      ]
    },
    {
      "name": "whole bean coffee",
      "aliases": [
        "coffee beans",
        "whole coffee beans",
        "whole-bean coffee"
      ]
    }
  ],
  "Household & Cleaning": [
    {
      "name": "9-volt batteries",
      "aliases": [
        "9 volt battery",
        "9v battery",
        "nine volt battery",
        "9-volt battery"
      ]
    },
    {
      "name": "aa batteries",
      "aliases": [
        "aa battery",
        "double a batteries",
        "double a battery"
      ]
    },
    {
      "name": "aaa batteries",
      "aliases": [
        "aaa battery",
        "triple a batteries",
        "triple a battery"
      ]
    },
    {
      "name": "air freshener",
      "aliases": [
        "room spray",
        "air freshener spray",
        "room freshener",
        "air fresheners"
      ]
    },
    {
      "name": "all-purpose cleaner",
      "aliases": [
        "all purpose cleaner",
        "multi-surface cleaner",
        "multipurpose cleaner",
        "multi-purpose cleaner",
        "general cleaner"
      ]
    },
    {
      "name": "aluminum foil",
      "aliases": [
        "tin foil",
        "foil",
        "aluminium foil",
        "kitchen foil"
      ]
    },
    {
      "name": "bathroom cleaner",
      "aliases": [
        "bathroom cleaning spray",
        "bathroom spray",
        "shower cleaner"
      ]
    },
    {
      "name": "battery",
      "aliases": [
        "batteries"
      ]
    },
    {
      "name": "bleach",
      "aliases": [
        "chlorine bleach",
        "laundry bleach",
        "liquid bleach"
      ]
    },
    {
      "name": "broom",
      "aliases": [
        "sweeping broom",
        "brooms",
        "push broom"
      ]
    },
    {
      "name": "button batteries",
      "aliases": [
        "coin batteries",
        "watch batteries",
        "coin cell batteries",
        "button cell batteries",
        "coin cells"
      ]
    },
    {
      "name": "c batteries",
      "aliases": [
        "c battery",
        "c cell batteries",
        "c-cell batteries"
      ]
    },
    {
      "name": "carpet cleaner",
      "aliases": [
        "carpet stain remover",
        "carpet shampoo",
        "carpet spot cleaner",
        "carpet spray"
      ]
    },
    {
      "name": "carpet deodorizer",
      "aliases": [
        "carpet powder",
        "carpet fresh",
        "carpet deodorizing powder",
        "carpet freshener"
      ]
    },
    {
      "name": "cleaning bucket",
      "aliases": [
        "mop bucket",
        "bucket",
        "pail",
        "wash bucket"
      ]
    },
    {
      "name": "clothespins",
      "aliases": [
        "clothespin",
        "clothes pins",
        "clothes pegs",
        "pegs",
        "clothes pin"
      ]
    },
    {
      "name": "d batteries",
      "aliases": [
        "d battery",
        "d cell batteries",
        "d-cell batteries"
      ]
    },
    {
      "name": "degreaser",
      "aliases": [
        "kitchen degreaser",
        "grease remover",
        "grease cleaner"
      ]
    },
    {
      "name": "dish cloths",
      "aliases": [
        "dishcloth",
        "dish rags",
        "dish rag",
        "dishcloths",
        "washcloths"
      ]
    },
    {
      "name": "dish soap",
      "aliases": [
        "dishwashing liquid",
        "dishwashing soap",
        "dish washing liquid",
        "dish liquid",
        "dish detergent",
        "dishwashing detergent"
      ]
    },
    {
      "name": "dish towels",
      "aliases": [
        "dish towel",
        "tea towels",
        "kitchen towels",
        "kitchen towel",
        "kitchen cloths"
      ]
    },
    {
      "name": "dishwasher detergent",
      "aliases": [
        "dishwasher pods",
        "dishwasher tabs",
        "dishwasher tablets",
        "dishwasher soap",
        "dishwasher packs",
        "automatic dishwasher detergent"
      ]
    },
    {
      "name": "disinfectant spray",
      "aliases": [
        "disinfectant",
        "lysol spray",
        "sanitizing spray",
        "disinfecting spray"
      ]
    },
    {
      "name": "disinfecting wipes",
      "aliases": [
        "disinfectant wipes",
        "cleaning wipes",
        "clorox wipes",
        "sanitizing wipes",
        "surface wipes",
        "lysol wipes"
      ]
    },
    {
      "name": "drain cleaner",
      "aliases": [
        "drain opener",
        "drano",
        "clog remover",
        "liquid plumber",
        "drain unclogger"
      ]
    },
    {
      "name": "dryer sheets",
      "aliases": [
        "dryer sheet",
        "fabric softener sheets",
        "tumble dryer sheets"
      ]
    },
    {
      "name": "duster",
      "aliases": [
        "feather duster",
        "dusting cloth",
        "dusters",
        "microfiber duster"
      ]
    },
    {
      "name": "dustpan",
      "aliases": [
        "dust pan",
        "dustpans",
        "broom and dustpan"
      ]
    },
    {
      "name": "fabric softener",
      "aliases": [
        "fabric conditioner",
        "softener",
        "liquid fabric softener"
      ]
    },
    {
      "name": "facial tissues",
      "aliases": [
        "tissues",
        "facial tissue",
        "kleenex",
        "face tissue",
        "tissue"
      ]
    },
    {
      "name": "flood light bulbs",
      "aliases": [
        "floodlight bulbs",
        "flood lights",
        "flood light bulb",
        "floodlights"
      ]
    },
    {
      "name": "floor cleaner",
      "aliases": [
        "floor cleaning solution",
        "hardwood floor cleaner",
        "tile floor cleaner",
        "floor wash",
        "mopping solution"
      ]
    },
    {
      "name": "food storage bags",
      "aliases": [
        "storage bags",
        "ziploc bags",
        "zipper bags",
        "zip bags",
        "resealable bags",
        "zip-top bags",
        "baggies"
      ]
    },
    {
      "name": "food storage containers",
      "aliases": [
        "storage containers",
        "tupperware",
        "plastic containers",
        "leftover containers",
        "food containers"
      ]
    },
    {
      "name": "freezer bags",
      "aliases": [
        "freezer storage bags",
        "freezer ziploc bags",
        "gallon freezer bags"
      ]
    },
    {
      "name": "furniture polish",
      "aliases": [
        "wood polish",
        "furniture spray",
        "pledge",
        "dusting spray"
      ]
    },
    {
      "name": "glass cleaner",
      "aliases": [
        "window cleaner",
        "windex",
        "glass and window cleaner"
      ]
    },
    {
      "name": "kitchen trash bags",
      "aliases": [
        "kitchen garbage bags",
        "tall kitchen bags",
        "kitchen bags",
        "tall kitchen garbage bags"
      ]
    },
    {
      "name": "laundry detergent",
      "aliases": [
        "laundry soap",
        "washing detergent",
        "clothes detergent",
        "washing powder",
        "laundry pods",
        "laundry pacs",
        "washing liquid"
      ]
    },
    {
      "name": "lawn and leaf bags",
      "aliases": [
        "yard bags",
        "leaf bags",
        "lawn bags",
        "yard waste bags"
      ]
    },
    {
      "name": "led light bulbs",
      "aliases": [
        "led bulbs",
        "led lightbulbs",
        "led light bulb",
        "led bulb"
      ]
    },
    {
      "name": "light bulbs",
      "aliases": [
        "lightbulbs",
        "light bulb",
        "lightbulb",
        "bulbs",
        "light globes"
      ]
    },
    {
      "name": "lighter",
      "aliases": [
        "lighters",
        "utility lighter",
        "bbq lighter",
        "grill lighter",
        "long lighter"
      ]
    },
    {
      "name": "lint roller",
      "aliases": [
        "lint rollers",
        "lint brush",
        "lint remover"
      ]
    },
    {
      "name": "matches",
      "aliases": [
        "match",
        "matchbook",
        "kitchen matches",
        "matchbox",
        "wooden matches"
      ]
    },
    {
      "name": "microfiber cloth",
      "aliases": [
        "microfiber cloths",
        "microfiber towel",
        "cleaning cloth",
        "microfiber rags",
        "cleaning cloths"
      ]
    },
    {
      "name": "mold and mildew remover",
      "aliases": [
        "mildew remover",
        "mold remover",
        "mildew cleaner",
        "mold cleaner",
        "mold spray"
      ]
    },
    {
      "name": "mop",
      "aliases": [
        "floor mop",
        "sponge mop",
        "mop head",
        "string mop",
        "spin mop"
      ]
    },
    {
      "name": "odor eliminator",
      "aliases": [
        "odor remover",
        "odor neutralizer",
        "fabric refresher",
        "febreze",
        "fabric spray",
        "odor spray"
      ]
    },
    {
      "name": "oven cleaner",
      "aliases": [
        "oven cleaning spray",
        "oven and grill cleaner"
      ]
    },
    {
      "name": "oxygen bleach",
      "aliases": [
        "color-safe bleach",
        "oxiclean",
        "oxi",
        "all-fabric bleach",
        "color safe bleach",
        "non-chlorine bleach"
      ]
    },
    {
      "name": "paper cups",
      "aliases": [
        "paper cup",
        "disposable cups"
      ]
    },
    {
      "name": "paper napkins",
      "aliases": [
        "napkins",
        "napkin",
        "paper napkin",
        "dinner napkins"
      ]
    },
    {
      "name": "paper plates",
      "aliases": [
        "paper plate",
        "disposable plates"
      ]
    },
    {
      "name": "paper towels",
      "aliases": [
        "paper towel",
        "kitchen roll",
        "kitchen towels"
      ]
    },
    {
      "name": "parchment paper",
      "aliases": [
        "baking paper",
        "parchment",
        "parchment baking paper"
      ]
    },
    {
      "name": "plastic cups",
      "aliases": [
        "plastic cup",
        "party cups",
        "solo cups",
        "red cups"
      ]
    },
    {
      "name": "plastic utensils",
      "aliases": [
        "plastic cutlery",
        "plastic silverware",
        "disposable utensils",
        "plastic forks",
        "plastic spoons",
        "plastic knives"
      ]
    },
    {
      "name": "plastic wrap",
      "aliases": [
        "cling film",
        "cling wrap",
        "saran wrap",
        "plastic food wrap",
        "food wrap"
      ]
    },
    {
      "name": "plug-in air freshener",
      "aliases": [
        "plug in air freshener",
        "scented plug-in",
        "wall plug air freshener",
        "air freshener plug-in",
        "scented oil plug-in"
      ]
    },
    {
      "name": "plunger",
      "aliases": [
        "toilet plunger",
        "plungers"
      ]
    },
    {
      "name": "rechargeable batteries",
      "aliases": [
        "rechargeable battery",
        "nimh batteries"
      ]
    },
    {
      "name": "rinse aid",
      "aliases": [
        "dishwasher rinse aid",
        "jet dry",
        "rinse agent"
      ]
    },
    {
      "name": "rubber gloves",
      "aliases": [
        "cleaning gloves",
        "dishwashing gloves",
        "dish gloves",
        "kitchen gloves",
        "household gloves"
      ]
    },
    {
      "name": "sandwich bags",
      "aliases": [
        "sandwich baggies",
        "snack bags",
        "sandwich baggie"
      ]
    },
    {
      "name": "scent booster",
      "aliases": [
        "laundry scent booster",
        "scent beads",
        "in-wash scent booster",
        "scent boosters"
      ]
    },
    {
      "name": "scouring pads",
      "aliases": [
        "scouring pad",
        "scrub pads",
        "scouring sponge",
        "scrubber",
        "scrubbing pads"
      ]
    },
    {
      "name": "scrub brush",
      "aliases": [
        "scrubbing brush",
        "dish brush",
        "cleaning brush",
        "scrub brushes"
      ]
    },
    {
      "name": "small trash bags",
      "aliases": [
        "small garbage bags",
        "bathroom trash bags",
        "mini trash bags",
        "wastebasket bags"
      ]
    },
    {
      "name": "sponges",
      "aliases": [
        "sponge",
        "kitchen sponge",
        "dish sponge",
        "scrub sponge"
      ]
    },
    {
      "name": "spray starch",
      "aliases": [
        "laundry starch",
        "starch",
        "ironing starch"
      ]
    },
    {
      "name": "stain remover",
      "aliases": [
        "laundry stain remover",
        "stain treatment",
        "pre-treater",
        "spot remover",
        "stain stick"
      ]
    },
    {
      "name": "stainless steel cleaner",
      "aliases": [
        "stainless cleaner",
        "appliance cleaner",
        "stainless steel polish"
      ]
    },
    {
      "name": "steel wool",
      "aliases": [
        "steel wool pads",
        "brillo",
        "brillo pads",
        "soap pads"
      ]
    },
    {
      "name": "toilet bowl cleaner",
      "aliases": [
        "toilet cleaner",
        "toilet bowl gel",
        "toilet cleaning liquid"
      ]
    },
    {
      "name": "toilet brush",
      "aliases": [
        "toilet bowl brush",
        "toilet scrubber",
        "bowl brush"
      ]
    },
    {
      "name": "toilet paper",
      "aliases": [
        "toilet tissue",
        "bath tissue",
        "bathroom tissue",
        "tp",
        "toilet rolls",
        "toilet roll"
      ]
    },
    {
      "name": "trash bags",
      "aliases": [
        "garbage bags",
        "trash bag",
        "garbage bag",
        "bin bags",
        "bin liners",
        "trash liners"
      ]
    },
    {
      "name": "tub and tile cleaner",
      "aliases": [
        "tub cleaner",
        "soap scum remover",
        "tile cleaner",
        "tub and tile spray"
      ]
    },
    {
      "name": "wax paper",
      "aliases": [
        "waxed paper"
      ]
    }
  ],
  "Personal Care & Health": [
    {
      "name": "acetaminophen",
      "aliases": [
        "tylenol",
        "paracetamol",
        "pain reliever"
      ]
    },
    {
      "name": "acne treatment",
      "aliases": [
        "acne cream",
        "pimple cream",
        "benzoyl peroxide",
        "salicylic acid",
        "spot treatment"
      ]
    },
    {
      "name": "aftershave",
      "aliases": [
        "after shave",
        "aftershave lotion",
        "aftershave balm"
      ]
    },
    {
      "name": "allergy medicine",
      "aliases": [
        "antihistamine",
        "allergy pills",
        "allergy relief",
        "claritin",
        "zyrtec",
        "benadryl"
      ]
    },
    {
      "name": "antacid",
      "aliases": [
        "antacids",
        "tums",
        "heartburn relief",
        "acid reducer"
      ]
    },
    {
      "name": "anti-diarrheal",
      "aliases": [
        "anti diarrheal",
        "diarrhea medicine",
        "imodium"
      ]
    },
    {
      "name": "antibiotic ointment",
      "aliases": [
        "neosporin",
        "triple antibiotic ointment",
        "first aid ointment"
      ]
    },
    {
      "name": "antiseptic wipes",
      "aliases": [
        "alcohol wipes",
        "antiseptic wipe",
        "first aid wipes"
      ]
    },
    {
      "name": "aspirin",
      "aliases": [
        "acetylsalicylic acid",
        "bayer"
      ]
    },
    {
      "name": "bandage",
      "aliases": [
        "bandages",
        "band-aids",
        "band aids",
        "adhesive bandages",
        "plasters"
      ]
    },
    {
      "name": "bar soap",
      "aliases": [
        "soap",
        "bath soap",
        "body soap",
        "soap bar",
        "bars of soap",
        "bath bar"
      ]
    },
    {
      "name": "body lotion",
      "aliases": [
        "lotion",
        "moisturizer",
        "body moisturizer",
        "skin lotion",
        "lotions"
      ]
    },
    {
      "name": "body spray",
      "aliases": [
        "body mist",
        "fragrance spray"
      ]
    },
    {
      "name": "body wash",
      "aliases": [
        "shower gel",
        "body washes"
      ]
    },
    {
      "name": "calcium supplement",
      "aliases": [
        "calcium",
        "calcium pills",
        "calcium tablets"
      ]
    },
    {
      "name": "cold medicine",
      "aliases": [
        "cold and flu medicine",
        "flu medicine",
        "cold remedy",
        "cold & flu"
      ]
    },
    {
      "name": "conditioner",
      "aliases": [
        "hair conditioner",
        "conditioners"
      ]
    },
    {
      "name": "contact lens solution",
      "aliases": [
        "contact solution",
        "lens solution",
        "contact lens cleaner"
      ]
    },
    {
      "name": "cotton ball",
      "aliases": [
        "cotton balls"
      ]
    },
    {
      "name": "cotton pad",
      "aliases": [
        "cotton pads",
        "cotton rounds",
        "facial cotton"
      ]
    },
    {
      "name": "cotton swab",
      "aliases": [
        "cotton swabs",
        "q-tips",
        "q tips",
        "qtips",
        "cotton buds"
      ]
    },
    {
      "name": "cough drops",
      "aliases": [
        "throat lozenges",
        "lozenges",
        "throat drops"
      ]
    },
    {
      "name": "cough syrup",
      "aliases": [
        "cough medicine",
        "cough liquid"
      ]
    },
    {
      "name": "dental floss",
      "aliases": [
        "floss",
        "flossers",
        "floss picks",
        "dental picks"
      ]
    },
    {
      "name": "denture cleaner",
      "aliases": [
        "denture tablets",
        "denture cleanser",
        "denture cleaning tablets"
      ]
    },
    {
      "name": "deodorant",
      "aliases": [
        "antiperspirant",
        "anti-perspirant",
        "deodorants",
        "roll-on deodorant"
      ]
    },
    {
      "name": "disposable razor",
      "aliases": [
        "disposable razors"
      ]
    },
    {
      "name": "dry shampoo",
      "aliases": [
        "dry shampoos"
      ]
    },
    {
      "name": "electric toothbrush",
      "aliases": [
        "power toothbrush",
        "rechargeable toothbrush",
        "electric toothbrushes"
      ]
    },
    {
      "name": "epsom salt",
      "aliases": [
        "epsom salts",
        "bath salt"
      ]
    },
    {
      "name": "eye drops",
      "aliases": [
        "eyedrops",
        "artificial tears",
        "eye wash"
      ]
    },
    {
      "name": "face moisturizer",
      "aliases": [
        "facial moisturizer",
        "face cream",
        "facial cream"
      ]
    },
    {
      "name": "face wash",
      "aliases": [
        "facial cleanser",
        "facial wash",
        "face cleanser"
      ]
    },
    {
      "name": "facial toner",
      "aliases": [
        "toner",
        "skin toner"
      ]
    },
    {
      "name": "feminine wash",
      "aliases": [
        "feminine hygiene wash",
        "intimate wash"
      ]
    },
    {
      "name": "feminine wipes",
      "aliases": [
        "feminine wipe",
        "feminine hygiene wipes",
        "intimate wipes"
      ]
    },
    {
      "name": "fish oil",
      "aliases": [
        "omega-3",
        "omega 3",
        "omega-3 supplement"
      ]
    },
    {
      "name": "gauze",
      "aliases": [
        "gauze pads",
        "medical gauze"
      ]
    },
    {
      "name": "hair dye",
      "aliases": [
        "hair color",
        "hair colour",
        "hair colorant",
        "box dye",
        "hair dyes"
      ]
    },
    {
      "name": "hair gel",
      "aliases": [
        "styling gel"
      ]
    },
    {
      "name": "hairspray",
      "aliases": [
        "hair spray"
      ]
    },
    {
      "name": "hand cream",
      "aliases": [
        "hand lotion",
        "hand moisturizer"
      ]
    },
    {
      "name": "hand sanitizer",
      "aliases": [
        "hand gel",
        "sanitizer",
        "antibacterial gel"
      ]
    },
    {
      "name": "hand soap",
      "aliases": [
        "liquid hand soap",
        "hand wash",
        "hand washing soap",
        "hand soaps",
        "hand cleanser",
        "liquid soap",
        "handsoap"
      ]
    },
    {
      "name": "hydrocortisone cream",
      "aliases": [
        "cortisone cream",
        "anti-itch cream",
        "itch cream"
      ]
    },
    {
      "name": "hydrogen peroxide",
      "aliases": [
        "peroxide"
      ]
    },
    {
      "name": "ibuprofen",
      "aliases": [
        "advil",
        "motrin",
        "pain reliever",
        "nsaid",
        "painkiller"
      ]
    },
    {
      "name": "iron supplement",
      "aliases": [
        "iron pills",
        "iron tablets",
        "iron"
      ]
    },
    {
      "name": "laxative",
      "aliases": [
        "laxatives",
        "stool softener"
      ]
    },
    {
      "name": "lip balm",
      "aliases": [
        "chapstick",
        "chap stick",
        "lip moisturizer"
      ]
    },
    {
      "name": "loofah",
      "aliases": [
        "bath sponge",
        "shower sponge",
        "body sponge",
        "luffa"
      ]
    },
    {
      "name": "magnesium supplement",
      "aliases": [
        "magnesium",
        "magnesium pills"
      ]
    },
    {
      "name": "makeup remover",
      "aliases": [
        "make up remover",
        "makeup wipes",
        "makeup remover wipes",
        "makeup removers"
      ]
    },
    {
      "name": "medical tape",
      "aliases": [
        "first aid tape",
        "adhesive tape",
        "surgical tape"
      ]
    },
    {
      "name": "melatonin",
      "aliases": [
        "melatonin supplement",
        "sleep aid"
      ]
    },
    {
      "name": "menstrual cup",
      "aliases": [
        "menstrual cups",
        "period cup"
      ]
    },
    {
      "name": "mouthwash",
      "aliases": [
        "mouth wash",
        "mouth rinse",
        "oral rinse"
      ]
    },
    {
      "name": "multivitamin",
      "aliases": [
        "multivitamins",
        "multi vitamin",
        "daily vitamin",
        "gummy vitamins"
      ]
    },
    {
      "name": "nail clippers",
      "aliases": [
        "nail clipper",
        "fingernail clippers"
      ]
    },
    {
      "name": "nail file",
      "aliases": [
        "emery board",
        "nail files"
      ]
    },
    {
      "name": "nail polish remover",
      "aliases": [
        "nail polish removers",
        "acetone"
      ]
    },
    {
      "name": "naproxen",
      "aliases": [
        "aleve"
      ]
    },
    {
      "name": "nasal spray",
      "aliases": [
        "nose spray",
        "saline spray",
        "nasal decongestant spray"
      ]
    },
    {
      "name": "panty liner",
      "aliases": [
        "panty liners",
        "pantyliners"
      ]
    },
    {
      "name": "petroleum jelly",
      "aliases": [
        "vaseline",
        "petrolatum"
      ]
    },
    {
      "name": "prenatal vitamins",
      "aliases": [
        "prenatal vitamin",
        "prenatals"
      ]
    },
    {
      "name": "probiotics",
      "aliases": [
        "probiotic",
        "probiotic supplement"
      ]
    },
    {
      "name": "razor",
      "aliases": [
        "razors",
        "safety razor",
        "shaving razor"
      ]
    },
    {
      "name": "razor blade",
      "aliases": [
        "razor blades",
        "replacement blades",
        "razor refills",
        "razor cartridges"
      ]
    },
    {
      "name": "replacement toothbrush head",
      "aliases": [
        "brush heads",
        "toothbrush heads",
        "electric toothbrush heads",
        "replacement brush heads"
      ]
    },
    {
      "name": "rubbing alcohol",
      "aliases": [
        "isopropyl alcohol",
        "isopropyl"
      ]
    },
    {
      "name": "sanitary pad",
      "aliases": [
        "pads",
        "maxi pads",
        "sanitary napkins",
        "menstrual pads",
        "feminine pads"
      ]
    },
    {
      "name": "shampoo",
      "aliases": [
        "shampoos"
      ]
    },
    {
      "name": "shaving cream",
      "aliases": [
        "shave cream",
        "shaving foam"
      ]
    },
    {
      "name": "shaving gel",
      "aliases": [
        "shave gel"
      ]
    },
    {
      "name": "sunscreen",
      "aliases": [
        "sunblock",
        "sun block",
        "spf",
        "sun cream",
        "suntan lotion"
      ]
    },
    {
      "name": "tampon",
      "aliases": [
        "tampons"
      ]
    },
    {
      "name": "teeth whitening strips",
      "aliases": [
        "whitening strips",
        "tooth whitening strips",
        "teeth whitener"
      ]
    },
    {
      "name": "thermometer",
      "aliases": [
        "digital thermometer",
        "fever thermometer"
      ]
    },
    {
      "name": "toothbrush",
      "aliases": [
        "tooth brush",
        "toothbrushes",
        "manual toothbrush"
      ]
    },
    {
      "name": "toothpaste",
      "aliases": [
        "tooth paste",
        "toothpastes"
      ]
    },
    {
      "name": "toothpick",
      "aliases": [
        "toothpicks"
      ]
    },
    {
      "name": "vitamin b12",
      "aliases": [
        "b12",
        "vitamin b",
        "b complex",
        "vitamin b complex"
      ]
    },
    {
      "name": "vitamin c",
      "aliases": [
        "vitamin c supplement",
        "ascorbic acid"
      ]
    },
    {
      "name": "vitamin d",
      "aliases": [
        "vitamin d3",
        "vitamin d supplement"
      ]
    },
    {
      "name": "vitamins",
      "aliases": [
        "vitamin"
      ]
    }
  ],
  "Pantry": [
    {
      "name": "almond butter",
      "aliases": [
        "almond butters"
      ]
    },
    {
      "name": "apple butter",
      "aliases": [
        "apple butters"
      ]
    },
    {
      "name": "apricot jam",
      "aliases": [
        "apricot preserves"
      ]
    },
    {
      "name": "au gratin potatoes",
      "aliases": [
        "boxed au gratin potatoes",
        "potatoes au gratin"
      ]
    },
    {
      "name": "banana chips",
      "aliases": [
        "dried banana",
        "dried bananas",
        "banana chip"
      ]
    },
    {
      "name": "beef bouillon",
      "aliases": [
        "beef bouillon cubes",
        "beef bouillon granules"
      ]
    },
    {
      "name": "beef stock",
      "aliases": [
        "beef stocks"
      ]
    },
    {
      "name": "blackberry jam",
      "aliases": [
        "blackberry preserves"
      ]
    },
    {
      "name": "bone broth",
      "aliases": [
        "bone broths"
      ]
    },
    {
      "name": "bouillon cube",
      "aliases": [
        "bouillon cubes",
        "bouillon",
        "stock cube",
        "stock cubes"
      ]
    },
    {
      "name": "bouillon paste",
      "aliases": [
        "soup base",
        "broth base",
        "bouillon base"
      ]
    },
    {
      "name": "boxed dinner kit",
      "aliases": [
        "skillet dinner kit",
        "hamburger helper",
        "skillet meal kit",
        "meal helper"
      ]
    },
    {
      "name": "brown gravy mix",
      "aliases": [
        "brown gravy"
      ]
    },
    {
      "name": "cashew butter",
      "aliases": [
        "cashew butters"
      ]
    },
    {
      "name": "chicken bouillon",
      "aliases": [
        "chicken bouillon cubes",
        "chicken bouillon granules"
      ]
    },
    {
      "name": "chicken gravy mix",
      "aliases": [
        "chicken gravy"
      ]
    },
    {
      "name": "chicken stock",
      "aliases": [
        "chicken stocks"
      ]
    },
    {
      "name": "chocolate hazelnut spread",
      "aliases": [
        "hazelnut spread",
        "chocolate spread",
        "nutella"
      ]
    },
    {
      "name": "cookie butter",
      "aliases": [
        "speculoos spread",
        "cookie spread",
        "biscoff spread"
      ]
    },
    {
      "name": "country gravy mix",
      "aliases": [
        "sausage gravy mix",
        "white gravy mix",
        "country gravy"
      ]
    },
    {
      "name": "currant",
      "aliases": [
        "currants",
        "dried currants",
        "zante currants"
      ]
    },
    {
      "name": "date",
      "aliases": [
        "dates",
        "medjool dates",
        "deglet dates",
        "pitted dates"
      ]
    },
    {
      "name": "dried apple",
      "aliases": [
        "dried apples",
        "apple chips"
      ]
    },
    {
      "name": "dried apricot",
      "aliases": [
        "dried apricots"
      ]
    },
    {
      "name": "dried blueberry",
      "aliases": [
        "dried blueberries"
      ]
    },
    {
      "name": "dried cherry",
      "aliases": [
        "dried cherries"
      ]
    },
    {
      "name": "dried cranberry",
      "aliases": [
        "dried cranberries",
        "craisins"
      ]
    },
    {
      "name": "dried fig",
      "aliases": [
        "dried figs"
      ]
    },
    {
      "name": "dried mango",
      "aliases": [
        "dried mangoes",
        "dried mangos"
      ]
    },
    {
      "name": "dried pineapple",
      "aliases": [
        "dried pineapples"
      ]
    },
    {
      "name": "flavored rice mix",
      "aliases": [
        "boxed rice mix",
        "rice side dish",
        "rice pilaf mix",
        "rice side"
      ]
    },
    {
      "name": "fruit preserves",
      "aliases": [
        "preserves"
      ]
    },
    {
      "name": "fruit spread",
      "aliases": [
        "fruit spreads",
        "fruit butter"
      ]
    },
    {
      "name": "golden raisin",
      "aliases": [
        "golden raisins",
        "sultana",
        "sultanas"
      ]
    },
    {
      "name": "grape jelly",
      "aliases": [
        "grape jam"
      ]
    },
    {
      "name": "gravy mix",
      "aliases": [
        "gravy packet",
        "gravy mixes"
      ]
    },
    {
      "name": "instant mashed potatoes",
      "aliases": [
        "mashed potato flakes",
        "instant potatoes",
        "potato flakes",
        "instant mashed potato"
      ]
    },
    {
      "name": "jam",
      "aliases": [
        "jams",
        "fruit jam"
      ]
    },
    {
      "name": "jelly",
      "aliases": [
        "jellies",
        "fruit jelly"
      ]
    },
    {
      "name": "macaroni and cheese",
      "aliases": [
        "mac and cheese",
        "boxed mac and cheese",
        "mac n cheese",
        "macaroni cheese"
      ]
    },
    {
      "name": "mixed dried fruit",
      "aliases": [
        "dried fruit mix",
        "dried fruit",
        "dried fruit medley"
      ]
    },
    {
      "name": "mixed nut butter",
      "aliases": [
        "nut butter",
        "nut butters"
      ]
    },
    {
      "name": "mushroom broth",
      "aliases": [
        "mushroom stock"
      ]
    },
    {
      "name": "orange marmalade",
      "aliases": [
        "marmalade"
      ]
    },
    {
      "name": "pasta side dish mix",
      "aliases": [
        "pasta side",
        "boxed pasta mix",
        "noodle side dish"
      ]
    },
    {
      "name": "peanut butter",
      "aliases": [
        "peanut butters",
        "pb",
        "creamy peanut butter",
        "crunchy peanut butter"
      ]
    },
    {
      "name": "powdered peanut butter",
      "aliases": [
        "peanut butter powder",
        "pb powder",
        "pb2"
      ]
    },
    {
      "name": "prune",
      "aliases": [
        "prunes",
        "dried plum",
        "dried plums"
      ]
    },
    {
      "name": "raisin",
      "aliases": [
        "raisins"
      ]
    },
    {
      "name": "raspberry jam",
      "aliases": [
        "raspberry preserves",
        "raspberry jelly"
      ]
    },
    {
      "name": "scalloped potatoes",
      "aliases": [
        "boxed scalloped potatoes",
        "scalloped potato mix"
      ]
    },
    {
      "name": "seafood stock",
      "aliases": [
        "fish stock",
        "fish broth",
        "seafood broth"
      ]
    },
    {
      "name": "strawberry jam",
      "aliases": [
        "strawberry preserves",
        "strawberry jelly"
      ]
    },
    {
      "name": "stuffing mix",
      "aliases": [
        "stuffing",
        "boxed stuffing",
        "dressing mix"
      ]
    },
    {
      "name": "sunflower seed butter",
      "aliases": [
        "sunflower butter",
        "sunbutter",
        "seed butter"
      ]
    },
    {
      "name": "turkey broth",
      "aliases": [
        "turkey stock"
      ]
    },
    {
      "name": "turkey gravy mix",
      "aliases": [
        "turkey gravy"
      ]
    },
    {
      "name": "vegetable bouillon",
      "aliases": [
        "veggie bouillon",
        "vegetable bouillon cubes"
      ]
    },
    {
      "name": "vegetable stock",
      "aliases": [
        "veggie stock"
      ]
    }
  ],
  "Other": []
};
