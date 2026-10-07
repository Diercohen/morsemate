// Practice words per level. A word is only picked once every character in it is in play.

/** Level 1: letters. */
export const words1 = [
  'eat', 'tea', 'ate', 'tie', 'tai', 'tei', 'ait', 'mat', 'met', 'team', 'mate', 'meet', 'mitt',
  'meat', 'aim', 'tame', 'same', 'sat', 'sit', 'set', 'steam', 'teams', 'meats', 'meets', 'mates',
  'mats', 'ties', 'eats', 'aims', 'some', 'toss', 'time', 'mom', 'sometimes', 'osmosis', 'moss',
  'moose', 'tomato', 'home', 'hot', 'hat', 'ham', 'shoot', 'shot', 'mosh', 'mash', 'stash', 'hash',
  'home', 'homes', 'moth', 'math', 'the', 'son', 'nose', 'net', 'not', 'note', 'tent', 'someone',
  'mint', 'hint', 'stone', 'moan', 'honest', 'cat', 'come', 'can', 'mathematics', 'sonic', 'tonic',
  'chase', 'match', 'hatch', 'mooch', 'notch', 'cash', 'car', 'rat', 'rice', 'ear', 'racecar',
  'ran', 'cram', 'crash', 'harm', 'monitor', 'roam', 'runner', 'rutter', 'hotter', 'dad', 'date',
  'dot', 'dash', 'crashed', 'honed', 'minted', 'diminish', 'credit', 'honored', 'crush', 'minute',
  'dust', 'crust', 'crusade', 'crude', 'dock', 'make', 'rock', 'ruckus', 'crude', 'kook', 'rookie',
  'duck', 'crudite', 'hunk', 'think', 'shock', 'lake', 'let', 'land', 'lose', 'small', 'lost',
  'clock', 'lock', 'luck', 'lunch', 'drool', 'loud', 'angel', 'angle', 'llama', 'fake', 'fat',
  'fun', 'fur', 'fast', 'fluff', 'fluke', 'flustered', 'ruffle', 'duffle', 'bat', 'ball', 'but',
  'black', 'blast', 'back', 'backside', 'curb', 'basketball', 'baseball', 'ballet', 'bottle',
  'bumble', 'babble', 'better', 'rumble', 'pet', 'pal', 'help', 'up', 'plaster', 'crumple',
  'postmark', 'pretend', 'pub', 'lump', 'bump', 'dump', 'hump', 'prescribed', 'great', 'get',
  'game', 'gain', 'dog', 'big', 'gaping', 'paging', 'page', 'baggage', 'package', 'rampage', 'jump',
  'jet', 'juggle', 'jacket', 'jaguar', 'japan', 'jam', 'jetpack', 'jungle', 'van', 'vet', 'vacuum',
  'vacant', 'pave', 'vampire', 'volcano', 'question', 'quick', 'quit', 'quilt', 'quadratic',
  'quantum', 'quaint', 'query', 'quail', 'squat', 'squad', 'equal', 'with', 'water', 'wear', 'what',
  'weather', 'jaw', 'paw', 'weekend', 'week', 'wave', 'waffle', 'guffaw', 'beeswax', 'wax', 'tax',
  'apex', 'axel', 'flax', 'jinx', 'boxed', 'boxer', 'toxic', 'detox', 'exile', 'exit', 'very',
  'yes', 'jelly', 'jellyfish', 'walkway', 'yesterday', 'zipper', 'zebra', 'zigzag', 'zap', 'zoom',
  'buzz', 'waltz', 'gaze', 'fuzz', 'fuzzy', 'fizz', 'fizzy', 'dizzy', 'graze', 'zesty', 'razer',
  'brazil', 'maze', 'plaza', 'zone', 'jazz', 'zero', 'tee', 'tie', 'it', 'ite', 'eit', 'mat', 'met',
  'team', 'mate', 'meet', 'mitt', 'meat', 'aim', 'tame', 'mime', 'item', 'me', 'meta', 'time',
  'same', 'sat', 'sit', 'set', 'steam', 'teams', 'seem', 'seam', 'aims', 'eats', 'miss', 'mist',
  'esteem', 'steer', 'seat', 'some', 'toss', 'time', 'mom', 'sometimes', 'osmosis', 'moss', 'moose',
  'tomato', 'too', 'to', 'so', 'soot', 'moot', 'moat', 'miso', 'home', 'hot', 'hat', 'ham', 'shoot',
  'shot', 'mosh', 'mash', 'stash', 'hash', 'home', 'homes', 'moth', 'math', 'host', 'teeth',
  'seethe', 'hoot', 'hoist', 'heist', 'haste', 'soothe', 'oh', 'the', 'son', 'nose', 'net', 'not',
  'note', 'tent', 'someone',
]

/** Level 2: numbers. */
export const words2 = [
  '021', '012', '021', '210', '120', '301', '321', '301', '123', '401', '432', '421', '034', '501',
  '521', '502', '543', '532', '601', '634', '620', '615', '654', '612', '701', '746', '723', '701',
  '735', '762', '757', '801', '873', '825', '841', '802', '867', '846', '820', '901', '921', '932',
  '943', '954', '965', '976', '987', '989', '978', '987', '968', '968', '789', '879', '789', '798',
]

/** Level 3: punctuation (letters and digits in these do not count). */
export const words3 = [
  '1.2.', '3.4.', 'ok.', 'yes.', 'no.', 'hi.', 'bye.', 'pie.', '5.6.', '1,2,', '3,4,', 'a,b,',
  'c,d,', 'e,f,', '5,6,', 'g,h', 'hi,bye', 'dog?', 'food?', 'good?', 'happy?', 'sad?', 'no?',
  'love?', 'yes?', 'yo!', 'hi!', 'great!', 'jump!', 'hi.', 'yes!', '.?,!', 'ouch!', 'cat!',
  'call@3', '@pond!', '@gmail.', 'eat@4.', 'come@5.', "@ryan's.", "ben's.", "they're", "we're",
  "it's", "here's", "he's", "she's", "jack's", 'was:is', '1:1', '3:4', '8:00', '9:59', '7:8',
  '3:24', '4:11', '2:56', '1=1', '2=2', '1+1=2', '2+1=3', '3+2=5', '5+2=7', '9-8=1', 'red-blue',
  '7-5=2', '1-1=0', 'pb+jelly!', '8-5=3', '1+3-2=2', '4-3+5=6', '"hello"', '"rest"', '"pet."',
  '"up"', '"down."', '"ink;pen"', '"Man?"', 'ben:"hey!"', '(max', '(min', '(560(20', '(fox,bear',
  '(9+20', '(oxford?', '(syntax,', '(!true)', '(!false)', '(later)', '("above")', '(no?)',
  '(1+3)/4=1', '(den.)', '(x.2)', '(y/2k', '5/6', '2/2=1', '4/2=2', 'black/white', '8/2=4',
  '10/2=5', '1+3/3=2', '1/2', 'red/blue', 'ying/yang', 'yes/no', 'fox_1@gmail?', 'jim_dog.',
  'red_yellow', '123_', '9_11', '1.7-5', '17-9', '1,290-527', 'sugar-free', 'up-to-date',
  'twelve-pack', 'ken&jen', 'salt&pepper', 'sweet&salty', 'black&white', '1&2', '1&9', 'ones&zeros',
  'good/bad', '"dog&cat"', 'say;hi', 'hot/cold', 'today;he', 'hi/bye',
]
