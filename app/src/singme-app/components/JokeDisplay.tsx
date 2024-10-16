import React, { useState, useEffect, useCallback } from 'react';

const jokes = [
    { question: "Why did the pianist keep banging his head against the keys?", answer: "He was playing by ear!" },
  { question: "What do you call a musician with problems?", answer: "A trebled man!" },
  { question: "Why couldn't the orchestra find their composer?", answer: "He was Haydn!" },
  { question: "What do you get when you drop a piano down a mine shaft?", answer: "A flat minor!" },
  { question: "Why did the fish make such a good musician?", answer: "Because he knew his scales!" },
  { question: "What kind of music are balloons afraid of?", answer: "Pop music!" },
  { question: "Why did the musician bring a ladder to the concert?", answer: "To reach the high notes!" },
  { question: "What do you call a cow who can play a musical instrument?", answer: "A moo-sician!" },
  { question: "Why was the music teacher not able to open his classroom?", answer: "Because his keys were on the piano!" },
  { question: "What do you call a rock star who loves sweets?", answer: "A Licorice Jett!" },
  { question: "Why did the band go to the gym?", answer: "To get their instruments in shape!" },
  { question: "What's an avocado's favorite kind of music?", answer: "Guac and roll!" },
  { question: "Why did the drummer get fired from the band?", answer: "He kept hitting on the lead singer!" },
  { question: "What do you call a bear with no teeth?", answer: "A gummy bear!" },
  { question: "Why don't scientists trust atoms?", answer: "Because they make up everything!" },
  { question: "What do you call a fake noodle?", answer: "An impasta!" },
  { question: "Why did the scarecrow win an award?", answer: "He was outstanding in his field!" },
  { question: "Why don't eggs tell jokes?", answer: "They'd crack each other up!" },
  { question: "What do you call a parade of rabbits hopping backwards?", answer: "A receding hare-line!" },
  { question: "Why did the math book look so sad?", answer: "Because it had too many problems!" },
  { question: "What do you call a can opener that doesn't work?", answer: "A can't opener!" },
  { question: "Why did the cookie go to the doctor?", answer: "Because it was feeling crumbly!" },
  { question: "What do you call a sleeping bull?", answer: "A bulldozer!" },
  { question: "Why did the bicycle fall over?", answer: "Because it was two-tired!" },
  { question: "Why don't oysters donate to charity?", answer: "Because they're shellfish!" },
  { question: "What do you call a fake stone in Ireland?", answer: "A sham rock!" },
  { question: "Why don't skeletons fight each other?", answer: "They don't have the guts!" },
  { question: "What do you call a boomerang that doesn't come back?", answer: "A stick!" },
  { question: "Why did the golfer bring two pairs of pants?", answer: "In case he got a hole in one!" },
  { question: "What do you call a bear with no ears?", answer: "B!" },
  { question: "Why did the gym close down?", answer: "It just didn't work out!" },
  { question: "What do you call a dog magician?", answer: "A labracadabrador!" },
  { question: "Why don't scientists trust stairs?", answer: "They're always up to something!" },
  { question: "What do you call a factory that makes okay products?", answer: "A satisfactory!" },
  { question: "What do you call a sleeping dinosaur?", answer: "A dino-snore!" },
  { question: "Why did the scarecrow become a successful politician?", answer: "He was outstanding in his field!" },
  { question: "What do you call a fake watch?", answer: "A sham-time piece!" },
  { question: "Why did the tomato blush?", answer: "Because it saw the salad dressing!" },
  { question: "What do you call a fake spaghetti?", answer: "An impasta!" },
  { question: "Why did the cookie go to the doctor?", answer: "It was feeling crumbly!" },
  { "question": "Why don’t skeletons fight each other?", "answer": "They don’t have the guts!" },
  { "question": "Why did the golfer bring two pairs of pants?", "answer": "In case he got a hole in one!" },
  { "question": "What do you call fake spaghetti?", "answer": "An impasta!" },
  { "question": "Why don’t some fish play basketball?", "answer": "Because they’re afraid of the net!" },
  { "question": "What do you call a bear with no ears?", "answer": "B!" },
  { "question": "What did the ocean say to the shore?", "answer": "Nothing, it just waved!" },
  { "question": "Why don’t eggs tell jokes?", "answer": "They might crack up!" },
  { "question": "Why couldn’t the bicycle stand up by itself?", "answer": "It was two-tired!" },
  { "question": "What’s orange and sounds like a parrot?", "answer": "A carrot!" },
  { "question": "Why was the math book sad?", "answer": "It had too many problems!" },
  { "question": "Why did the scarecrow win an award?", "answer": "Because he was outstanding in his field!" },
  { "question": "What do you call a snowman with a six-pack?", "answer": "An abdominal snowman!" },
  { "question": "Why did the coffee file a police report?", "answer": "It got mugged!" },
  { "question": "What do you call a belt made of watches?", "answer": "A waist of time!" },
  { "question": "How do you organize a space party?", "answer": "You planet!" },
  { "question": "Why did the cookie go to the doctor?", "answer": "It was feeling crummy!" },
  { "question": "Why are ghosts bad at lying?", "answer": "Because they are too transparent!" },
  { "question": "What kind of shoes do ninjas wear?", "answer": "Sneakers!" },
  { "question": "How does a penguin build its house?", "answer": "Igloos it together!" },
  { "question": "What do you call cheese that isn’t yours?", "answer": "Nacho cheese!" },
  { "question": "What did one hat say to the other?", "answer": "Stay here, I'm going on ahead!" },
  { "question": "What’s brown and sticky?", "answer": "A stick!" },
  { "question": "Why did the tomato turn red?", "answer": "Because it saw the salad dressing!" },
  { "question": "What do you call a factory that makes good products?", "answer": "A satisfactory!" },
  { "question": "Why can’t your nose be 12 inches long?", "answer": "Because then it would be a foot!" },
  { "question": "How do you make a tissue dance?", "answer": "Put a little boogie in it!" },
  { "question": "Why don’t oysters share their pearls?", "answer": "Because they’re shellfish!" },
  { "question": "What did the janitor say when he jumped out of the closet?", "answer": "Supplies!" },
  { "question": "Why did the bicycle fall over?", "answer": "It was two-tired!" },
  { "question": "Why don’t some couples go to the gym?", "answer": "Because some relationships don’t work out!" },
  { "question": "What kind of tree fits in your hand?", "answer": "A palm tree!" },
  { "question": "What do you call a sleeping bull?", "answer": "A bulldozer!" },
  { "question": "Why can’t you give Elsa a balloon?", "answer": "Because she will let it go!" },
  { "question": "Why are spiders great web developers?", "answer": "Because they know their way around the web!" },
  { "question": "Why did the man put his money in the blender?", "answer": "Because he wanted to make some liquid assets!" },
  { "question": "How do you catch a whole school of fish?", "answer": "With bookworms!" },
  { "question": "Why did the computer go to the doctor?", "answer": "Because it had a virus!" },
  { "question": "What’s brown and sounds like a bell?", "answer": "Dung!" },
  { "question": "Why did the stadium get hot?", "answer": "Because all the fans left!" },
  { "question": "Why don’t we ever tell secrets on a farm?", "answer": "Because the potatoes have eyes and the corn has ears!" },
  { "question": "Why do cows wear bells?", "answer": "Because their horns don’t work!" },
  { "question": "What did the traffic light say to the car?", "answer": "Don’t look, I’m changing!" },
  { "question": "Why couldn’t the pirate play cards?", "answer": "Because he was standing on the deck!" },
  { "question": "Why did the picture go to jail?", "answer": "Because it was framed!" },
  { "question": "What do you call a boomerang that doesn’t come back?", "answer": "A stick!" },
  { "question": "How do you throw a space party?", "answer": "You planet!" },
  { "question": "Why don’t melons get married?", "answer": "Because they cantaloupe!" },
  { "question": "What do you call an alligator in a vest?", "answer": "An investigator!" },
  { "question": "What did the grape do when it got stepped on?", "answer": "Nothing but let out a little wine!" },
  { "question": "Why did the belt go to jail?", "answer": "For holding up a pair of pants!" },
  { "question": "Why was the calendar always stressed?", "answer": "It had too many dates!" },
  { "question": "What do you call a bee that can’t make up its mind?", "answer": "A maybe!" },
  { "question": "Why don’t you ever see elephants hiding in trees?", "answer": "Because they’re so good at it!" },
  { "question": "What’s red and smells like blue paint?", "answer": "Red paint!" },
  { "question": "Why do fish always know how much they weigh?", "answer": "Because they have their own scales!" },
  { "question": "Why did the frog take the bus to work?", "answer": "Because his car got toad!" },
  { "question": "What do you get when you cross a snowman and a vampire?", "answer": "Frostbite!" },
  { "question": "Why are elevator jokes so good?", "answer": "Because they work on so many levels!" },
  { "question": "What does a cloud wear under his raincoat?", "answer": "Thunderwear!" },
  { "question": "Why are frogs so happy?", "answer": "Because they eat whatever bugs them!" },
  { "question": "Why couldn’t the leopard play hide and seek?", "answer": "Because he was always spotted!" },
  { "question": "What’s black and white and goes around and around?", "answer": "A penguin in a revolving door!" },
  { "question": "What’s the difference between a guitar and a fish?", "answer": "You can’t tuna fish!" },
  { "question": "Why can’t you hear a pterodactyl using the bathroom?", "answer": "Because the P is silent!" },
  { "question": "Why was the broom late?", "answer": "It swept in!" },
  { "question": "What do you call a pig that does karate?", "answer": "A pork chop!" },
  { "question": "Why do mushrooms love to party?", "answer": "Because they are fungi!" },
  { "question": "What’s green and sings?", "answer": "Elvis Parsley!" },
  { "question": "Why did the musician get kicked out of school?", "answer": "He couldn’t conduct himself!" },
  { "question": "Why did the chicken join a band?", "answer": "Because it had the drumsticks!" },
  { "question": "Why do we tell actors to break a leg?", "answer": "Because every play has a cast!" },
  { "question": "What’s a skeleton’s least favorite room in the house?", "answer": "The living room!" },
  { "question": "Why did the tree go to the dentist?", "answer": "It needed a root canal!" },
  { "question": "How does a cucumber become a pickle?", "answer": "It goes through a jarring experience!" },
  { "question": "Why don’t koalas count as bears?", "answer": "They don’t have the koalafications!" },
  { "question": "Why can’t basketball players go on vacation?", "answer": "They’d get called for traveling!" },
  { "question": "What’s orange and sleeps a lot?", "answer": "A carrot-bed!" },
  { "question": "Why was the math teacher suspicious?", "answer": "He was always calculating!" }
  ];


  const JokeDisplay: React.FC = () => {
    const [jokeIndex, setJokeIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
  
    const nextJoke = useCallback(() => {
      setJokeIndex((prevIndex) => (prevIndex + 1) % jokes.length);
      setShowAnswer(false);
    }, []);
  
    useEffect(() => {
      const interval = setInterval(() => {
        if (showAnswer) {
          nextJoke();
        } else {
          setShowAnswer(true);
        }
      }, 3500); // Change every 3.5 seconds
  
      return () => clearInterval(interval);
    }, [showAnswer, nextJoke]);
  
    const currentJoke = jokes[jokeIndex];
  
    return (
      <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
        <p className="text-lg font-semibold mb-2">🎶 We're tuning every note to perfection! 🎶</p>
        <p className="mb-4">
          Good things take time, and we're making sure your song gets the attention it deserves. Stay tuned while we fine-tune the magic!
        </p>
        <p className="text-sm italic">In the meantime, here's a joke:</p>
        <p className="mt-2 font-medium">{currentJoke.question}</p>
        {showAnswer && <p className="mt-2 font-bold">{currentJoke.answer}</p>}
      </div>
    );
  };

export default JokeDisplay;